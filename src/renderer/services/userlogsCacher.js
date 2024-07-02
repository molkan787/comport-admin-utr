import UserLogsService from "./userlogs";
import { ProcessItemData } from "../components/customer-forms/UIUserlogsItems";
import { LimitedCache } from "../libs/LimitedCache";

export class UserlogsCacher{

    /** @type {LimitedCache} */
    cache

    /** @type {Buffer[]} */
    items

    /** @type {number} */
    uidPointer

    async Init(){
        this.uidPointer = 0
        this.cache = new LimitedCache(500)
        this.items = []
    }

    /**
     * @param {number} uid 
     */
    GetItemStrContent(uid){
        const b = this.items[uid]
        return b.slice(9).toString('utf8')
    }

    /**
     * @param {number} uid 
     */
    GetItem(uid){
        const cachedItem = this.cache.get(uid)
        if(cachedItem) return cachedItem
        const parsedData = UserLogsService.ParseLogItem(this.items[uid])
        UserLogsService.ProcessLogsItem(parsedData)
        parsedData.uid = uid
        const item = ProcessItemData(parsedData)
        this.cache.set(uid, item)
        return item
    }

    /**
     * @param {string[]} rawItems 
     */
    CacheItems(rawItems){
        const uids = []
        const len = rawItems.length
        const items = this.items
        const il = items.length
        for(let i = 0; i < len; i++){
            const b = Buffer.from(rawItems[i], 'base64')
            items.push(b)
            uids.push(il + i)
        }
        return uids
    }

}