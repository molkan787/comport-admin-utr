import { SanitizeHTML } from "../../helpers/htmlSanitizer"
import { LogType } from "../../services/userlogs"
import { deepClone } from "../../utils"

export function PrepareItems(items){
    const result = []
    const len = items.length
    for(let i = 0; i < len; i++){
        const item = ProcessItem(items[i], i)
        if(item.logType === LogType.MethodCallEnd) continue;
        result.push(item)
    }
    return result
}

export function ProcessItemData(item){
    item.IsUdsMessage = IsUdsMessage(item)
    if(item.IsUdsMessage){
        item.UdsMessageParts = GetUDSMessageParts(item)
    }
    item.IsLessImportant = IsLessImportant(item)
    item.IsError = IsError(item)
    if(item.IsError){
        ProcessError(item)
    }
    OtherAttributes(item)
    item.classes = GetItemClasses(item)
    return item
}

function ProcessItem(sourceItem, index){
    const item = deepClone(sourceItem)
    item.uid = `${index}-${item.time}`
    item.IsUdsMessage = IsUdsMessage(item)
    if(item.IsUdsMessage){
        item.UdsMessageParts = GetUDSMessageParts(item)
    }
    item.IsLessImportant = IsLessImportant(item)
    item.IsError = IsError(item)
    if(item.IsError){
        ProcessError(item)
    }
    OtherAttributes(item)
    item.classes = GetItemClasses(item)
    return item
}

function IsUdsMessage(item){
    if(item.logType !== 1) return false
    const sudp = item.data.substr(0, 20)
    return (
        sudp.length === 20 &&
        sudp.includes(':') &&
        (sudp.includes('TX:') || sudp.includes('RX:'))
    )
}

function GetUDSMessageParts(item){
    const d = item.data
    const parts = d.split(' ', 2)
    const bytesPart = d.substring(parts.join(' ').length + 1)
    return {
        time: parts[0] ,
        type: parts[1] ,
        bytes: bytesPart
    }
}

function IsLessImportant(item){
    if(item.logType !== 1) return false
    const d = item.data.toLowerCase().trim()
    return (
        d === '---- requested ended ----' ||
        d === '---- requested started ----' ||
        d === 'rx buffer cleared' ||
        d.startsWith('progress:') ||
        d === 'status_noerror' ||
        d === 'err_buffer_empty'
    )
}

function IsError(item){
    const d = item.data
    if(item.logType !== 1 && item.logType !== 2) return false
    return (
        (
            d.includes('J2534DotNet-master') &&
            d.includes('.cs:line')
        ) ||
        (
            (d.includes('Exception') || d.includes('exception') || d.includes('Error') || d.includes('error')) &&
            d.includes('at')
        ) ||
        d.includes('Full response: 00 00')
    )
}

function OtherAttributes(item){
    item.IsUIConsoleLog = item.logType === 1 && item.data.startsWith('UI CONSOLE LOG:')
}

function GetItemClasses(item){
    const classes = ['logtype-' + item.logType]
    if(item.IsUdsMessage){
        classes.push('uds-message')
        const typeClass = item.UdsMessageParts.type.substring(0, 2).toLowerCase()
        classes.push(typeClass)
    }
    if(item.IsLessImportant || item.logType === 6 || item.logType === 7) classes.push('less-important')
    if(item.IsUIConsoleLog) classes.push('ui-console-log')
    if(item.IsError) classes.push('danger', 'exception')
    return classes.join(' ')
}



function ProcessError(item){
    let { data } = item
    data.replace(/\ at/g, '\n  at')
    let lines
    lines = data.split('\n')
    for(let i = lines.length - 1; i >= 0; i--){
        const ln = lines[i]
        if(ContainsErrorGarbage(ln) || ln.trim().length === 0){
            lines.splice(i, 1)
        }
    }
    data = lines.join('\n')

    data = SanitizeHTML(data)
    lines = data.split(' at ')
    lines = lines.map(ln => {
        const [first, ...parts] = ln.split('(')
        if(parts.length < 1) return ln
        return `<b>${first}</b>(${parts.join('(')}`
    })
    data = lines.join(' at ')

    item.data = data
}
const ErrorsGarbage = [
    '--- End of stack trace from previous location where exception was thrown ---',
    'System.Runtime.CompilerServices.TaskAwaiter.ThrowForNonSuccess',
    'System.Runtime.CompilerServices.TaskAwaiter.HandleNonSuccessAndDebuggerNotification',
    '--- End of inner exception stack trace ---',
    'ExclusiveSynchronizationContext.BeginMessageLoop',
    'c__DisplayClass0_0.<<RunSync>b__0>d.MoveNext'
]
function ContainsErrorGarbage(line){
    const len = ErrorsGarbage.length
    for(let i = 0; i < len; i++){
        if(line.includes(ErrorsGarbage[i])){
            return true
        }
    }
    return false
}