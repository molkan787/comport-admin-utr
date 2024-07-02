import { readBinFile, writeFile } from '../../utils';

const lzjb = require('../../libs/lzjb');

export class LZJBService{

    static async CompressFile(inputFilename, outputFilename){
        const inData = await readBinFile(inputFilename)
        const outData = lzjb.compressFile(inData)
        await writeFile(outputFilename, Buffer.from(outData))
    }
    
    static async DecompressFile(inputFilename, outputFilename){
        const inData = await readBinFile(inputFilename)
        const outData = lzjb.decompressFile(inData)
        await writeFile(outputFilename, Buffer.from(outData))
    }


}