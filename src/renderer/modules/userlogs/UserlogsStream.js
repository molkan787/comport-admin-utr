import UserLogsService from '../../services/userlogs'

export class UserlogsStream{

    /**
     * @typedef {ReturnType<UserLogsService.ParseLogItem>} LogItem
     */

    /**
     * @private
     * @type {string}
     */
    userId = null
    
    /**
     * @private
     * @type {string}
     */
     lastGroupKey = null

    /**
     * @private
     * @type {LogItem[]}
     */
     bucket = []

    /**
     * @param {string} userId 
     */
    constructor(userId){
        this.userId = userId
    }

    /**
     * @returns {Promise<LogItem | null>}
     */
    async ReadItem(){
        if(this.bucket.length < 0){
            await this.LoadNextItems()
        }
        const item = this.bucket.shift()
        return item || null
    }

    /**
     * @private
     */
    async LoadNextItems(){
        console.log('Loading next items...')
        const { items, lastGroupKey } = await UserLogsService.GetLogs(this.userId, 1, this.lastGroupKey || undefined)
        this.bucket.push(...items)
        this.lastGroupKey = lastGroupKey
    }

}