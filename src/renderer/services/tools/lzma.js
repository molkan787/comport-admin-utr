import lzma from 'lzma-native'
import fs  from 'fs'

export class LZMASerivce{

    /**
     * @public
     * @param {string} inputFilename 
     * @param {string} outputFilename 
     * @returns {Promise<void>}
     */
    static CompressFile(inputFilename, outputFilename){
        const compressor = lzma.createCompressor();
        return this.DoWork(inputFilename, outputFilename, compressor)
    }
    
    /**
     * @public
     * @param {string} inputFilename 
     * @param {string} outputFilename 
     * @returns {Promise<void>}
     */
    static DecompressFile(inputFilename, outputFilename){
        const decompressor = lzma.createDecompressor();
        return this.DoWork(inputFilename, outputFilename, decompressor)
    }

    /**
     * @private
     * @param {string} inputFilename 
     * @param {string} outputFilename 
     * @param {import('lzma-native').JSLzmaStream} processor 
     */
    static DoWork(inputFilename, outputFilename, processor){
        return new Promise((resolve, reject) => {
            const input = fs.createReadStream(inputFilename);
            const output = fs.createWriteStream(outputFilename);
            input.on('error', reject)
            output.on('error', reject)
            processor.on('error', reject)
            output.on('finish', () => {
                processor.destroy()
                resolve()
            })
            input.pipe(processor).pipe(output);
        })
    }

    /**
     * @param {Buffer | string} data 
     * @returns {Promise<Buffer>}
     */
    static Compress(data){
        return new Promise((resolve) => {
            lzma.compress(data, undefined, result => resolve(result))
        })
    }
    

    /**
     * @param {Buffer | string} data 
     * @returns {Promise<Buffer>}
     */
     static Decompress(data){
        return new Promise((resolve) => {
            lzma.decompress(data, undefined, result => resolve(result))
        })
    }

}