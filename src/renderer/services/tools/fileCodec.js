import { deleteFile, readBinFile, writeFile } from "../../utils";
import { AESEncryptionService } from "./aes";
import { LZMASerivce } from "./lzma";
import { LZSSService } from "./lzss";

export class FileCodecService{

    /**
     * @typedef DecodeOptions
     * @property {string} inputFile
     * @property {string} outputFile
     * @property {{ key: string, iv: string }} aesConfig
     * @property {'lzma' | 'lzss'} compressionAlgo
     * 
     * @param {DecodeOptions} options 
     */
    static async Decode(options){
        const { inputFile, outputFile, aesConfig, compressionAlgo } = options
        let data = null
        const tmpFile = outputFile + '.tmp'

        if(compressionAlgo === 'lzma'){
            await LZMASerivce.DecompressFile(inputFile, tmpFile)
        }else if(compressionAlgo === 'lzss'){
            await LZSSService.DecompressFile(inputFile, tmpFile)
        }else{
            throw new Error('Unsupported comrpession alogrithm')
        }
        data = await readBinFile(tmpFile)
        await deleteFile(tmpFile)
        console.log(data)

        data = await AESEncryptionService.DecryptCBC(
            aesConfig.key,
            aesConfig.iv,
            data
        )
        
        await writeFile(outputFile, data)
    }
    
}