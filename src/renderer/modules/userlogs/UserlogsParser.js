export const MSG_TYPE = Object.freeze({
    TX: 'TX',
    RX: 'RX'
})

export class UserlogsParser{

    /**
     * @typedef {{ type: string, channelId: number[], data: number[] }} Message
     * @typedef {{ tx: Message, rx: messages }} Request
     */

    static ParseLogsRequests(logsItems){
        const messages = this.ParseMessages(logsItems)
        const requests = this.MatchMessages(messages)
        return requests
    }

    /**
     * @param {Message[]} messages 
     */
    static MatchMessages(messages){
        /** @type {Request[]} */
        const requests = []
        /** @type {Message} */
        let txMsg = null
        const len = messages.length
        for(let i = 0; i < len; i++){
            const msg = messages[i]
            const isPendingResponse = msg.type === MSG_TYPE.RX && msg.data.length >= 3 && msg.data[0] === 0x7f && msg.data[2] === 0x78
            if(isPendingResponse) continue
            if(msg.type === MSG_TYPE.RX && !!txMsg){
                if(this.TxRxMatches(txMsg, msg)){
                    requests.push({
                        tx: txMsg,
                        rx: msg
                    })
                }
            }else if(msg.type === MSG_TYPE.TX){
                txMsg = msg
            }
        }
        return requests
    }

    /**
     * 
     * @param {Message} txMsg 
     * @param {Message} rxMsg 
     */
    static TxRxMatches(txMsg, rxMsg){
        // TODO: (Maybe) Add checking for response status match
        const txId = txMsg.channelId
        const rxId = rxMsg.channelId
        const m1 = txId[3] + 8 === rxId[3]
        const m2 = txId[2] === rxId[2]
        return m1 && m2
    }

    static ParseMessages(items){
        const messages = []
        const len = items.length
        for(let i = 0; i < len; i++){
            const item = items[i]
            if(item.logType !== 1) continue
            const msg = this.ParseMessageItem(item)
            if(msg === null) continue
            messages.push(msg)
        }
        return messages
    }

    /**
     * @param {{data: string}} item 
     * @returns {Message | null}
     */
    static ParseMessageItem(item){
        const str = item.data
        const [p1, p2] = str.split(' ', 2)
        if(p2 !== 'RX:' && p2 !== 'TX:') return null
        if(!p1.includes('.')) return null
        const bytes = []
        const parts = str.split(' ')
        const len = parts.length
        for(let i = 2; i < len; i++){ // skip first 2 and last element as they are not bytes values
            const p = parts[i]
            if(p.length == 2){
                const byte = parseInt(p, 16)
                bytes.push(byte)
            }
        }
        return {
            type: p2.substring(0, 2),
            channelId: bytes.slice(0, 4),
            data: bytes.slice(4)
        }
    }

    // ---------------------------------------------------------

}