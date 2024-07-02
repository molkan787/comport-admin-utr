import path from 'path'
export function GetMyResourcesDirPath(...paths){
    const dirs = global.DEV ? ['resources'] : ['resources', 'app.asar.unpacked', 'resources']
    return path.join(process.cwd(), ...dirs, ...paths)
}