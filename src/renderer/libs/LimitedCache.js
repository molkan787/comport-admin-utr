export class LimitedCache{

    /**
     * @private
     * @type {Map<string, any>}
     */
    values

    /**
     * @private
     * @type {string[]}
     */
    keys

    /**
     * @private
     * @type {number}
     */
    limit

    /**
     * @param {number} limit 
     */
    constructor(limit){
        this.limit = limit
        this.values = new Map()
        this.keys = []
    }

    /**
     * @param {string} key 
     * @param {any} value 
     */
    set(key, value){
        if(this.keys.length >= this.limit){ // clear the oldest value
            const oldestKey = this.keys.shift()
            this.values.delete(oldestKey)
        }
        const alreadyExists = this.values.has(key)
        this.values.set(key, value)
        if(!alreadyExists){
            this.keys.push(key)
        }
    }

    /**
     * @param {string} key 
     */
    get(key){
        return this.values.get(key)
    }

}