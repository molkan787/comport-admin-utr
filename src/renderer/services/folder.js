import { ObjectId, client } from './db'
import { GridFSBucket } from 'mongodb'
import path from 'path'
import fs from 'fs'
import progressStream from 'progress-stream'
import mkdirp from 'mkdirp'
import { arrayToMap, numOrDefault } from '../utils'

const DB_NAME = 'flash_files' // 'firmwares'
const FirmwareDB = client.db(DB_NAME)
const FlashesBucket = new GridFSBucket(FirmwareDB, { bucketName: 'flashes' })
const FlashesCollection = FirmwareDB.collection('flashes.files')
const FoldersCollection = FirmwareDB.collection('folders')

export class FolderService{
    
    static init(){
        this.firmwaresDb = client.db('firmwares')
    }

    static async getFolders(){
        const folders = await FoldersCollection.find().toArray()
        return folders
    }

    static async addFolder(data){
        const { name, type } = data
        const result = await FoldersCollection.insertOne({ name, type })
        return {
            _id: result.insertedId,
            name,
            type
        }
    }

    static async deleteFolder(folderId){
        const files = await FlashesBucket.find({
            'metadata.folderId': folderId.toString()
        }).toArray()
        await Promise.all(files.map(f => FlashesBucket.delete(f._id)))
        await FoldersCollection.deleteOne({ _id: ObjectId(folderId) })
    }

    static async renameFolder(sourceName, targetName){
        const folderDoc = await FoldersCollection.findOne({ name: sourceName })
        if(folderDoc){
            await FoldersCollection.updateOne(
                { _id: ObjectId(folderDoc._id) },
                {
                    $set: {
                        name: targetName
                    }
                }
            )
        }
    }

    static async saveFilesSortOrder(folder, items){
        const queries = items.map(i => FlashesCollection.updateOne(
            { _id: ObjectId(i._id) },
            {
                $set: {
                    'metadata.sortOrder': i.sortOrder
                }
            }
        ))
        await Promise.all(queries)
    }

    static async updateFileAttributes(fileId, attributes){
        await FlashesCollection.updateOne(
            { _id: ObjectId(fileId) },
            {
                $set: {
                    'metadata.attributes': attributes
                }
            }
        )
    }

    static async getFiles(folder){
        const folderId = await this.GetFolderIdByName(folder)
        const docs = await FlashesBucket.find({
            'metadata.folderId': folderId
        }).toArray()
        const files = docs
            .sort((a, b) => numOrDefault(a.metadata.sortOrder, 100000) - numOrDefault(b.metadata.sortOrder, 100000))
            .map(d => ({
                _id: d._id.toString(),
                name: d.filename,
                length: d.length,
                metadata: d.metadata
            }))
        return files
    }

    static async deleteFile(folder, fileId){
        await FlashesBucket.delete(ObjectId(fileId))
        return fileId
    }

    static uploadFile(folder, filePath){
        return new Promise(async (resolve, reject) => {
            const folderId = await this.GetFolderIdByName(folder)
            const filename = path.basename(filePath)
            const rs = fs.createReadStream(filePath)
            const us = FlashesBucket.openUploadStream(filename, { metadata: { folderId } })
            rs.pipe(us)
            rs.on('end', () => {
                resolve({
                    _id: us.id,
                    name: filename,
                    metadata: { folderId }
                })
            })
            us.on('error', reject)
        })
    }

    static async renameFile(folder, fileId, newName){
        await FlashesBucket.rename(ObjectId(fileId), newName)
        return {
            _id: fileId,
            name: newName
        }
    }

    static downloadFile(folder, fileId, destinationFilename, progressCallback){
        return new Promise(async (resolve, reject) => {
            const files = await FlashesBucket.find({ _id: ObjectId(fileId) }).toArray()
            if(files.length === 0) throw new Error('File not found')
            const size = files[0].length
            const prgStream = progressStream({
                length: size,
                time: 50
            })
            prgStream.on('progress', progressCallback)

            const dir = path.dirname(destinationFilename)
            await mkdirp(dir)
            const downloadStream = FlashesBucket.openDownloadStream(ObjectId(fileId))
            const writeStream = fs.createWriteStream(destinationFilename)
            
            downloadStream.pipe(prgStream).pipe(writeStream)
            downloadStream.on('error', reject)
            writeStream.on('error', reject)
            downloadStream.on('end', () => resolve(destinationFilename))
        })
    }

    static replaceFile(folder, fileId, filePath, progressCallback){
        return new Promise(async (resolve, reject) => {
            const stats = await new Promise((resolve, reject) => fs.stat(filePath, (error, stats) => {
                if(error) reject(error)
                else resolve(stats)
            }))
            const folderId = await this.GetFolderIdByName(folder)
            const readStream = fs.createReadStream(filePath)
            const [file] = await FlashesBucket.find({ _id: ObjectId(fileId) }).toArray()
            await FlashesBucket.delete(ObjectId(fileId))
            const { filename } = file
            const uploadStream = FlashesBucket.openUploadStream(filename, { id: ObjectId(fileId), metadata: { folderId } })
            const progStream = progressStream({
                length: stats.size,
                time: 50
            })
            progStream.on('progress', progressCallback)

            readStream.pipe(progStream).pipe(uploadStream)
            readStream.on('end', () => {
                resolve({
                    _id: uploadStream.id,
                    name: filename
                })
            })
            uploadStream.on('error', reject)
        })
    }

    static async search(query){
        const s = query.replace(/\s/g, '').toLowerCase()
        const folders = await this.getFolders()
        const matchingFolders = []
        const remainingFolders = []
        const len = folders.length
        for(let i = 0; i < len; i++){
            const f = folders[i]
            const name = f.name.replace(/\s/g, '').toLowerCase()
            if(name.includes(s)){
                matchingFolders.push(f)
            }else{
                remainingFolders.push(f)
            }
        }
        const matchingFiles = await FlashesCollection.find(
            {
                filename: {
                    $regex: s,
                    $options: 'i'
                }
            },
            {
                projection: {
                    metadata: 1
                }
            }
        ).toArray()
        const foldersMap = arrayToMap(remainingFolders, f => f._id.toString(), f => f)
        for(let i = 0; i < matchingFiles.length; i++){
            const file = matchingFiles[i]
            const { folderId } = file.metadata
            const folder = foldersMap[folderId]
            if(folder){
                delete foldersMap[folderId]
                matchingFolders.push(folder)
            }
        }

        return matchingFolders
    }

    static async GetFolderIdByName(folderName){
        const folderDoc = await FoldersCollection.findOne({ name: folderName })
        return (folderDoc && folderDoc._id.toString()) || null
    }

    static getBucket(folderName){
        return new GridFSBucket(this.firmwaresDb, { bucketName: folderName })
    }

    static getCollection(folderName){
        return this.firmwaresDb.collection(`${folderName}.files`)
    }

}

FolderService.init()