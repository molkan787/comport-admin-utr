import { ObjectId, GridFSBucket } from 'mongodb'
import path from 'path'
import fs from 'fs'
import { client, coll } from './db'
import { arrayToMap } from '../utils'

export class GenericEntriesService{

    /**
     * @typedef {string | { database: string, collection: string }} GroupNameType 
     */

    /**
     * @param {GroupNameType} groupName 
     */
    static async GetEntries(groupName){
        const cl = this.GetCollection(groupName)
        const docs = await cl.find().toArray()
        return docs
    }

    /**
     * @param {GroupNameType} groupName 
     * @param {Record<string, any>} entryData 
     * @returns 
     */
    static async SaveEntry(groupName, entryData){
        const cl = this.GetCollection(groupName)
        const bucket = this.GetFSBucket(groupName)
        const IsExistingEntry = typeof entryData._id == 'string' || typeof entryData._id == 'object'
        const { _id, __$attachements, ...data } = entryData
        const existingAttachments = []
        const uploadTasks = []
        if(Array.isArray(__$attachements)){
            for(let i = 0; i < __$attachements.length; i++){
                const atch = __$attachements[i]
                const existing = typeof atch == 'object' && typeof atch.fileId == 'string'
                if(existing){
                    existingAttachments.push(atch)
                }else{
                    const index = i
                    uploadTasks.push(
                        async () => {
                            const dAtch = await this.UploadEntryAttachement(bucket, atch)
                            __$attachements[index] = dAtch
                        }
                    )
                } 
            }
        }
        if(IsExistingEntry){
            const currentDoc = await cl.findOne({ _id: ObjectId(_id) })
            const currentAttachments = currentDoc && currentDoc.__$attachements
            if(Array.isArray(currentAttachments)){
                const existingAttachmentsMap = arrayToMap(existingAttachments, item => item.fileId, () => true)
                const forDeletion = []
                for(let attachement of currentAttachments){
                    const keep = existingAttachmentsMap[attachement.fileId]
                    if(!keep){
                        forDeletion.push(attachement.fileId)
                    }
                }
                await Promise.all(forDeletion.map(fileId => bucket.delete(ObjectId(fileId))))
            }
        }
        await Promise.all(uploadTasks.map(task => task()))
        
        const insertData = {
            ...data,
            __$attachements
        }
        if(IsExistingEntry){
            await cl.updateOne(
                { _id: ObjectId(_id) },
                { $set: insertData }
            )
            return entryData
        }else{
            const result = await cl.insertOne(insertData)
            return {
                ...insertData,
                _id: result.insertedId
            }
        }
    }

    /**
     * @param {GroupNameType} groupName 
     * @param {string | ObjectId} entryId 
     */
    static async DeleteEntry(groupName, entryId){
        const cl = this.GetCollection(groupName)
        const bucket = this.GetFSBucket(groupName)
        const currentDoc = await cl.findOne({ _id: ObjectId(entryId) })
        const currentAttachments = currentDoc && currentDoc.__$attachements
        if(Array.isArray(currentAttachments)){
            await Promise.all(currentAttachments.map(a => bucket.delete(ObjectId(a.fileId))))
        }
        await cl.deleteOne({
            _id: ObjectId(entryId)
        })
    }

    /**
     * @param {GroupNameType} groupName 
     * @param {any} attachement 
     * @param {fs.PathLike} fsDestination 
     * @returns 
     */
    static DownloadEntryAttachement(groupName, attachement, fsDestination){
        return new Promise((resolve, reject) => {
            const bucket = this.GetFSBucket(groupName)
            const downloadStream = bucket.openDownloadStream(ObjectId(attachement.fileId))
            console.log(attachement.fileId)
            const writeStream = fs.createWriteStream(fsDestination)
            downloadStream.on('error', err => reject(err))
            writeStream.on('error', err => reject(err))
            writeStream.on('finish', () => resolve(fsDestination))
            downloadStream.pipe(writeStream)
        })
    }

    /**
     * @private
     * @param {GridFSBucket} fsBucket 
     * @param {string | { displayFilename: string, fsFilename: string }} fileToUpload 
     * @returns {Promise<{ fileId: string, displayFilename: string }>}
     */
    static UploadEntryAttachement(fsBucket, fileToUpload){
        return new Promise((resolve, reject) => {
            let displayFilename = ''
            let fsFilename = ''
            if(typeof fileToUpload == 'string'){
                displayFilename = path.basename(fileToUpload)
                fsFilename = fileToUpload
            }else if(typeof fileToUpload == 'object' && fileToUpload !== null){
                displayFilename = fileToUpload.displayFilename
                fsFilename = fileToUpload.fsFilename
            }else{
                throw new Error('Unknow argument type of `fileToUpload`')
            }
            const readStream = fs.createReadStream(fsFilename)
            const uploadStream = fsBucket.openUploadStream(displayFilename)
            uploadStream.on('error', err => reject(err))
            uploadStream.on('finish', () => resolve({
                fileId: uploadStream.id.toString(),
                displayFilename
            }))
            readStream.pipe(uploadStream)
        })
    }

    /**
     * @private
     * @param {GroupNameType} groupName 
     */
    static GetCollection(groupName){
        if(typeof groupName === 'string'){
            return coll('generic_entries', groupName)
        }else{
            return coll(groupName.database, groupName.collection)
        }
    }

    /**
     * @private
     * @param {GroupNameType} groupName 
     */
    static GetFSBucket(groupName){
        if(typeof groupName === 'string'){
            return new GridFSBucket(client.db('generic_entries'), { bucketName: groupName })
        }else{
            return new GridFSBucket(client.db(groupName.database), { bucketName: groupName.collection })
        }
    }

}