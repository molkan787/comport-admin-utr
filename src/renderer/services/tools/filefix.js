import { readBinFile, writeFile } from '../../utils'

export class FileFixService{

    /**
     * @typedef {{ filenameA: string, filenameB: string, outputFilename: string, totalLength: number }} FixFileOptions
     * @param {FixFileOptions} options 
     * @returns {Promise<void>}
     */
    static async FixFile(options){
        const { filenameA, filenameB, outputFilename, totalLength } = options
        const [ binA, binB ] = await Promise.all([
            readBinFile(filenameA),
            readBinFile(filenameB)
        ])
        const padLen = totalLength - binA.length - binB.length
        if(padLen < 0){
            throw new Error('Unexpected case: totalLength is smaller than the sum of file A & file B lengths')
        }
        const outputBin = Buffer.concat([
            binA,
            Buffer.from('00'.repeat(padLen), 'hex'),
            binB
        ])
        await writeFile(outputFilename, outputBin)
    }

}