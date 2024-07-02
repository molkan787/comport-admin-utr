import { coll, ObjectId } from './db'

const vehiclesCollection = coll('comport', 'vehicles')

export class VehiclesRespository{

    static async GetVehicles(){
        const docs = await vehiclesCollection.find().toArray()
        return docs
    }

    static async SaveVehicle(data){
        const { _id, ...rData } = data
        if(typeof _id !== 'undefined'){
            await vehiclesCollection.updateOne(
                { _id: ObjectId(_id) },
                { $set: rData }
            )
            return data
        }else{
            const result = await vehiclesCollection.insertOne(rData)
            return {
                ...rData,
                _id: result.insertedId
            }
        }
    }

    static async DeleteVehicle(vehicleId){
        await vehiclesCollection.deleteOne({ _id: ObjectId(vehicleId) })
    }

}