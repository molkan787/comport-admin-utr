import ffi from 'ffi-napi'

export class LibraryLoaderService{

    /**
     * @type {Map<string, ffi.Library}
     */
    static _cache = new Map()

    /**
     * 
     * @param {string} dllPath 
     * @param {TDefinition} functions 
     * @type {<TDefinition extends ffi.LibraryObjectDefinitionBase | ffi.LibraryObjectDefinitionInferenceMarker>() => ffi.LibraryObject<ffi.LibraryObjectDefinitionToLibraryDefinition<TDefinition>>} 
     */
    static Load(dllPath, functions){
        const lkey = this._lkey(dllPath, functions)
        const cLib = this._cache.get(lkey)
        if(cLib){
            return cLib
        }else{
            const lib = ffi.Library(dllPath, functions)
            this._cache.set(lkey, lib)
            return lib
        }
    }

    static _lkey(dllPath, functions){
        return dllPath + '|' + JSON.stringify(functions)
    }

}