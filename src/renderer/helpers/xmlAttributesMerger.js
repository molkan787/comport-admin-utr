export default class XmlAttributesMerger{

    static process(xml){
        const len = xml.length
        const rb = []
        let inAtAr = 0
        let inStr = null
        const gotTagOpen = () => { if(inAtAr == 0) inAtAr = 1 }
        const gotSpace = () => { if(inAtAr == 1) inAtAr = 2 }
        const gotTagClose = () => { inAtAr = 0 }
        const gotQuote = (c) => {
            if(inStr == null) inStr = c
            else if(inStr == c) inStr = null
        }
        const atAr = () => inAtAr == 2
        const atStr = () => inStr != null
        let dlc = 0
        let buf = ''
        let rawAttrs = []
        for(let i = 0; i < len; i++){
            const c = xml[i]
            if(atAr()){
                // if(dlc++ < 30) console.log(c, atStr(), inStr)
                if(c == '"' || c == "'") gotQuote(c)
                if(c == '>' && !atStr()) gotTagClose()
                else buf += c
                const nxtC = xml[i+1]
                if(!atStr() && (/\s/.test(nxtC) || nxtC == '/' || nxtC == '>')){
                    // if(dlc < 6) console.log(atStr(), inStr, `'${nxtC}'`, buf)
                    rawAttrs.push(buf)
                    buf = ''
                }
            }else{
                rb.push(c)
                if(/\s/.test(c)) gotSpace()
                else if(c == '<') gotTagOpen()
                else if(c == '>') gotTagClose()
            }
            if(!atAr() && rawAttrs.length > 0){
                // if(dlc++ < 10) console.log(rawAttrs)
                const merged = this.mergeAttributes(rawAttrs)
                rb.push(merged + '>')
                rawAttrs = []
            }
        }
        return rb.join('')
    }

    static mergeAttributes(rawAttrs){
        rawAttrs = rawAttrs.map(ra => ra.trim()).filter(ra => !!ra)
        const attrs = {}
        let selfClose = false
        for(let i = 0; i < rawAttrs.length; i++){
            let [name, value] = rawAttrs[i].split('=')
            if(typeof value != 'string') value = ''
            const lastChar = value[value.length-1]
            if(lastChar == '/' || lastChar == '?'){
                selfClose = lastChar
                value = value.substr(0, value.length - 1)
            }else if(name == '/'){
                selfClose = '/'
                continue
            }
            if((value.startsWith('"') && value.endsWith('"')) || value.startsWith("'") && value.endsWith("'"))
                value = value.substr(1, value.length - 2)
            if(typeof attrs[name] == 'string')
                attrs[name] += ' ' + value
            else
            attrs[name] = value
        }
        let str = Object.entries(attrs).map(([k, v]) => `${k}="${v}"`).join(' ')
        if(selfClose) str += ' ' + selfClose
        return str
    }

}