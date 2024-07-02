import { ObjectId } from 'mongodb'
import { client } from './db'

export class DefinitionsService{

    static init(){
        this.db = client.db('definitions')
        this.blocksDb = client.db('blocks_definitions')
    }

    // --------------------- Definitions (collections) ---------------------

    static async getDefinitions(){
        const collections = await this.db.listCollections().toArray()
        const definitions = collections.map(coll => ({
            name: coll.name,
            uuid: coll.info.uuid.toUUID().toHexString()
        }))
        return definitions
    }

    static async createDefinition(data){
        const _colls = await this.db.listCollections({ name: data.name }).toArray()
        if(_colls.length > 0)
            throw new Error(`Definition with name "${data.name}" already exists.`)

        const collection = this.db.collection(data.name)
        const result = await collection.insertOne({})
        await collection.deleteOne({ _id: ObjectId(result.insertedId) })
        const colls = await this.db.listCollections({ name: data.name }).toArray()
        const coll = colls[0]
        return {
            name: coll.name,
            uuid: coll.info.uuid.toUUID().toHexString()
        }
    }

    static async deleteDefinition(data){
        const collection = this.db.collection(data.name)
        return await collection.drop()
    }

    // --------------------- Folders - group of tables (documents) ---------------------

    static async importDefinitionFolders(definitionName, folders){
        const collection = this.db.collection(definitionName)
        const result = await collection.insertMany(folders)
        return result.insertedIds
    }

    /**
     * 
     * @param {string} definitionName 
     * @param {Array} items 
     */
    static async setDefinitionFoldersSortOrder(definitionName, items){
        const collection = this.db.collection(definitionName)
        const queries = items.map(item => collection.updateOne(
            { _id: ObjectId(item._id) },
            {$set: {
                sortOrder: item.sortOrder
            }}
        ))
        await Promise.all(queries)
    }

    static async getDefinitionFolders(definitionName){
        const collection = this.db.collection(definitionName)
        const definitions = await collection.find().toArray()
        return definitions
    }

    static async saveDefinitionFolder(definitionName, data, isNew){
        const collection = this.db.collection(definitionName)
        if(isNew){
            const result = await collection.insertOne({
                ...data,
                tables: []
            })
            return {
                ...data,
                _id: result.insertedId
            }
        }else{
            const { tables, _id, ...dataToUpdate } = data
            await collection.updateOne(
                { _id: ObjectId(_id) },
                { $set: dataToUpdate }
            )
            return data
        }
    }

    static async deleteDefinitionFolder(definitionName, data){
        const collection = this.db.collection(definitionName)
        await collection.deleteOne({ _id: ObjectId(data._id) })
    }

    // --------------------- Tables (items of folder.tables array) ---------------------


    static async setDefinitionTablesSortOrder(definitionName, folderId, items){
        const collection = this.db.collection(definitionName)
        const queries = items.map(item => collection.updateOne(
            {
                _id: ObjectId(folderId),
                'tables._id': ObjectId(item._id)
            },
            {$set: {
                'tables.$.sortOrder': item.sortOrder
            }}
        ))
        await Promise.all(queries)
    }

    static async saveDefinitionTable(definitionName, folderId, data, isNew){
        const collection = this.db.collection(definitionName)
        if(isNew){
            const doc = { _id: ObjectId(), ...data }
            await collection.updateOne(
                { _id: ObjectId(folderId) },
                {
                    $push: {
                        tables: doc
                    }
                }
            )
            return doc
        }else{
            const { _id, ...oData} = data
            const doc = { _id: ObjectId(_id), ...oData }
            await collection.updateOne(
                {
                    _id: ObjectId(folderId),
                    'tables._id': ObjectId(_id)
                },
                {
                    $set: {
                        'tables.$': doc
                    }
                }
            )
            return doc
        }
    }

    // --------------------- Blocks definitions ---------------------

    static async getBlocksDefinitions(definitionName){
        const collection = this.blocksDb.collection(definitionName)
        const blocksDefinitions = await collection.find().toArray()
        return blocksDefinitions
    }

    static async saveBlockDefinition(definitionName, data, isNew){
        const collection = this.blocksDb.collection(definitionName)
        if(isNew){
            const result = await collection.insertOne(data)
            return {
                ...data,
                _id: result.insertedId
            }
        }else{
            const { _id, ...restData } = data
            await collection.updateOne(
                { _id: ObjectId(_id) },
                { $set: restData }
            )
            return data
        }
    }

}

DefinitionsService.init()