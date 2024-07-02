import ExternalProgramsService, { EPActions } from '../externalPrograms'

export class LZSSService{

    /**
     * 
     * @param {string} inFilename 
     * @param {string} outFilename 
     * @returns {Promise<void>}
     */
    static async CompressFile(inFilename, outFilename){
        await ExternalProgramsService.lzss(EPActions.Compress, inFilename, outFilename)
    }

    /**
     * 
     * @param {string} inFilename 
     * @param {string} outFilename 
     * @returns {Promise<void>}
     */
     static async DecompressFile(inFilename, outFilename){
        await ExternalProgramsService.lzss(EPActions.Decompress, inFilename, outFilename)
    }

}