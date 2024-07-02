import { coll } from './db'
import store from '../store'
import Shell from '../shell'
import { arrayToMap } from '../utils'
import { VehiclesRespository } from './vehiclesRespository'
const settingsCollection = coll('comport', 'settings')

export class SettingsService{

    /**
     * @typedef {'ecu' | 'tcu' | 'cpc'} MicroType
     * @typedef {{[microType: MicroType]: string[]}} MicroModelsSet
     */

    static Init(){
        Shell.registerReadyCallback(() => this.Load())
    }

    static async Load(){
        try {
            await Promise.all([
                this.LoadMicrosModelsList(),
                this.LoadCarsMakes(),
                this.LoadVehicleList(),
                // add here other modules...
            ])
        } catch (error) {
            panic(error, 'An error occured when loading settings')
        }
    }

    /** @private */
    static get cache(){
        return store.state.settings
    }

    static async LoadMicrosModelsList(){
        const micros = await this.GetMicrosModelsList()
        this.cache.micros = micros
    }

    /**
     * @returns {Promise<MicroModelsSet>}
     */
    static async GetMicrosModelsList(){
        const keys = [
            this._getMicroTypeKey('ecu'),
            this._getMicroTypeKey('tcu'),
            this._getMicroTypeKey('cpc'),
        ]
        const docs = await settingsCollection.find({
            key: { $in: keys }
        }).toArray()
        const data = docs.reduce((m, d) => (m[this._getMicroTypeFromKey(d.key)] = d.value) && m, {})
        return data;
    }

    /**
     * @param {MicroType} type 
     * @param {string} model 
     */
    static async AddMicroModel(type, model){
        const key = this._getMicroTypeKey(type.toLowerCase())
        await settingsCollection.updateOne(
        {
            key: key
        },
        {
            $set: { key: key },
            $addToSet: { value: model.toUpperCase() }
        },
        {
            upsert: true
        })
        this.LoadMicrosModelsList()
    }

    /**
     * @param {MicroType} type 
     * @param {string} model 
     */
    static async RemoveMicroModel(type, model){
        const key = this._getMicroTypeKey(type.toLowerCase())
        await settingsCollection.updateOne(
            {
                key: key
            },
            {
                $pull: { value: model }
            }
        )
        this.LoadMicrosModelsList()
    }

    /** @private */
    static get _microTypeKeyPrefix() { return 'micro_models_' } 

    /**
     * @private
     * @param {MicroType} type
     */
    static _getMicroTypeKey(type){
        return `${this._microTypeKeyPrefix}${type}`
    }

    /**
     * @private
     * @param {string} key
     * @returns {MicroType}
     */
    static _getMicroTypeFromKey(key){
        return key.substring(this._microTypeKeyPrefix.length)
    }


    static async LoadCarsMakes(){
        const makesDoc = await settingsCollection.findOne({ key: 'cars_makes' })
        const makes = makesDoc.value
        this.cache.mappedCarsMakes = arrayToMap(makes, m => m.k, m => m.v)
        this.cache.carsMakes = makes
        return makes
    }

    static async LoadVehicleList(){
        const docs = await VehiclesRespository.GetVehicles()
        this.cache.vehicles = docs
        return docs
    }

}

window.SettingsService = SettingsService

SettingsService.Init()