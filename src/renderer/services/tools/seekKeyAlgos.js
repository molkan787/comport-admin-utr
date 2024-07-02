import ExternalProgramsService from "../externalPrograms";

export class SeedKeyAlgos{

    /**
     * @param {string} seed 
     * @returns {string}
     */
    static async DensoChallenge(seed){
        const output = await ExternalProgramsService.DensoChallenge(seed)
        return output.trim()
    }

    /**
     * @param {string} seed 
     * @param {number} secLevel 
     * @returns {string}
     */
     static async MED1775_17_29_01_2017201707(seed, secLevel){
        const output = await ExternalProgramsService.SecAlgo_MED1775_17_29_01_2017201707(seed, secLevel)
        return this._grabOutputData(output)
    }

    
    // ------------------------------------------------------------------

    /**
     * @param {string} output 
     * @param {string} dataPrefix The string that comes just before the data to return (default = 'Output_key:')
     * @returns {string}
     */
     static _grabOutputData(output, dataPrefix){
        const prefix = dataPrefix || 'Output_key:'
        const lines = output.split('\n')
        for(let i = 0; i < lines.length; i++){
            const ln = lines[i].trim()
            if(ln.startsWith(prefix)){
                const keyHexStr = ln.substring(prefix.length).trim()
                return keyHexStr
            }
        }
        return null
    }

}