import { deleteFile, exec, isNoneEmptyString, isValidNumber, readBinFile } from '../utils'
import { GetMyResourcesDirPath } from './pathsResolver'
import temp from 'temp'

export const EPActions = Object.freeze({
    Compress: 'compress',
    Decompress: 'decompress'
})

function SanitizeHexSerie(seed){
    return Buffer.from(seed.replace(/\s/g, ''), "hex").toString("hex")
}

function SanitizeHexNumber(num){
    return parseInt(num.toString(), 16).toString(16)
}

function SanitizeNumber(num){
    return parseInt(num.toString(), 10).toString(10)
}

function SanitizeFilePath(path){
    if(path.includes('"')){
        throw new Error('File path cannot includes double quotes.')
    }
    return `"${path}"`
}

export default class ExternalProgramsService{

    static async lzrb(action, inFilename, outFilename){
        const cmd = `java -jar "${this._progFile('lzrb.jar')}" ${action} "${inFilename}" "${outFilename}"`
        return await exec(cmd)
    }

    static async lzss(action, inFilename, outFilename){
        const aclia = action === EPActions.Compress ? '-c' : '-d'
        const cmd = `"${this._progFile('lzss.exe')}" ${aclia} -i "${inFilename}" -o "${outFilename}"`
        return await exec(cmd)
    }
    
    static async cpcCompression(inFilename, outFilename){
        const cmd = `"${this._progFile('cpc_compression.exe')}" "${inFilename}" "${outFilename}"`
        return await exec(cmd)
    }

    static async LZ4Client(action, inputFilename, outputFilename){
        const cmd = `"${this._progFile('LZ4_CLI_CLIENT.exe')}" ${action} "${inputFilename}" "${outputFilename}"`
        return await exec(cmd)
    }

    /**
     * @typedef CRCManipOptions
     * @prop {'CRC32' | 'CRC32POSIX' | 'CRC16CCITT' | 'CRC16IBM'} algorithm
     * @prop {string} inputFilename
     * @prop {string} outputFilename
     * @prop {string} targetChecksum
     * @prop {number} patchOffset
     * @prop {string?} polynomial
     * 
     * @param {CRCManipOptions} options 
     * @returns 
     */
    static async CRCManip(options){
        const { algorithm, inputFilename, outputFilename, targetChecksum, patchOffset, polynomial } = options
        const cmd = (
            `"${this._progFile('crcmanip-cli.exe')}" patch "${inputFilename}" "${outputFilename}" ` +
            `"${targetChecksum}" --algorithm ${algorithm} --position ${patchOffset.toString()} --overwrite ` + 
            (isNoneEmptyString(polynomial) ? `--polynomial ${polynomial}` : '')
        )
        console.log(`cmd: "${cmd}"`)
        return await exec(cmd)
    }

    /**
     * @typedef PartialCRCManipOptions
     * @prop {'CRC32' | 'CRC32POSIX' | 'CRC16CCITT' | 'CRC16IBM'} algorithm
     * @prop {string} inputFilename
     * @prop {string} targetChecksum
     * @prop {number} patchOffset
     * @prop {string?} polynomial
     * 
     * @param {PartialCRCManipOptions} options 
     * @returns 
     */
    static async GetCRCManipCorrection(options){
        const { algorithm, inputFilename, targetChecksum, patchOffset, polynomial } = options
        const outputFilename = temp.path()
        const cmd = (
            `"${this._progFile('crcmanip-cli.exe')}" patch "${inputFilename}" "${outputFilename}" ` +
            `"${targetChecksum}" --algorithm ${algorithm} --position ${patchOffset.toString()} --overwrite ` + 
            (isNoneEmptyString(polynomial) ? `--polynomial ${polynomial}` : '')
        )
        await exec(cmd)
        const outputData = await readBinFile(outputFilename)
        const patch = outputData.slice(patchOffset, patchOffset + 4)
        await deleteFile(outputFilename)
        return patch.toString('hex')
    }



    /**
     * @param {string} seed 
     * @returns {string}
     */
    static async DensoChallenge(seed){
        const cmd = `"${this._progFile('denso_challenge.exe')}" ${seed}`
        return await exec(cmd)
    }

    /**
     * @param {string} inputFilename 
     * @param {string} outputDirectory 
     * @returns {Promise<string>}
     */
    static async FRFDecription(inputFilename, outputDirectory){
        const cmd = `${this._python} ${this._progFile('VW_Flash_FRF/decryptfrf.py')} --file "${inputFilename}" --outdir "${outputDirectory}"`
        return await exec(cmd)
    }

    static async lz77(action, inFilename, outFilename){
        const cmd = `"${this._progFile('lz77.exe')}" ${action == EPActions.Compress ? '-c' : '-d'} -i "${inFilename}" -o "${outFilename}"`
        return await exec(cmd)
    }

    static async GMFDecrypt(inFilename, outFilename){
        return await exec(`"${this._progFile('GMFDecrypt.exe')}" "${inFilename}" "${outFilename}"`)
    }

    static async GMFEncrypt(inFilename, outFilename){
        return await exec(`"${this._progFile('GMFEncrypt.exe')}" "${inFilename}" "${outFilename}"`)
    }

    static async EBECL210_LZSS(action, inFilename, outFilename){
        try {
            await exec(
                `"${this._progFile('eb_ecl_2.1.0.exe')}" ${action === EPActions.Compress ? 'c' : 'd'} "${inFilename}" "${outFilename}"`
            )
        } catch (error) {
            if(error.code === 1) return
            else throw error
        }
    }

    static async zlib_smx(compressionLevel, inFilename, outFilename){
        if(typeof compressionLevel !== 'number') throw new Error("'compressionLevel' must be of type `number`")
        return await exec(`"${this._progFile('zlib_smx.exe')}" ${compressionLevel} <"${inFilename}"> "${outFilename}"`)
    }

    /**
     * @param {string} inFilename 
     * @returns {Promise<string>} Returns the output filename
     */
    static async lzf_smx(inFilename){
        await exec(`"${this._progFile('lzf_smx.exe')}" "${inFilename}"`)
        return `${inFilename}.enc`
    }
    
    static async SecAlgo_MED1775_17_29_01_2017201707(seed, secLevel){
        const cmd = `java -jar "${this._progFile('SecAlgo_MED1775_17_29_01_2017201707.jar')}" ${seed} ${secLevel}`
        return await exec(cmd)
    }

    static async zlib1(action, inFilename, outFilename){
        return await exec(`"${this._progFile('zlib1-wrapper/zlib1-wrapper.exe')}" ${action} "${inFilename}" "${outFilename}"`)
    }

    static async ikvmc(inputJarFilename, outputDllFilename){
        return await exec(`"${this._progFile('ikvm-7.2.4630.5/bin/ikvmc.exe')}" "${inputJarFilename}" -out:"${outputDllFilename}"`)
    }
    
    /**
     * @param {(string | number)[]} args 
     */
    static async DLLSeedKeyClient(args){
        const cmd = `"${this._progFile("Comport_SeedKeyDLL_Client.exe")}" ${this.encodeArgs(args)}`
        return await exec(cmd)
    }

    // ----------- internal helpers -----------

    static _progFile(sName){
        return GetMyResourcesDirPath(sName)
    }

    static get _python(){
        return process.platform === 'win32' ? 'python' : 'python3'
    }

    static encodeArgs(args){
        return args.map(a => {
            let _a = (a || '').toString()
            if(_a.includes(' ') && !(_a.startsWith('"') && _a.endsWith('"'))){
                return `"${_a}"`
            }else{
                return _a
            }
        })
        .filter(a => a.length > 0)
        .join(' ')
    }

}