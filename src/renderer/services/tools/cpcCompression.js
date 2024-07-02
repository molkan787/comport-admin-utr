// import { types, NULL_POINTER } from 'ref-napi'
// import ArrayType from 'ref-array-napi'
// import { LibraryLoaderService } from '../libraryLoader'
import { GetMyResourcesDirPath } from '../pathsResolver'
import { ToPromise, readBinFile, writeFile } from '../../utils'
import ExternalProgramsService from '../externalPrograms'

export class CPCCompressionService{

    /**
     * @param {string} inFilename 
     * @param {string} outFilename 
     * @returns {Promise<void>}
     */
    static async CompressFile(inFilename, outFilename){
        // using c# app as wrapper for the dll
        await ExternalProgramsService.cpcCompression(inFilename, outFilename)
        
        // using the dll directly (currently not working)
        // const data = await readBinFile(inFilename)
        // const compressedData = await this.Compress(data)
        // await writeFile(outFilename, compressedData)
    }
    
    // /**
    //  * @param {Buffer} data 
    //  * @returns {Buffer}
    //  */
    //  static async Compress(data){
    //     if(data.length == 0) return Buffer.alloc(0)
    //     this.LoadLibrary()
    //     const outBuffer = Buffer.alloc(Math.floor(data.length * 1.3))

    //     await ToPromise(this.lib.VectorCompressInit.async, [])
    //     const length = await ToPromise(
    //         this.lib.VectorCompress.async, [data, data.length, outBuffer, NULL_POINTER])
    //     await ToPromise(this.lib.VectorCompressExit.async, [])

    //     if(length > 0){
    //         Buffer
    //         return outBuffer.slice(0, length)
    //     }else{
    //         throw new Error('Library did not return an output')
    //     }
    // }

    // static LoadLibrary(){
    //     const ByteArray = ArrayType(types.uchar)
    //     const Int32Pointer = ArrayType(types.int32)
    //     this.lib = LibraryLoaderService.Load(
    //         GetMyResourcesDirPath('CompressAlgo1.dll'),
    //         {
    //             VectorCompressInit: [types.bool, []],
    //             VectorCompress: [types.int, [ByteArray, types.int32, ByteArray, Int32Pointer]],
    //             VectorCompressExit: [types.void, []]
    //         }
    //     )
    // }

}