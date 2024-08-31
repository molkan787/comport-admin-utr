import { exec as nativeExec } from 'child_process'
const electron = require('electron')
const { dialog, shell } = electron.remote
const fs = require('fs')

export function deepClone(obj){
    return JSON.parse(JSON.stringify(obj))
}

export function cloneArray(source){
    return Array.from(source)
}

/**
 * @param {any[]} src 
 * @param {any[]} dest 
 * @returns {any[]} Returns the destination array `dest`
 */
export function largePush(src, dest){
    const len = src.length
    for(let i = 0; i < len; i++){
        dest.push(src[i])
    }
    return dest
}

export function isValidNumber(value){
    return typeof value === 'number' && !isNaN(value) && value !== Infinity && value !== -Infinity
}

export function isDigit(char){
    return char !== '' && '0123456789'.includes(char)
}

export function isNoneEmptyString(value){
    return typeof value === 'string' && value.trim().length > 0
}

export function timestamp(){
    return Math.floor(new Date().getTime() / 1000);
}

export function p(executor) {
    return new Promise(executor);
}

export function waitUntil(checker, interval) {
    return new Promise(resolve => {
        const timer = setInterval(() => {
            if (checker()) {
                clearInterval(timer);
                resolve()
            }
        }, interval || 20)
    })
}

export function rndSleep(min, max) {
    return sleep(rnd(min, max))
}

export function sleep(time) {
    return new Promise(r => setTimeout(() => r(), time))
}

export function rnd(min, max) {
    const rn = Math.random()
    return min + Math.floor((max - min) * rn)
}

export function rndItem(arr) {
    const index = Math.round(Math.random() * (arr.length - 1))
    return arr[index]
}

export async function delay(executor, time){
    await sleep(time)
    return await executor()
}

/**
 * @type {<T>(array: T[], chunkSize: number) => T[][]} 
 */
export function divideArray(array, chunkSize) {
    const result = [];
    for (let i = 0; i < array.length; i += chunkSize) {
        result.push(array.slice(i, i + chunkSize));
    }
    return result;
}

export function splitArray(arr, count){
    const chunks = []
    const chunkSize = Math.floor(arr.length / count)
    const rest = arr.length % count
    let index = 0
    for(let i = 0; i < count; i++){
        const size = chunkSize + (i < rest ? 1 : 0)
        chunks.push(arr.slice(index, index + size))
        index += size
    }
    return chunks
}

export function arrayToMap(array, keyGetter, valueGetter){
    const o = {}
    for(let i = 0; i < array.length; i++){
        const item = array[i]
        o[keyGetter(item)] = valueGetter(item)
    }
    return o
}

export function textCompare(t1, t2){
    return uglifyText(t1) == uglifyText(t2);
}

export function uglifyText(text){
    return text.toLowerCase().replace(/\s/g, '');
}

export function textContains(source, search){
    return uglifyText(source).includes(uglifyText(search))
}

/**
 * @param {string} text 
 * @returns {string}
 */
export function slugify(text){
    return trimDashes(text.trim().toLowerCase().replace(/\s/g, '_').replace(/[\W_]+/g, '-'))
}

export function trimDashes(text){
    if(typeof text == 'string' && (text.startsWith('-') || text.endsWith('-'))){
        let startIndex = 0
        for(startIndex = 0; startIndex < text.length; startIndex++){
            if(text.charAt(startIndex) !== '-') break
        }
        let endIndex = 0
        for(endIndex = text.length - 1; endIndex >= 0; endIndex--){
            if(text.charAt(endIndex) !== '-') break
        }
        return text.substring(startIndex, endIndex + 1)
    }else{
        return text
    }
}

export async function promptDirectory() {
    const resp = await dialog.showOpenDialog({
        properties: ['openDirectory']
    })
    if (resp.canceled) return null

    return resp.filePaths[0]
}

/**
 * 
 * @param {electron.OpenDialogOptions?} options 
 * @returns 
 */
export async function promptFile(options) {
    const resp = await dialog.showOpenDialog(options)
    if (resp.canceled) return null

    return resp.filePaths[0]
}

/**
 * 
 * @param {electron.SaveDialogOptions?} options 
 * @returns 
 */
export async function promptSaveFile(options) {
    const resp = await dialog.showSaveDialog(null, options)
    if (resp.canceled) return null

    return resp.filePath
}

export function showItemInFolder(filename){
    return shell.showItemInFolder(filename);
}

/**
 * 
 * @param {fs.PathLike} filename 
 * @returns {Promise<string>}
 */
export function readFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, 'utf8', (err, contents) => {
            err ? reject(err) : resolve(contents)
        })
    })
}

/**
 * 
 * @param {fs.PathLike} filename 
 * @returns {Promise<Buffer>}
 */
export function readBinFile(filename) {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, contents) => {
            err ? reject(err) : resolve(contents)
        })
    })
}

/**
 * 
 * @param {fs.PathLike} filename 
 * @param {any} data 
 * @returns {Promise<void>}
 */
export function writeFile(filename, data) {
    return new Promise((resolve, reject) => {
        fs.writeFile(filename, data, err => {
            err ? reject(err) : resolve()
        })
    })
}

/**
 * Checks if a file already exists in the file system
 * @param {fs.PathLike} filename 
 * @returns 
 */
export function fileExists(filename){
    return new Promise((resolve) => {
        fs.access(filename, fs.F_OK, (err) => {
            if (err) resolve(false)
            else resolve(true)
        })
    })
}

export function numOrDefault(num, defaultValue){
    return typeof num == 'number' ? num : defaultValue
}

/**
 * 
 * @param {string} cmd 
 * @returns {Promise<string>}
 */
export function exec(cmd){
    return new Promise((resolve, reject) => nativeExec(cmd, (error, stdout) => {
        if(error) reject(error)
        else resolve(stdout)
    }))
}

/**
 * 
 * @param {fs.PathLike} path
 * @returns {Promise<void>}
 */
 export function deleteFile(path){
    return new Promise((resolve, reject) => fs.unlink(path, (error) => {
        if(error) reject(error)
        else resolve()
    }))
}

/**
 * 
 * @param {number} length 
 * @returns {string}
 */
export function randomString(length) {
    var result           = '';
    var characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for ( var i = 0; i < length; i++ ) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
   }
   return result;
}

/**
 * 
 * @param {Function} func 
 * @param {any[]} args 
 * @type {Promise<any>} 
 */
export function ToPromise(func, args){
    return new Promise((resolve, reject) => {
        func(...args, (err, data) => {
            if(err) reject(err)
            else resolve(data)
        })
    })
}

// ==========================================

export function injectDeps(_class, deps){
    for(let name in deps){
        _class.prototype[name] = deps[name];
    }
}


/**
 * @type {<T>(obj: T, patch: Partial<T>) => T}
 * Patch an object by coping all values from the `patch` parameter into the the `obj` parameter
 */
export function patchObject(obj, patch){
    const entries = Object.entries(patch)
    const o = obj
    for(let i = 0; i < entries.length; i++){
        const [k, v] = entries[i]
        o[k] = v
    }
    return obj
}
