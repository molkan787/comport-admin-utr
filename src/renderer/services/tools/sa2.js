import axios from 'axios'

export class SA2Service{

    /**
     * @param {string} instructionTape Binary data in hex string
     * @param {string} seed Binary data in hex string
     * @returns {Promise<string} Generated key in hex string format
     */
    static async GenerateKey(instructionTape, seed){
        const { data } = await axios.post('pub/tools/SA2-generatekey', null, {
            params: {
                instructionTape,
                seed
            }
        })
        return data.GeneratedKey
    }

}