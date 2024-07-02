import { MongoClient } from 'mongodb'
import { mongo_uri } from '../config.json'
export { ObjectId } from 'mongodb'

export const client = new MongoClient(mongo_uri)

export function coll(dbName, collectionName){
    const database = client.db(dbName);
    return database.collection(collectionName);
}
