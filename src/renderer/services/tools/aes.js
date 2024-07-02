import aesjs from 'aes-js'
import { readBinFile, writeFile } from '../../utils'

export class AESEncryptionService{

    /**
     * @typedef {{ key: aesjs.ByteSource | string, iv: aesjs.ByteSource | string, inFilename: string, outFilename: string }} Params
     */

    /**
     * @param {Params} params 
     * @returns {Promise<void>}
     */
    static async EncryptFileCBC({ key, iv, inFilename, outFilename }){
        const data = await readBinFile(inFilename)
        const encryptedData = this.EncryptCBC(key, iv, data)
        await writeFile(outFilename, encryptedData)
    }
    
    /**
     * @param {Params} params 
     * @returns {Promise<void>}
     */
     static async DecryptFileCBC({ key, iv, inFilename, outFilename }){
        const data = await readBinFile(inFilename)
        const decryptedData = this.DecryptCBC(key, iv, data)
        await writeFile(outFilename, decryptedData)
    }

    /**
     * 
     * @param {aesjs.ByteSource | string} key 
     * @param {aesjs.ByteSource | string} iv 
     * @param {aesjs.ByteSource} data 
     * @returns {Uint8Array}
     */
    static EncryptCBC(key, iv, data){
        if(typeof key === 'string') key = aesjs.utils.hex.toBytes(key)
        if(typeof iv === 'string') iv = aesjs.utils.hex.toBytes(iv)
        const aesCBC = new aesjs.ModeOfOperation.cbc(key, iv)
        return aesCBC.encrypt(data)
    }

    /**
     * 
     * @param {aesjs.ByteSource | string} key 
     * @param {aesjs.ByteSource | string} iv 
     * @param {aesjs.ByteSource} data 
     * @returns {Uint8Array}
     */
     static DecryptCBC(key, iv, data){
        if(typeof key === 'string') key = aesjs.utils.hex.toBytes(key)
        if(typeof iv === 'string') iv = aesjs.utils.hex.toBytes(iv)
        const aesCBC = new aesjs.ModeOfOperation.cbc(key, iv)
        return aesCBC.decrypt(data)
    }

}