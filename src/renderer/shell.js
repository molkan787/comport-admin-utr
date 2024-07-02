import { client } from './services/db'

export default class Shell{

    static onReady;
    /**
     * @private
     * @type {Function[]}
     */
    static __readyCallbacks = []

    static async doWork(){
        await client.connect()
        this.dispatchCallbacks()
        document.getElementById('loadingPanel').style.display = 'none';
    }

    /**
     * 
     * @param {Function} callback 
     */
    static registerReadyCallback(callback){
        this.__readyCallbacks.push(callback)
    }

    /**
     * @private
     */
    static dispatchCallbacks(){
        if(typeof this.onReady == 'function')
            this.onReady()
        for(let cb of this.__readyCallbacks){
            cb()
        }
    }

}