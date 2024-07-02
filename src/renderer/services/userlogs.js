import { Uint64LE } from 'int64-buffer'
import axios from 'axios'
import fs from 'fs'
import readline from 'readline'
import { largePush, sleep, writeFile } from '../utils'
import NodeRSA from 'node-rsa'

export default class UserLogsService{

    /**
     * @param {string} userId
     * @returns {Promise}
     */
    static async ClearLogs(userId){
        await axios.delete(`admin/userlogs/${userId}`)
    }

    /**
     * @param {string} userId
     * @param {number} count
     * @param {string} after
     * @returns {Promise<{items: LogItem[], lastGroupKey?: string}>}
     */
    static async GetLogs(userId, count, after){
        const { data } = await axios.get(`admin/userlogs/${userId}`, {
            params: {
                count,
                after
            },
            responseType: 'text',
            transformResponse: []
        })
        const lines = data.split('\n')
        const metadata = JSON.parse(lines.pop())
        const logs = {
            ...metadata,
            items: this.ProcessLogsItems(lines.map(item => this.ParseLogItem(item)))
        }
        return logs
    }

    /**
     * @param {string} userId
     * @param {number} count
     * @param {string} after
     * @returns {Promise<{items: LogItem[], lastGroupKey?: string}>}
     */
     static async GetRawLogs(userId, count, after){
        const { data } = await axios.get(`admin/userlogs/${userId}`, {
            params: {
                count,
                after
            },
            responseType: 'text',
            transformResponse: []
        })
        const lines = data.split('\n')
        const metadata = JSON.parse(lines.pop())
        const logs = {
            ...metadata,
            items: lines
        }
        return logs
    }


    /**
     * @param {string} userId 
     * @param {Date} startDate 
     * @returns {Promise<{items:LogItem[],lastGroupKey:string}>}
     */
    static async GetLogsDateRange(userId, startDate){
        const result = []
        let after = undefined
        while(true){
            const { items, lastGroupKey } = await this.GetLogs(userId, 72, after)
            if(lastGroupKey) after = lastGroupKey
            largePush(items, result)
            const lastItem = items[items.length - 1]
            if(!lastItem || (lastItem.time < startDate.getTime())){
                break
            }
        }
        return {
            lastGroupKey: after,
            items: result
        }
    }

    /**
     * Downloads user logs of a date range and save them to a local filesystem's file
     * @param {string} userId 
     * @param {Date} startDate 
     * @param {fs.PathLike} saveFilename 
     * @returns {Promise<void>}
     */
    static async DownloadLogsDateRange(userId, startDate, saveFilename){
        const logs = await this.GetLogsDateRange(userId, startDate)
        const logsString = logs.items.reverse().map(item => this.TextifyLogItem(item)).join('\n')
        await writeFile(saveFilename, logsString)
    }

    /**
     * @param {string} filename 
     */
    static async LoadLogsFromFile(filename){
        const decryptor = this._GetDecryptor()
        const readStream = fs.createReadStream(filename)
        const rl = readline.createInterface({
            input: readStream,
            crlfDelay: Infinity
        })
        const items= []
        let iter = 0
        for await (const line of rl) {
            const decrypted = decryptor.decrypt(line)
            const item = this.ParseLogItem(decrypted)
            items.push(item)
            if(iter++ % 10 === 0){
                console.log('sleep')
                await sleep(1)
            }
        }
        return this.ProcessLogsItems(items)
    }

    /**
     * @typedef {ReturnType<UserLogsService.ParseLogItem>} LogItem
     * @param {string | Buffer} log raw log string in base64 encoding
     */
    static ParseLogItem(log){
        const bin = Buffer.isBuffer(log) ? log : Buffer.from(log, 'base64')
        const timestampMillis = new Uint64LE(bin).toNumber()
        const logType = bin[8]
        const data = bin.slice(9).toString('utf8')
        return {
            time: timestampMillis,
            logType,
            data
        }
    }

    /**
     * Convert log item object to a plain text representation
     * @param {LogItem} log 
     * @returns {string}
     */
    static TextifyLogItem(log){
        const date = new Date(log.time)
        const data = typeof log.data == 'object' ? JSON.stringify(log.data) : log.data
        return `${date.toLocaleString()} ${data}`
    }

    /**
     * 
     * @param {LogItem[]} items 
     */
    static ProcessLogsItems(items){
        const len = items.length
        for(let i = 0; i < len; i++){
            const item = items[i]
            if(item.logType >= 4){
                item.originData = item.data
                item.data = JSON.parse(item.data)
            }
        }
        return items
    }

    /**
     * 
     * @param {LogItem} items 
     */
     static ProcessLogsItem(item){
        if(item.logType >= 4){
            item.originData = item.data
            item.data = JSON.parse(item.data)
        }
        return item
    }

    static _GetDecryptor(){
        const key = new NodeRSA({b: 512});
        key.importKey({
            n: Buffer.from('d00790152c54138935cd9c6b1fb1fe4f3e9fdbfa6e07aacb40ace5ebf1bd501bef4b1a11fc5989e7a30798e45aef3748d002895f1bf8ba54ba5cb22e36cdfb717e7752104f7d39da8e2f1da8c8c9640d2cdc84ecbf938186ace1e52c6eb4351839f21107271537b64afe55b69bb7a8021494b6ca621bd57d32fe6e5232be664e64611c8668c512412c5b938be7b25faf8b702f2f17ade8c69c25c9a61609ae1f35a39c386380eead87633ba5b568a24071ef729c7e97d058007677df4183bbd9b742af5d69911414d9af10b8d2050066054fb4626da59ed3b07f80b927add208cd80d5f4635c0d2a8c28ab50790000469218e6899b71a69c9574d1ea606148e9', 'hex'),
            e: Buffer.from('010001', 'hex'),
            d: Buffer.from('87618498e2e24c5c6d11440c4af231082d3f278f906f98ecf14813d13adef2f55b034b120d61cfe75927a68e65c76bf90cb5b9e4957586fd80d2b67a70dc1818c22eb0cf408bc44cc15f5433f5876a7f5084aa54d05014692ab54fc95cba161b900a429e9f06a5dd126cf62702abc0c0a9d826250b3805f5966c122b982e64b0cf2194acb5dec57e9de8cfd765446a0c9427a4f39bdfcfc9b426553ba751ad882dc52f90a99cb9c7bc8b3f01658d07eb085ee0e048cfe585a402aafdcbc1746a5902af14103d6b17ea09f168990fa63296af1ff5f1e1e28deddf177ff91246132c46069d294757fd329f295204fcf5887815c34eb5e9780ddfff99d5dc0a9c89', 'hex'),
            p: Buffer.from('e23d601a4421022b6078354bba7f40d001a13d15ad2976f394bb3d707566b8d6f9fa75eb64017a91c601e57957ed76c07a26474185774376a88a01cf8e04a890ae079b719f769827ee9349ee709ef091e80033f6b9c26b042816b67a3b35a6f72f973dc4bac04f0a71fc8c7722d06ba03d2824f206146a93d44f911c8edbfb07', 'hex'),
            q: Buffer.from('eb64f56b40630676079432e0626dfbd3571f8cf0b4068a9deebf107d3e8092540fd5defe6b977d96dfa04aba9e0d4217a2282abf86bbbeb3d6239de0cb5aad141c5f3f56683e8cd8155da95d228d7a48e40cc694ea6d037b1d025eaa5696e1a0a06a0d2406d79727a959a170deb8a8b99a0398608f033c4d5f7a7fdb18ab708f', 'hex'),
            dmp1: Buffer.from('a21608c928b061668459fb0d03537232d4481984732836e1b258275f6fad259657483abd674babedce67c3691936b7129530e1722ed5d04eadd71a0f029791d0fdedd34f2749071feccc37768dd74151b75e95dc1920121dcb3ee28355f24d69e0fdc13235fddb630761419d8522bf48f127d6b852e4c3aa9fbc55a199343f77', 'hex'),
            dmq1: Buffer.from('b1029052806e76b356eba87e774601726137868292bdc08b16b772acdbcd4f3c0b546685a75e99c0549572dc7671bddb8bc2ecb26d9cccc0eb2c89523b590a81eefbe8e30f2cca38cb884d0d8e281966aaa6b8c5ceaaff4d1af9673a6c36b5a05640a97507f822e05e46da51c809d047117bd69ff5ab17338fb2cc66735ca81d', 'hex'),
            coeff: Buffer.from('aa72f814317af68b52a184250b62c9ef04865fbf700a4394afa2bf5484bb512b974d51e001946368e7ecf8962199e25236f4410363b34f8e5427300ed73548f5f99d2ec897d6499b23ad4de66d1103b8f59d90d7e23a9f43bdc25d1459ecc8e66462ba7442361900213a9f40eb0b7906c2194493b3420b42b2db2dd5b918767a', 'hex')
        }, 'components');
        return key
    }

}

export const LogType = Object.freeze({
    Info: 1,
    Error: 2,
    UserActivity: 3,
    ApiCall: 4,
    DataLog: 5,
    MethodCallStart: 6,
    MethodCallEnd: 7,
})

window.UserLogsService = UserLogsService