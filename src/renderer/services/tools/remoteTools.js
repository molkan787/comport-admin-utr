import axios from 'axios'
import { readBinFile, writeFile } from '../../utils'
const TOOLS_BASE_URL = 'pub/tools'

export class RemoteToolsService{

    /**
     * @param {string} seed 
     * @returns {Promise<string>}
     */
    static async MG1CS002_GenerateKey(seed){
        const { data } = await axios.post(this._url('MG1CS002_SA-generatekey'), null, {
            params: {
                seed
            }
        })
        return data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @param {number} securityAccessLevel 
     * @returns {Promise<string>}
     */
     static async PowertrainAlgo_GenerateKey(seed, securityAccessLevel){
        const { data } = await axios.post(this._url('powertrainalgo-generatekey'), null, {
            params: {
                seed,
                securityAccessLevel
            }
        })
        return data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @param {number} securityAccessLevel 
     * @returns {Promise<string>}
     */
     static async DaimlerStandardAlgo_GenerateKey(seed, securityAccessLevel){
        const { data } = await axios.post(this._url('daimlerstandardalgo-generatekey'), null, {
            params: {
                seed,
                securityAccessLevel
            }
        })
        return data.GeneratedKey
    }

    static async CRC32_PatchFile(inputFilename, outputFilename, targetChecksum, patchOffset){
        const input = await readBinFile(inputFilename)
        const { data } = await axios.post(this._url('crc32-patch'), input, {
            params: {
                options: JSON.stringify({ targetChecksum, patchOffset })
            },
            headers: {
                'content-type': 'application/octet-stream'
            },
            responseType: 'arraybuffer'
        })
        const dataBuffer = Buffer.from(data, 'binary')
        await writeFile(outputFilename, dataBuffer)
        return outputFilename
    }

    /**
     * @param {'gen1' | 'gen2'} algo 
     * @param {string} seed 
     * @param {number} scode Required only for 'gen1' algo
     * @returns {Promise<string>}
     */
    static async NissanKeygen(algo, seed, scode){
        const { data } = await axios.post(this._url('nissan-keygen'), null, {
            params: {
                algo,
                seed,
                scode: scode.toString()
            }
        })
        return data && data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @returns {Promise<string>}
     */
     static async MED1775AM_GenerateKey(seed){
        const { data } = await axios.post(this._url('med1775am-generatekey'), null, {
            params: {
                seed,
            }
        })
        return data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @param {number} securityAccessLevel
     * @returns {Promise<string>}
     */
     static async MED40_12_17_00_20181109051126_GenerateKey(seed, securityAccessLevel){
        const { data } = await axios.post(this._url('med40_12_17_00_20181109051126-generatekey'), null, {
            params: {
                seed,
                securityAccessLevel
            }
        })
        return data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @param {number} securityAccessLevel
     * @returns {Promise<string>}
     */
     static async med177_multi_14_04_01_20193022103018_GenerateKey(seed, securityAccessLevel){
        const { data } = await axios.post(this._url('med177_multi_14_04_01_20193022103018-generatekey'), null, {
            params: {
                seed,
                securityAccessLevel
            }
        })
        return data.GeneratedKey
    }

    

    /**
     * @param {string} seed 
     * @returns {Promise<string>}
     */
    static async infintiMed40_2749001500_GenerateKey(seed){
        const { data } = await axios.post(this._url('infintiMed40_2749001500-generatekey'), null, {
            params: {
                seed,
            }
        })
        return data.GeneratedKey
    }

    /**
     * @param {string} seed 
     * @param {number} securityAccessLevel
     * @returns {Promise<string>}
     */
    static async SecAlgo_GenerateKey(algoName, seed, securityAccessLevel){
        const { data } = await axios.post(this._url(`${algoName}-generatekey`), null, {
            params: {
                seed,
                securityAccessLevel
            }
        })
        return data.GeneratedKey
    }

    /**
     * @typedef CRCHachOptions
     * @prop {string} targetChecksum
     * @prop {string?} position byte.bit position of mutable input bits
     * @prop {string?} backwardPosition position offset from the end of the input
     * @prop {string?} bits specify bits at positions l..r with step s
     * @prop {string?} polynomial generator polynomial
     * @prop {string?} initialRegister initial register value
     * @prop {boolean?} reverseInput reverse input bytes
     * @prop {string?} registerSize register size in bits
     * @prop {string?} xorMask final register XOR mask
     * @prop {boolean?} reverseFinal reverse final register
     * 
     * @param {string} inputFilename
     * @param {string} outputFilename
     * @param {CRCHachOptions} options 
     */
    static async CRCHack(inputFilename, outputFilename, options){
        const qsParams = Object.assign({}, options)
        if(!qsParams.reverseInput) delete qsParams.reverseInput
        if(!qsParams.reverseFinal) delete qsParams.reverseFinal
        const inputData = await readBinFile(inputFilename)
        const { data } = await axios.post(this._url(`crchack`), inputData, {
            params: {
                options: JSON.stringify(qsParams)
            },
            headers: {
                'content-type': 'application/octet-stream'
            },
            responseType: 'arraybuffer'
        })
        const dataBuffer = Buffer.from(data, 'binary')
        await writeFile(outputFilename, dataBuffer)
        return outputFilename
    }

    /**
     * @typedef BytesReturnParameters
     * @prop {string} folderName
     * @prop {string} fileName
     * @prop {string} offset
     * @prop {string} length
     * 
     * @param {BytesReturnParameters} options 
     * @returns {Promise<string>}
     */
     static async BytesReturn(options){

        const { data } = await axios.post(this._url(`byte-return`), null, {
            params: options,
            responseType: 'arraybuffer',
        })
        return data
    }

    /**
     * @private
     * @param {string} toolName 
     * @returns {string}
     */
    static _url(toolName){
        return `${TOOLS_BASE_URL}/${toolName}`
    }

}
