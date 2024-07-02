import { UserError } from '../framework/errors/UserError'
import { coll, ObjectId } from './db'

export class CustomerService{
    
    static init(){
        this.customersCollection = coll('comport', 'users')
    }

    static getCustomers(){
        return this.customersCollection.find(
            {},
            {
                projection: {
                    email: 1,
                    pw: 1,
                    vin: 1,
                    ecu: 1,
                    tcu: 1,
                    cpc: 1,
                    last_login: 1,
                    cpcInfo: 1,
                    tcuInfo: 1,
                    ecoInfo: 1,
                    flags: 1,
                    last_flashing_ecu: 1,
                    last_flashing_tcu: 1,
                    last_flashing_cpc: 1,
                    status: 1,
                    shopId: 1,
                }
            }
        ).toArray()
    }

    static getCustomerFullData(customerId){
        return this.customersCollection.findOne({ _id: ObjectId(customerId) })
    }

    static async saveCustomer(data, isNew){
        if(isNew){
            const { email } = data
            const doc = await this.customersCollection.findOne({ email }, { projection: { email: 1 } })
            if(doc){
                throw new UserError('Customer with the specified email already exists.')
            } 
            const result = await this.customersCollection.insertOne(data)
            return {
                ...data,
                _id: result.insertedId
            }
        }else{
            // TODO: Replace entire data instead of only putting the provided fileds
            const { _id, ...rData } = data
            await this.customersCollection.updateOne(
                { _id: ObjectId(_id) },
                { $set: rData }
            )
            return data
        }
    }

    static async patchCustomer(customerId, data){
        await this.customersCollection.updateOne(
            { _id: ObjectId(customerId) },
            { $set: data }
        )
    }

    static deleteCustomer(data){
        return this.customersCollection.deleteOne({
            _id: ObjectId(data._id)
        })
    }

    static async SetFlag(customerId, flagId, state){
        await this.customersCollection.updateOne(
            { _id: ObjectId(customerId) },
            {
                $set: {
                    [`flags.${flagId}`]: !!state
                }
            }
        )
    }

    static Flags = Object.freeze({
        POSTFLASH_VIN_MISMATCH: 'postflash_vin_mismatch'
    })

}

CustomerService.init()