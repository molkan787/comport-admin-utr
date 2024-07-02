import axios from 'axios'
import { coll } from './db'
import store from '../store'

export class AuthService{

    /**
     * @private
     * @type {string}
     */
    static __authToken = null
    static get authToken(){
        return this.__authToken
    }

    static init(){
        this.adminsCollection = coll('comport', 'admins')
    }

    static async login(username, password){
        const user = await this.adminsCollection.findOne({ username })
        if(user && user.password === password){
            this.__authToken = await this.remoteLogin(username, password);
            this._useAuthToken(this.__authToken)
            return true
        }
        return 'Invalid login credentials'
    }

    static _useAuthToken(token){
        axios.defaults.headers['authorization'] = 'bearer ' + token
        store.state.loggedIn = true
    }

    static async remoteLogin(username, password){
        try {
            const { data } = await axios.post('admin/login', {
                user: username,
                pass: password
            })
            return data.token
        } catch (error) {
            console.error(error)
        }
    }

}

AuthService.init()