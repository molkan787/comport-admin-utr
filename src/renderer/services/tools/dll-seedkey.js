import ExternalProgramsService from "../externalPrograms"
import { SeedKeyAlgos } from "./seekKeyAlgos"

export class DLLSeedKey{

    static async TestDLL(filename){
        const output = await ExternalProgramsService.DLLSeedKeyClient([
            "analyze",
            filename,
        ])
        return output
    }

    /**
     * @param {string} filename 
     * @param {string} seed 
     * @param {string | number} accessLevel 
     * @returns 
     */
    static async GenerateKey(filename, seed, accessLevel){
        const output = await ExternalProgramsService.DLLSeedKeyClient([
            filename,
            seed,
            accessLevel,
        ])
        const output_key = SeedKeyAlgos._grabOutputData(output)
        return output_key
    }

}
