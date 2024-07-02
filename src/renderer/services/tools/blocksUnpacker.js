import mkdirp from 'mkdirp'
import path from 'path'
import { deleteFile, readBinFile, writeFile } from '../../utils'
import { AESEncryptionService } from './aes'
import { LZRBService } from './lzrb'
import { LZSSService } from './lzss'

export const DECOMPRESSION_ALGORITHMS = Object.freeze({
    LZRB: 'lzrb',
    LZSS: 'lzss'
})
export const PADDING_TYPES = Object.freeze({
    LENGTH_BASED_BYTE: 'length_based_byte',
    EXACT_BYTE: 'exact_byte'
})

export class BlocksUnpackerService{

    /**
     * @typedef {{ AesKey: string, AesIV: string }} DecryptionConfig
     * @typedef {{ Algorithm: (typeof DECOMPRESSION_ALGORITHMS)[keyof typeof DECOMPRESSION_ALGORITHMS] }} DecompressionConfig
     * @typedef {{ Type: (typeof PADDING_TYPES)[keyof typeof PADDING_TYPES], ExactByte: number }} PaddingConfig
     * 
     * @typedef {object} UnpackMultiplePayload
     * @property {string[]} InputFiles
     * @property {string} OutputDirectory
     * @property {DecryptionConfig} DecryptionConfig
     * @property {DecompressionConfig} DecompressionConfig
     * @property {PaddingConfig} PaddingConfig
     * 
     * @typedef {object} UnpackSinglePayload
     * @property {string} InputFilename
     * @property {string} OutputFilename
     * @property {DecryptionConfig} DecryptionConfig
     * @property {DecompressionConfig} DecompressionConfig
     * @property {PaddingConfig} PaddingConfig
     */

    /**
     * @param {UnpackMultiplePayload} payload
     */
    static async UnpackMultipleFiles(payload){
        const { InputFiles, OutputDirectory, DecryptionConfig, DecompressionConfig, PaddingConfig } = payload
        await mkdirp(OutputDirectory)
        for(let inputFile of InputFiles){
            const inputFileBasename = path.basename(inputFile)
            const outputFile = path.join(OutputDirectory, inputFileBasename + '.unpacked')
            await this.UnpackFile({
                InputFilename: inputFile,
                OutputFilename: outputFile,
                DecryptionConfig: DecryptionConfig,
                DecompressionConfig: DecompressionConfig,
                PaddingConfig: PaddingConfig
            })
        }
    }

    /**
     * @param {UnpackSinglePayload} payload 
     */
    static async UnpackFile(payload){
        const { InputFilename, OutputFilename, DecryptionConfig, DecompressionConfig, PaddingConfig } = payload
        const packedData = await readBinFile(InputFilename)
        const decryptedData = await AESEncryptionService.DecryptCBC(
            DecryptionConfig.AesKey,
            DecryptionConfig.AesIV,
            packedData
        )

        const unpaddedData = this.RemovePadding(decryptedData, PaddingConfig)
        const tmpFilename = InputFilename + '.tmp'
        await writeFile(tmpFilename, unpaddedData)

        if(DecompressionConfig.Algorithm === DECOMPRESSION_ALGORITHMS.LZRB){
            await LZRBService.DecompressFile(tmpFilename, OutputFilename)
        }else if(DecompressionConfig.Algorithm === DECOMPRESSION_ALGORITHMS.LZSS){
            await LZSSService.DecompressFile(tmpFilename, OutputFilename)
        }else{
            throw new Error(`Unknow decompression algorithm '${DecompressionConfig.Algorithm}'`)
        }
        await deleteFile(tmpFilename)
    }

    /**
     * @private
     * @param {Buffer} data 
     * @param {PaddingConfig} paddingConfig 
     */
    static RemovePadding(data, paddingConfig){
        const { Type, ExactByte } = paddingConfig
        if(Type === PADDING_TYPES.LENGTH_BASED_BYTE){
            const padLength = data[data.length - 1]
            if(padLength < 2) return data
            var paddingBuffer = Buffer.from(data.slice(data.length - padLength))
            const padding = paddingBuffer.toJSON().data
            const check = Math.max(...padding.map(b => b === padLength ? 0 : 1))
            if(check === 0){ // all bytes matches
                return data.slice(0, data.length - padLength)
            }else{
                throw new Error('Could not detect length based padding.')
            }
        }else if(Type === PADDING_TYPES.EXACT_BYTE){
            let padLength = 0
            for(let i = 0; i < 16; i++){
                const byte = data[data.length - 1 - i]
                if(byte === ExactByte){
                    padLength++
                }else{
                    break
                }
            }
            if(padLength > 0){
                return data.slice(0, data.length - padLength)
            }else{
                return data
            }
        }else{
            throw new Error(`Unknow padding type '${Type}'`)
        }
    }


    /**
     * @typedef {{ AesKey: string, AesIV: string }} EncryptionConfig
     * @typedef {{ Algorithm: (typeof DECOMPRESSION_ALGORITHMS)[keyof typeof DECOMPRESSION_ALGORITHMS] }} CompressionConfig
     * 
     * @typedef {object} PackMultiplePayload
     * @property {string[]} InputFiles
     * @property {string} OutputDirectory
     * @property {EncryptionConfig} EncryptionConfig
     * @property {CompressionConfig} CompressionConfig
     * @property {PaddingConfig} PaddingConfig
     * 
     * @typedef {object} PackSinglePayload
     * @property {string} InputFilename
     * @property {string} OutputFilename
     * @property {EncryptionConfig} EncryptionConfig
     * @property {CompressionConfig} CompressionConfig
     * @property {PaddingConfig} PaddingConfig
     */

    /**
     * @param {PackMultiplePayload} payload
     */
    static async PackMultipleFiles(payload){
        const { InputFiles, OutputDirectory, EncryptionConfig, CompressionConfig, PaddingConfig } = payload
        await mkdirp(OutputDirectory)
        for(let inputFile of InputFiles){
            const inputFileBasename = path.basename(inputFile)
            const outputFile = path.join(OutputDirectory, inputFileBasename + '.packed')
            await this.PackFile({
                InputFilename: inputFile,
                OutputFilename: outputFile,
                EncryptionConfig: EncryptionConfig,
                CompressionConfig: CompressionConfig,
                PaddingConfig: PaddingConfig
            })
        }
    }

    /**
     * @param {PackSinglePayload} payload
     */
    static async PackFile(payload){
        const { CompressionConfig, PaddingConfig, EncryptionConfig, InputFilename, OutputFilename } = payload
        const tmpFilename = InputFilename + '.tmp'
        if(CompressionConfig.Algorithm === DECOMPRESSION_ALGORITHMS.LZRB){
            await LZRBService.CompressFile(InputFilename, tmpFilename)
        }else if(CompressionConfig.Algorithm === DECOMPRESSION_ALGORITHMS.LZSS){
            await LZSSService.CompressFile(InputFilename, tmpFilename)
        }else{
            throw new Error(`Unknow compression algorithm '${CompressionConfig.Algorithm}'`)
        }
        const compressedData = await readBinFile(tmpFilename)
        await deleteFile(tmpFilename)

        const lastFrameSize = compressedData.length % 16
        const paddingLength = lastFrameSize > 0 ? (16 - lastFrameSize) : 0
        let padding = Buffer.alloc(paddingLength);
        if(PaddingConfig.Type === PADDING_TYPES.EXACT_BYTE){
            padding.fill(PaddingConfig.ExactByte)
        }else if(PaddingConfig.Type === PADDING_TYPES.LENGTH_BASED_BYTE){
            padding.fill(paddingLength & 0xFF)
        }
        const paddedData = Buffer.concat([compressedData, padding])

        const encryptedData = await AESEncryptionService.EncryptCBC(
            EncryptionConfig.AesKey,
            EncryptionConfig.AesIV,
            paddedData
        )

        await writeFile(OutputFilename, encryptedData)
    }

}