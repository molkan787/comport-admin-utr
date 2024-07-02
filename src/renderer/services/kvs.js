import axios from 'axios'

export class KvsService{
    

    /**
     * @typedef {{ group: string, key: string, value: any }} KvsItem
     * @param {KvsItem[]} items 
     */
    static async SetValues(items){
        const { data } = await axios.post('admin/kvs/set-values', {
            items
        })
        return data
    }

    /**
     * 
     * @param {string} group 
     * @param {string} key 
     * @param {any} value 
     * @returns 
     */
    static async SetValue(group, key, value){
        const data = await this.SetValues([{ group, key, value }])
        return data
    }

    /**
     * @param {{ group: string, key: string }[]} items 
     * @returns {Promise<KvsItem[]>}
     */
    static async GetValues(items){
        const { data } = await axios.post('admin/kvs/get-values', {
            items
        })
        return data.items
    }

    /**
     * 
     * @param {string} group 
     * @param {string} key 
     */
    static async GetValue(group, key){
        const items = await this.GetValues([{ group, key }])
        if(items.length >= 1){
            return items[0].value
        }else{
            return null
        }
    }

    /**
     * @param {string} groupName 
     * @returns {Promise<KvsItem[]>}
     */
    static async GetAllGroupValues(groupName){
        const { data } = await axios.post('admin/kvs/get-values', {
            group: groupName
        })
        return data.items
    }

     /**
     * Replace all key-values items of the specified group
     * @param {string} groupName Values group name
     * @param {{key: string, value: string}[]} items New items to store in the group
     * @returns {Promise<{}>}
     */
      static async PutGroupValues(groupName, items){
          const { data } = await axios.post('admin/kvs/set-values', {
              group: groupName,
              items,
          })
          return data
      }

}