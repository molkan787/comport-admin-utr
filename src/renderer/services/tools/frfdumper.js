import { exec } from "child_process"
import { GetMyResourcesDirPath } from '../pathsResolver'

export class FrfDumperService{

    /**
     * 
     * @param {string} frfFilename 
     * @returns {{ OdxFilename: string, Info:string }}
     */
    static async DumpData(frfFilename){
        const progFilename = GetMyResourcesDirPath('frfdumper.jar')
        const cmd = `java -jar "${progFilename}" --frf "${frfFilename}" --keepodx`
        return await new Promise((resolve, reject) => {
            exec(cmd, (error, stdout, stderr) => {
                if(!!error){
                    reject(error)
                }else{
                    resolve(this._prepareOutput(stdout))
                }
            })
        })
    }

    static _prepareOutput(raw){
        const INFO_START = '* dumping odx data:'
        const INFO_END = '* exporting odx file to'
        const lines = raw.split('\n').map(ln => ln.trim())
        const infoLines = []
        let odxFilename = null
        let buffering = false
        for(let i = 0; i < lines.length; i++){
            const ln = lines[i]
            if(ln === INFO_START){
                buffering = true
                continue
            }
            if(ln.startsWith(INFO_END)){
                odxFilename = ln.substr(INFO_END.length).trim()
                break
            }
            if(buffering){
                infoLines.push(ln)
            }
        }
        return {
            OdxFilename: odxFilename,
            Info: infoLines.join('\n')
        }
    }

}