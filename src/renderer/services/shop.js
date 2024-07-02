import Shell from '../shell'
import store from '../store'
import { coll, ObjectId } from './db'
import { GenericEntriesService } from './GenericEntries'

export class ShopService{

    static _groupName = {
        database: 'comport',
        collection: 'shops'
    }
    
    static init(){
        this.shopsCollection = coll('comport', 'shops')
        Shell.registerReadyCallback(() => this.initialLoad())
    }

    static async initialLoad(){
        const shops = await this.getShops()
        store.dispatch('setShopsList', shops)
    }

    static getShops(){
        return GenericEntriesService.GetEntries(this._groupName)
        // return this.shopsCollection.find().toArray()
    }

    static saveShop(data, isNew){
        return GenericEntriesService.SaveEntry(this._groupName, data)
        // if(isNew){
        //     const result = await this.shopsCollection.insertOne(data)
        //     return {
        //         ...data,
        //         _id: result.insertedId
        //     }
        // }else{
        //     const { _id, ...rData } = data
        //     await this.shopsCollection.updateOne(
        //         { _id: ObjectId(_id) },
        //         { $set: rData }
        //     )
        //     return data
        // }
    }

    static deleteShop(data){
        return GenericEntriesService.DeleteEntry(this._groupName, data._id)
        // return this.shopsCollection.deleteOne({
        //     _id: ObjectId(data._id)
        // })
    }

}

ShopService.init()