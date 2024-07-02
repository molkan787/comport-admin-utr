export function allPropsSearchFilter(value, search, item){
    if(!search) return true;
    const values = Object.values(item);
    const len = values.length;
    const s = search.replace(/\s/g, '').toLowerCase();
    for(let i = 0; i < len; i++){
        let val = values[i]
        if(val){
            if(typeof val == 'object'){
                const match = allPropsSearchFilter(value, search, val);
                if(match) return true;
            }else{
                val = val.toString().replace(/\s/g, '').toLowerCase();
                if(val.includes(s)) return true;
            }
        }
    }
    return false;
}