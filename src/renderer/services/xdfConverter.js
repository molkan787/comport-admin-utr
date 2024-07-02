import { ObjectId } from 'mongodb'

export default class XdfConverter{

    static convert({ XdfCategories, XdfTables }){
        const folders = this.xdfCategoriesToFolders(XdfCategories)
        const otherTables = []
        XdfTables.forEach(t => {
            console.log('processing:', t)
            const folderIndex = parseInt((t['CATEGORYMEM'] || {})['@category']) - 1
            const binTable = this.xdfTableToBinMapTable(t)
            if(!isNaN(folderIndex)){
                const folder = folders[folderIndex]
                folder.tables.push(binTable)
            }else{
                otherTables.push(binTable)
            }
        })
        if(otherTables.length > 0){
            folders.push({
                name: 'Other',
                tables: otherTables,
                sortOrder: 0
            })
        }
        return folders
    }

    static xdfTableToBinMapTable(xdfTable){
        const axes = xdfTable.XDFAXIS;
        const baseAxis = axes.find(a => a['@id'] == 'z')
        const xAxis = axes.find(a => a['@id'] == 'x')
        const yAxis = axes.find(a => a['@id'] == 'y')
        const baseEDD = baseAxis['EMBEDDEDDATA']
        const baseFLAGS = parseInt(baseEDD['@mmedtypeflags'])
        const COL_MAJOR = (baseFLAGS & 0x04) != 0
        
        const table = {
            _id: ObjectId(),
            name: xdfTable['title'],
            description: xdfTable['description'],
            sortOrder: parseInt((xdfTable['CATEGORYMEM'] || {})['@index']) || 0,
            ...this.xdfAxisToBinMap(baseAxis),
            rowsCount: parseInt(baseEDD['@mmedrowcount']),
            columnsCount: parseInt(baseEDD['@mmedcolcount']),
            axisX: this.xdfAxisToBinMap(xAxis),
            axisY: this.xdfAxisToBinMap(yAxis),
            majorOrder: COL_MAJOR ? 0 : 1, // 0 = Columns, 1 = Rows
            lowRange: undefined,
            highRange: undefined,
            elements: []
        }
        table.name = (xdfTable['title'] || '').replace(new RegExp('&quot;', 'g'), '"')
        return table
    }

    static xdfAxisToBinMap(xdfAxis){
        const EDD = xdfAxis['EMBEDDEDDATA']
        const FLAGS = parseInt(EDD['@mmedtypeflags'])
        let addr = parseInt(EDD['@mmedaddress']);
        if(addr != 0xFFFFE000 && addr != 0xFFFFFFFF){
            addr += 1; // temporary correction
        }
        return {
            name: '',
            address: addr,
            formula: (xdfAxis['MATH'] || {})['@equation'] || '1',
            dataSize: parseInt(EDD['@mmedelementsizebits']) / 8,
            lsbFirst: (FLAGS & 0x02) != 0,
            signed: (FLAGS & 0x01) != 0,
            decimalPlaces: xdfAxis['decimalpl'],
            unit: xdfAxis['units'] || ''
        }
    }

    static xdfCategoriesToFolders(xdfCategories){
        return xdfCategories.map(c => ({
            name: (c['@name'] || '').replace(new RegExp('&quot;', 'g'), '"'),
            tables: [],
            sortOrder: 0
        }))
    }

}