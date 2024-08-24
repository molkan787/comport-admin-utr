import Shell from '../shell'
import store from '../store'
import { CustomerService } from './customer'
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
    }

    static saveShop(data, isNew){
        return GenericEntriesService.SaveEntry(this._groupName, data)
    }

    static deleteShop(data){
    }

    /**
     * Fetch and return all customers that are assigned to selected shop's (shopId)
     * @param {string} shopId 
     */
    static async getCustomers(shopId){
        const customers = await CustomerService.customersCollection.find(
            { shopId: shopId },
            {
                projection: {
                    email: 1,
                    vin: 1,
                }
            }
        ).toArray()
        return customers
    }

}

ShopService.init()