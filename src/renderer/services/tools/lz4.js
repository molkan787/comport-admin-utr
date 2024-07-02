import ExternalProgramsService from "../externalPrograms";

export class LZ4Service{

    /**
     * Compress file using LZ4 Algorithm
     * @param {string} inputFilename 
     * @param {string} outputFilename 
     */
    static async CompressFile(inputFilename, outputFilename){
        await ExternalProgramsService.LZ4Client('compress', inputFilename, outputFilename)
    }

    /**
     * Decompress file previously compressed using LZ4 Algorithm
     * @param {string} inputFilename 
     * @param {string} outputFilename 
     */
    static async DecompressFile(inputFilename, outputFilename){
        await ExternalProgramsService.LZ4Client('decompress', inputFilename, outputFilename)
    }

}