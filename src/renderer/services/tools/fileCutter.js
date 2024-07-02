import { readBinFile, writeFile } from '../../utils'

export class FileCutterService{

    /**
     * @typedef {Object} CutFilePartOptions
     * @property {string} inputFilename
     * @property {string} outputFilename
     * @property {number} partStartOffset start offset/index of the part to cut (inclusive)
     * @property {number} partEndOffset end offset/index of the part to cut (not inclusive)
     * @param {CutFilePartOptions} options 
     * @returns {Promise<void>}
     */
    static async CutFilePart(options){
        const data = await readBinFile(options.inputFilename)
        const part = data.slice(options.partStartOffset, options.partEndOffset + 1)
        await writeFile(options.outputFilename, part)
    }

}