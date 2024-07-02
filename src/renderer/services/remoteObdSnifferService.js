import { coll } from './db'
import { v4 as uuidv4 } from 'uuid';

const recordingsCollection = coll('remote_obd_sniffer', 'recordings')
const dataCollection = coll('remote_obd_sniffer', 'recordings_data')

export class RemoteObdSnifferService{

    static async GetRecordings(){
        const docs = await recordingsCollection.find().toArray()
        return docs
    }

    /**
     * @param {{Name: string}} data 
     * @returns 
     */
    static async CreateRecording(data){
        const docdata = {
            uid: uuidv4(),
            Name: data.Name,
            CreatedAt: new Date(),
            UpdatedAt: new Date()
        }
        const result = await recordingsCollection.insertOne(docdata)
        docdata._id = result.insertedId
        return docdata
    }

    static async DeleteRecording(recordingUid){
        await Promise.all([
            recordingsCollection.deleteOne({ uid: recordingUid }),
            dataCollection.deleteOne({ uid: recordingUid }),
        ])
    }

    static async GetRecordingItems(recordingUid){
        const doc = await dataCollection.findOne({ uid: recordingUid })
        if(doc){
            const sorted = doc.items.sort((a, b) => a.time - b.time)
            return this.ProcessRecordingItems(sorted)
        }
        else return null
    }

    static ProcessRecordingItems(items){
        const len = items.length
        for(let i = 0; i < len; i++){
            const item = items[i]
            if(this.IsTxId(item.bytes.buffer)){
                item.dir = 'w'
            }
        }
        return items
    }

    static IsTxId(buffer){
        for(let i = 0; i < this._TxIds.length; i++){
            const txid = this._TxIds[i]
            const result = txid.compare(buffer, 0, 4, 0, 4)
            if(result === 0) return true
        }
        return false
    }

    static _TxIds = [
        Buffer.from('000007E0', 'hex'),
        Buffer.from('000007E1', 'hex'),
        Buffer.from('000007E2', 'hex'),
    ]

}