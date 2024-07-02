import { coll } from './db'
import { ObjectId } from 'mongodb'

const usersColl = coll('comport', 'tuner_users')

export class TunerUsersService{

    /**
     * @typedef TunerUserEntity
     * @type {object}
     * @property {string} _id
     * @property {string} name
     * @property {string} username
     * @property {string} password
     * @property {string} last_login
     * @property {string} last_login_ip
     */

    /**
     * @param {Partial<TunerUserEntity>} data 
     * @returns {Promise<TunerUserEntity>}
     */
    static async PutUser(data){
        if(!!data._id){
            const { _id, ...info } = data
            await usersColl.updateOne(
                { _id: ObjectId(_id) },
                { $set: info }
            )
            return data
        }else{
            const { insertedId } = await usersColl.insertOne(data)
            return {
                ...data,
                _id: insertedId
            }
        }
    }

    /**
     * @returns {Promise<TunerUserEntity[]>}
     */
    static async GetUsers(){
        const users = await usersColl.find().toArray()
        return users
    }

    /**
     * @param {string} userId 
     * @returns {Promise<void>}
     */
    static async DeleteUser(userId){
        await usersColl.deleteOne({ _id: ObjectId(userId) })
    }

}