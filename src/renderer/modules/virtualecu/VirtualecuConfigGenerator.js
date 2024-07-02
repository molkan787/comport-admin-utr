import { MSG_TYPE, UserlogsParser } from "../userlogs/UserlogsParser";

export class VirtualecuConfigGenerator{

    static GenerateFromUserLogs(logsItems){
        console.log(logsItems)
        const requests = UserlogsParser.ParseLogsRequests(logsItems)
        const filteredRequests = this.FilterOutUnwantedRequests(requests)
        const groupedRequests = this.GroupRequestsByTxId(filteredRequests)
        const configStr = this.GenerateTextConfig(groupedRequests)
        return configStr
    }

    static GenerateFromObdRecording(recordingItems){
        const messages = this.ObdRecordingItemsToUserLogObdMessages(recordingItems)
        const requests = UserlogsParser.MatchMessages(messages)
        const filteredRequests = this.FilterOutUnwantedRequests(requests)
        const groupedRequests = this.GroupRequestsByTxId(filteredRequests)
        const configStr = this.GenerateTextConfig(groupedRequests)
        return configStr
    }

    static ObdRecordingItemsToUserLogObdMessages(recordingItems){
        const result = []
        const len = recordingItems.length
        for(let i = 0; i < len; i++){
            const item = recordingItems[i]
            var numData = item.bytes.buffer.toJSON().data
            var channelId = numData.slice(0, 4)
            var obdData = numData.slice(4)
            var type = item.dir === 'w' ? MSG_TYPE.TX : MSG_TYPE.RX
            result.push({
                type: type,
                channelId: channelId,
                data: obdData
            }) 
        }
        return result
    }

    /**
     * @typedef {ReturnType<UserlogsParser.ParseLogsRequests>} Requests 
     * @param {Requests} requests
     * @returns {{ txId: string, requests: Requests }[]}
     */
    static GroupRequestsByTxId(requests){
        const groups = new Map()
        const len = requests.length
        for(let i = 0; i < len; i++){
            const request = requests[i]
            const txId = Buffer.from(request.tx.channelId).toString('hex')
            let arr = groups.get(txId)
            if(!Array.isArray(arr)){
                arr = []
                groups.set(txId, arr)
            }
            arr.push(request)
        }
        return Array.from(groups.entries())
                    .map(([k, v]) => ({ txId: k, requests: v }))
    }

    /**
     * @param {ReturnType<VirtualecuConfigGenerator.GroupRequestsByTxId>} groupedRequests 
     */
    static GenerateTextConfig(groupedRequests){
        const str = []
        str.push('public class VirtualEcuDefs\n{')
        for(let group of groupedRequests){
            const { txId, requests } = group
            str.push('')
            str.push(`\tprivate RSP[] response_0x${txId} = new RSP[]\n\t{`)
            const len = requests.length
            for(let i = 0; i < len; i++){
                const { tx, rx } = requests[i]
                const txData = tx.data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')
                const rxData = rx.data.map(b => '0x' + b.toString(16).padStart(2, '0')).join(', ')
                str.push(`\t\tnew RSP(new byte[]{ ${txData} }, new byte[]{ ${rxData} }),`)
            }
            str.push('\t};')
        }
        str.push('\n}')
        return str.join('\n')
    }

    /**
     * @param {Requests} requests 
     * @returns {Requests}
     */
    static FilterOutUnwantedRequests(requests){
        const result = []
        const index = new Map()
        const len = requests.length
        for(let i = 0; i < len; i++){
            const request = requests[i]
            const { channelId, data } = request.tx
            if(data[0] == 0x36) continue // ignore chunk transfer messages
            const key = Buffer.from(channelId.concat(data)).toString('hex')
            const exists = index.get(key)
            if(!exists){
                index.set(key, true)
                result.push(request)
            }
        }
        return result
    }

}