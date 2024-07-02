import { XMLParser } from 'fast-xml-parser'
import { readFile } from '../utils'
import { DefinitionsService } from './definitions'
import XdfConverter from './xdfConverter'
import XmlAttributesMerger from '../helpers/xmlAttributesMerger' 

export default class XdfImporter{

    static async import(filename, calibrationNumber){
        const xdfData = await this.loadXdfData(filename)
        const binMapFolders = XdfConverter.convert(xdfData)
        await DefinitionsService.importDefinitionFolders(calibrationNumber, binMapFolders)
        return {
            totalFolders: binMapFolders.length,
            totalTables: binMapFolders.reduce((t, f) => f.tables.length + t, 0)
        }
    }

    static async loadXdfData(filename){
        const rawData = await readFile(filename);
        const repairedRawData = XmlAttributesMerger.process(rawData)
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '@',
            attributeValueProcessor: (name, val, jPath) => {
                if(name == 'mmedtypeflags'){
                    const parts = (val || '')
                                .split(' ')
                                .map(p => parseInt(p.trim()) || 0)
                    const flags = parts.reduce((f, p) => (f | p), 0)
                    return '0x' + flags.toString(16)
                }
                return val
            }
        });
        const { XDFFORMAT } = parser.parse(repairedRawData)
        if(!XDFFORMAT) return null;
        return {
            XdfCategories: XDFFORMAT.XDFHEADER.CATEGORY,
            XdfTables: XDFFORMAT.XDFTABLE
        }
    }

}