import { app, BrowserWindow } from 'electron'
import contextMenu from 'electron-context-menu'
import { simpleOn } from 'electron-easy-ipc'
import axios from './advancedAxios'

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
  global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\')
}

process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
app.commandLine.appendSwitch('remote-debugging-port', '9223')

simpleOn('axios', async (payload) => {
  const { method, url, data: requestData, options } = payload
  console.log(`got request ${method} ${url}`, requestData)
  try {
    if(method === 'get'){
      const { data } = await axios.get(url, options);
      // console.log('response data:', data)
      return { data };
    }else if(method === 'post'){
      const { data } = await axios.post(url, requestData, options);
      // console.log('response data:', data)
      return { data };
    }
  } catch (error) {
    console.error(error);
    console.log(`Error occured while making request Method: ${method} Url: ${url}`)
    return { error }
  }
})

contextMenu({
  showCopyImage: false,
  showCopyImageAddress: false,
  showSaveImage: false,
  showSaveImageAs: false,
  showSaveLinkAs: false,
  showSearchWithGoogle: false
})

let mainWindow
const winURL = process.env.NODE_ENV === 'development'
  ? `http://localhost:9080`
  : `file://${__dirname}/index.html`

  console.log('process.env.NODE_ENV', process.env.NODE_ENV)

const DEV = process.env.NODE_ENV === 'development';
global.DEV = DEV;

function createWindow () {
  /**
   * Initial window options
   */
  mainWindow = new BrowserWindow({
    height: 640,
    width: DEV ? 1450 : 1200,
    useContentSize: true,
    // maximizable: false,
    // resizable: false,
    webPreferences: {
      nodeIntegration: true,
      webSecurity: false,
    }
  })

  mainWindow.setMenu(null)
  mainWindow.loadURL(winURL)
  if(DEV){
    mainWindow.openDevTools()
  }

  mainWindow.on('closed', () => {
    app.quit()
    mainWindow = null
  })
}

app.on('ready', createWindow)

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow()
  }
})

/**
 * Auto Updater
 *
 * Uncomment the following code below and install `electron-updater` to
 * support auto updating. Code Signing with a valid certificate is required.
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-electron-builder.html#auto-updating
 */

/*
import { autoUpdater } from 'electron-updater'

autoUpdater.on('update-downloaded', () => {
  autoUpdater.quitAndInstall()
})

app.on('ready', () => {
  if (process.env.NODE_ENV === 'production') autoUpdater.checkForUpdates()
})
 */
