import axios from "axios";
import { ObjectId } from "bson";
import path from "path";
import { readBinFile, readFile } from "../utils";
import { GenericEntriesService } from "./GenericEntries";

export class DynoDbService{

    /**
     * @typedef {Object} DynoRunData
     * @property {string} _id
     * @property {string} entryId
     * @property {string} filename
     * @property {string} description
     * @property {string?} rawData
     * 
     * @typedef DynoCarData
     * @property {string} shop
     * @property {string} make
     * @property {string} model
     * @property {string} year
     * @property {string} owner
     * @property {DynoRunData[]} runDataItems
     */

    /**
     * @param {string[]?} entryIds 
     * @returns {Promise<DynoCarData[]>}
     */
    static async GetEntries(entryIds){
        const { data } = await axios.get(`dynodb/list-entries`, {
            params: {
                entryIds
            }
        });
        return data.entries
    }

    /**
     * @param {string | ObjectId} entryId 
     * @returns {Promise<DynoRunData[]>}
     */
    static async GetRunsData(entryId){
        const { data } = await axios.get(`dynodb/entry/${entryId}/runs-data`)
        return data || []
    }

    static async GetRunDataFileBinary(fileId){
        const response = await axios.get(
            `dynodb/run-data/raw-file/${fileId}`,
            { responseType: 'arraybuffer' }
        )
        return Buffer.from(response.data)
    }

    /**
     * @param {DynoCarData} inputData 
     * @returns {Promise<DynoCarData>}
     */
    static async AddEntry(inputData){
        await this.PrepareRunDatItems(inputData.runDataItems)
        const { data } = await axios.post(`dynodb/add-entry`, inputData)
        return data.entry
    }
    
    /**
     * @param {DynoCarData} inputData 
     * @returns {Promise<DynoCarData>}
     */
    static async EditEntry(inputData){
        await this.PrepareRunDatItems(inputData.runDataItems)
        const { data } = await axios.post(`dynodb/edit-entry`, inputData)
        return data.entry
    }

    /**
     * @private
     * @property {DynoRunData[]} runDataItems
     */
    static async PrepareRunDatItems(runDataItems){
        const tasks = []
        for(let runData of runDataItems){
            const isNew = !(typeof runData._id == 'string' && runData._id.length > 0)
            if(isNew){
                const rd = runData
                tasks.push((async () => {
                    rd.rawData = await readFile(rd.filename)
                    rd.filename = path.basename(rd.filename)
                })())
            }
        }
        await Promise.all(tasks)
    }


    /**
     * @param {string | ObjectId} entryId 
     * @returns {Promise<any>}
     */
    static async DeleteEntry(entryId){
        const { data } = await axios.delete(`dynodb/delete-entry`, {
            params: {
                entryId: entryId.toString()
            }
        })
        return data
    }

    static get ShopsListGroupName(){
        return 'dynodb_shops';
    }

    static async GetShops(){
        const shops = await GenericEntriesService.GetEntries(this.ShopsListGroupName);
        shops.forEach(s => s._id = s._id.toString())
        return shops;
    }

    static async SaveShop(data){
        const shop = await GenericEntriesService.SaveEntry(this.ShopsListGroupName, data);
        this.InvalidateShopsCache();
        return shop;
    }

    static async DeleteShop(shopId){
        await GenericEntriesService.DeleteEntry(this.ShopsListGroupName, shopId);
        this.InvalidateShopsCache();
    }

    /**
     * @private
     * @type {{name: string, _id: string}[] | null}
     */
    static __shopsListCache = null;

    /**
     * 
     * @param {boolean?} refresh 
     * @returns 
     */
    static async GetCachedShops(refresh){
        if(refresh){
            this.InvalidateShopsCache();
        }
        if(this.__shopsListCache == null){
            this.__shopsListCache = await this.GetShops();
        }
        return this.__shopsListCache;
    }

    /**
     * @private
     */
    static InvalidateShopsCache(){
        this.__shopsListCache = null;
    }

}