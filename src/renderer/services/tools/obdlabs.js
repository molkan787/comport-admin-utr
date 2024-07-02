import { readBinFile, writeFile } from "../../utils";
import { RemoteAxios } from "../remoteAxios";
import path from 'path';
import store from '../../store'

export class OBDLabsService{

    /**
     * @typedef {Object} GetSecurityAccessKeyOptions
     * @property {number} level
     * @property {string} seed Seed bytes in hex string
     * @property {string} deviceType
     * @property {string} bootloaderVersionHex (Optional)
     * @param {GetSecurityAccessKeyOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<string>}
     */
    static async GetSecurityAccessKey(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const url = this._url('security-access')
        const response = await RemoteAxios.post(url, {
            level: options.level,
            seed: options.seed,
            deviceType: options.deviceType,
            bootloaderVersionHex: options.bootloaderVersionHex
        })
        const keyHex = response.key.toString(16)
        return keyHex.padStart(8, '0')
    }

    /**
     * @typedef {Object} CalculateSignatureOptions 
     * @property {string} fileName
     * @property {string} deviceType
     * @property {string} fileType
     * @param {CalculateSignatureOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<string>}
     */
    static async CalculateSignature(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const url = this._url('calculate-signature')
        const response = await RemoteAxios.post(url, {
            deviceType: options.deviceType,
            fileName: options.fileName,
            fileType: options.fileType
        })
        return response.signature
    }

    /**
     * @typedef {Object} ExtractMemoryBlocksOptions 
     * @property {string} fileName
     * @property {string} deviceType
     * @property {string} outputDirectory
     * @param {ExtractMemoryBlocksOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<string[]>}
     */
    static async ExtractMemoryBlocks(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const url = this._url('extract-memory-blocks')
        const response = await RemoteAxios.post(url, {
            fileName: options.fileName,
            deviceType: options.deviceType
        })
        const { blocks } = response
        for(let block of blocks){
            const filename = path.join(options.outputDirectory, block.filename)
            const data = Buffer.from(block.blockDump, 'hex')
            await writeFile(filename, data)
        }
        const names = blocks.map(b => b.filename)
        return names
    }

    /**
     * @typedef {Object} GetResellerFilesOptions 
     * @property {string} deviceType
     * @param {GetResellerFilesOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<any[]>}
     */
    static async GetResellerFiles(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const url = this._url(`v1/resellers/files?deviceType=${options.deviceType}`)
        const response = await RemoteAxios.get(url)
        return response
    }

    /**
     * @typedef {Object} PatchFileOptions 
     * @property {string} deviceType
     * @property {string} memoryLayout
     * @property {string} fileType
     * @property {string} inputFilename
     * @property {string} outputFilename
     * @param {PatchFileOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<void>}
     */
    static async PatchFile(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const fileData = await readBinFile(options.inputFilename)
        const endpoint = this._url('patch-file')
        const response = await RemoteAxios.post(endpoint, {
            deviceType: options.deviceType,
            memoryLayout: options.memoryLayout,
            fileType: options.fileType,
            input: fileData.toString('hex')
        })
        const { output } = response;
        const outputBuffer = Buffer.from(output, 'hex')
        await writeFile(options.outputFilename, outputBuffer)
    }

    /**
     * @typedef {Object} CalculateAndPatchChecksumOptions 
     * @property {string} deviceType
     * @property {string} memoryLayout
     * @property {string} fileType
     * @property {number} crcTableOffset
     * @property {string} inputFilename
     * @property {string} outputFilename
     * @param {CalculateAndPatchChecksumOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<void>}
     */
    static async CalculateAndPatchChecksum(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)

        const fileData = await readBinFile(options.inputFilename)
        const endpoint = this._url('calculate-checksum')
        const response = await RemoteAxios.post(endpoint, {
            deviceType: options.deviceType,
            memoryLayout: options.memoryLayout,
            fileType: options.fileType,
            crcTableOffset: options.crcTableOffset,
            input: fileData.toString('hex')
        })
        const { checksum: numChecksum } = response;
        const correction = Buffer.alloc(4)
        correction.writeInt32BE(numChecksum)
        const patchOffset = options.crcTableOffset + 4;
        correction.copy(fileData, patchOffset, 0, 4)
        await writeFile(options.outputFilename, fileData)
    }

    
    /**
     * @typedef {Object} CalculateChecksumOptions 
     * @property {string} deviceType
     * @property {string} memoryLayout
     * @property {string} fileType
     * @property {number} crcTableOffset
     * @property {Buffer} inputData
     * @param {CalculateChecksumOptions} options 
     * @returns {Promise<number>}
     */
     static async CalculateChecksum(options){
        await this.tryPrepareAuthAccess()

        const endpoint = this._url('calculate-checksum')
        const response = await RemoteAxios.post(endpoint, {
            deviceType: options.deviceType,
            memoryLayout: options.memoryLayout,
            fileType: options.fileType,
            crcTableOffset: options.crcTableOffset,
            input: options.inputData.toString('hex')
        })
        const { checksum: numChecksum } = response;
        return numChecksum
        // const checksum = Buffer.alloc(4)
        // checksum.writeInt32BE(numChecksum)
        // return checksum
    }

    /**
     * @typedef {Object} CalculateSwitchOverOptions
     * @property {string} deviceType
     * @property {string} serialNumber
     * 
     * @param {CalculateSwitchOverOptions} options 
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<string>}
     */
    static async CalculateSwitchOver(options, loginInfo){
        await this.tryPrepareAuthAccess(loginInfo)
        
        const { switchOver } = await RemoteAxios.post(this._url('calculate-switch-over'), {
            deviceType: options.deviceType,
            serialNumber: options.serialNumber
        }, {
            headers: {
                'x-portal-secret': this.portalSecret
            }
        })
        return switchOver
    }

    /**
     * @typedef CompressFileOptions
     * @property {string} inFilename
     * @property {string} outFilename
     * @property {string} deviceType
     * @param {CompressFileOptions} options 
     */
    static async CompressFile(options){
        await this.tryPrepareAuthAccess()

        const inputData = await readBinFile(options.inFilename)
        const { output } = await RemoteAxios.post(this._url('compress-file'), {
            deviceType: options.deviceType,
            input: inputData.toString('hex')
        })
        const outputData = Buffer.from(output, 'hex')
        await writeFile(options.outFilename, outputData)
    }
    
    /**
     * @typedef CompressFileV0Options
     * @property {string} fileName
     * @property {string} deviceType
     * @property {string} outFilename
     * @param {CompressFileV0Options} options 
     */
     static async CompressFileV0(options){
        await this.tryPrepareAuthAccess()

        const { output } = await RemoteAxios.post(this._url('v0/compress-file'), {
            deviceType: options.deviceType,
            fileName: options.fileName
        })
        const outputData = Buffer.from(output, 'hex')
        await writeFile(options.outFilename, outputData)
    }

    /**
     * @typedef PatchAndCompressResellerFileOptions
     * @property {string} fileName
     * @property {string} fileType
     * @property {string} deviceType
     * @property {string} memoryLayout
     * @property {string} outFilename
     * @param {PatchAndCompressResellerFileOptions} options 
     */
    static async PatchAndCompressResellerFile(options){
        await this.tryPrepareAuthAccess()

        const { fileName, fileType, deviceType, memoryLayout, outFilename } = options
        const { output } = await RemoteAxios.post(this._url('perform-function'), {
            functionType: 'patchAndCompressResellerFile',
            fileName,
            fileType,
            deviceType,
            memoryLayout
        })
        const outputData = Buffer.from(output, 'hex')
        await writeFile(outFilename, outputData)
    }

    /**
     * @param {Buffer} input 
     * @param {string} fileType 
     * @returns {Promise<{ crc: number, calculatedCrc: number }>}
     */
    static async VGS4NAG2_readAndCalculateChecksum(input, fileType){
        const crcTableOffset = this.VGS4NAG2_determineCrcTableOffset(fileType)
        const crc = input.readUInt32BE(crcTableOffset)
        const calculatedCrc = await this.CalculateChecksum({
            deviceType: 'vgs4nag2',
            fileType: fileType,
            crcTableOffset: crcTableOffset,
            inputData: input
        })
        return {
            crc,
            calculatedCrc
        }
    }

    static VGS4NAG2_patchChecksum(input, fileType, calculatedCrc){
        const calculatedCrcBuffer = Buffer.alloc(4)
        calculatedCrcBuffer.writeUInt32BE(calculatedCrc, 0)
        const crcTableOffset = this.VGS4NAG2_determineCrcTableOffset(fileType)
        input[crcTableOffset] = calculatedCrcBuffer[0]
        input[crcTableOffset + 1] = calculatedCrcBuffer[1]
        input[crcTableOffset + 2] = calculatedCrcBuffer[2]
        input[crcTableOffset + 3] = calculatedCrcBuffer[3]
    }

    /**
     * @private
     * @param {string} fileType 
     * @returns {number}
     */
    static VGS4NAG2_determineCrcTableOffset(fileType) {
        // format: CRC unk1 start end
        if (fileType === 'calibration') {
          return 0x404
        } else {
          throw new Error('Unknown file type')
        }
      }
      

    // ----------------------------------------------------
    
    /**
     * @typedef {Object} LoginInfo
     * @property {string} username
     * @property {string} password
     */

    /**
     * @private
     * @param {LoginInfo?} loginInfo 
     * @returns {Promise<void>}
     */
    static async tryPrepareAuthAccess(loginInfo){
        RemoteAxios.setProxy(store.state.obdLabs.proxy)
        // if(typeof loginInfo == 'object' && loginInfo !== null){
        //     await this.prepareAuthAccess(loginInfo)
        // }else{
        //     await this.prepareAuthAccess(store.state.obdLabs.loginInfo)
        // }
    }

    static async getMyIP(){
        await this.tryPrepareAuthAccess()
        const data = await RemoteAxios.get('https://api.amrcomport.com:9086/get-my-ip')
        return data
    }

    /**
     * @private
     * @param {LoginInfo} loginInfo 
     * @returns {Promise<void>}
     */
    static async prepareAuthAccess(loginInfo){
        const isAuthenticated = await this.isAuthenticated()
        if(!isAuthenticated){
            await this.login(loginInfo.username, loginInfo.password)
        }
    }

    static async login(username, password){
        await RemoteAxios.post(this._url('login'), {
            email: username,
            password: password,
            redirect: false
        })
    }

    static async isAuthenticated(){
        try {
            const { data } = await RemoteAxios.get(this._url('self'))
            return typeof data.userId === 'number'
        } catch (error) {
            return false
        }
    }


    /**
     * @private
     */
    static get portalSecret(){
        return '983ae502-0c74-4d63-b2d8-0a4c205d1abc'
    }

    /**
     * @private
     */
    static get _baseApiUrl(){
        return 'https://app.obdlabs.net/api/'
        // return 'http://localhost:3000/api/'
    }

    /**
     * @private
     * @param {string} path 
     * @returns {string}
     */
    static _url(path){
        return this._baseApiUrl + path;
    }

}