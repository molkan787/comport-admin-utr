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
     * @private
     * @param {string} toolName 
     * @returns {string}
     */
    static _url(toolName){
        return `${TOOLS_BASE_URL}/${toolName}`
    }

}
