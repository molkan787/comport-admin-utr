import { readFile, writeFile, deleteFile } from '../../utils'
// import temp from 'temp'
import ExternalProgramsService from '../externalPrograms'

export class LZRBService{

    // /**
    //  * @param {Buffer} buffer 
    //  * @returns {Buffer}
    //  */
    // static async Compress(buffer){
    //     return await this._doAction('compress', buffer)
    // }

    // /**
    //  * @param {Buffer} buffer 
    //  * @returns {Buffer}
    //  */
    //  static async Decompress(buffer){
    //     return await this._doAction('decompress', buffer)
    // }

    // static async _doAction(action, buffer){
    //     var inFilename = temp.path()
    //     var outFilename = inFilename + '.out'
    //     await writeFile(inFilename, buffer)
    //     await ExternalProgramsService.lzrb(action, inFilename, outFilename)
    //     const outputBuffer = await readFile(outFilename)
    //     await Promise.all([
    //         deleteFile(inFilename),
    //         deleteFile(outFilename)
    //     ])
    //     return outputBuffer
    // }

    /**
     * 
     * @param {string} inFilename 
     * @param {string} outFilename 
     * @returns {Promise<void>}
     */
    static async CompressFile(inFilename, outFilename){
        await ExternalProgramsService.lzrb('compress', inFilename, outFilename)
    }

    /**
     * 
     * @param {string} inFilename 
     * @param {string} outFilename 
     * @returns {Promise<void>}
     */
     static async DecompressFile(inFilename, outFilename){
        await ExternalProgramsService.lzrb('decompress', inFilename, outFilename)
    }

}