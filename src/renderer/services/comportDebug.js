import { ObjectId } from 'mongodb'
import { coll } from './db'

export class ComportDebugSerivce{

    static async GetExceptions(appName){
        const exceptionsColl = coll('exceptions', appName)
        const exceptions = await exceptionsColl.find(
            {},
            { projection: { ExceptionHash: 1, Count: 1, ExceptionHeader: 1, LastOccurrenceDate: 1, Archived: 1 } }
        ).toArray()
        return exceptions
    }

    static async GetExceptionFullData(appName, id){
        const exceptionsColl = coll('exceptions', appName)
        const exception = await exceptionsColl.findOne(ObjectId(id))
        return exception
    }

    static async ArchiveException(appName, id){
        const exceptionsColl = coll('exceptions', appName)
        await exceptionsColl.updateOne(
            { _id: ObjectId(id) },
            { $set: { Archived: true } }
        )
    }

}