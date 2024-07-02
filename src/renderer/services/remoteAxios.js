import { simpleSend } from 'electron-easy-ipc'

export class RemoteAxios{

    /**
     * @private
     */
    static _proxy = null
    static setProxy(proxy){
        this._proxy = proxy
    }

    static async get(url, options){
        options = this._processOptions(options)
        const response = await simpleSend('axios', {
            method: 'get',
            url,
            options
        });
        console.log(`${url} response`, response)
        const { data, error } = response
        if(error){
            throw error
        }else{
            return data
        }
    }

    static async post(url, data, options){
        options = this._processOptions(options)
        const response = await simpleSend('axios', {
            method: 'post',
            url,
            data,
            options
        });
        console.log(`${url} response`, response)
        const { data: responseData, error } = response
        if(error){
            throw error
        }else{
            return responseData
        }
    }

    /**
     * @private
     */
    static _processOptions(options){
        if(typeof this._proxy == 'object'){
            return {
                ...options,
                proxy: this._proxy
            }
        }
        return options
    }

}

window.RemoteAxios = RemoteAxios;