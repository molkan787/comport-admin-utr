import { DevFlowConfig } from './dev'
import electron from 'electron';
const DEV = electron.remote.getGlobal('DEV');
import { version } from '../../package.json'
document.title = `COMPORT ADMIN [${version}]`
window.electron = electron;
window.DEV = DEV;

import Vue from 'vue'
import axios from 'axios'

import App from './App'
import store from './store'
import vuetify from './plugins/vuetify'
import JsonViewer from 'vue-json-viewer'

import Shell from './shell'
import HexNumberInput from './components/templates/HexNumberInput.vue'
import { apiBaseUrl } from './config.json'
import { RunDevTest } from './dev_test';

window.panic = (error, title) => {
  console.error(error)
  if(error.isAxiosError && !!error.response){
    const msgText = error.response.statusText + ': ' + error.response.data
    alert(msgText, title || 'An error occured')
  } else if(error.IsUserError) {
    alert(error.message, title || 'An error occured')
  } else {
    alert(error.message, title || 'An error occured')
  }
}
axios.defaults.baseURL = DEV ? apiBaseUrl.dev : apiBaseUrl.prod
if(DevFlowConfig.forceProdServerInDevMode){
  axios.defaults.baseURL = apiBaseUrl.prod
}

Shell.doWork();


if(DEV){
  window.isAuthenticated = false
  const { devFunc } = DevFlowConfig
  window.devFunc = devFunc
  if(typeof devFunc === 'string'){
    const parts = devFunc.split(':')
    window.devPage = parts[0]
    window.devSubPage = parts[1]
  }
}else{
  window.isAuthenticated = false
}

if (!process.env.IS_WEB) Vue.use(require('vue-electron'))
Vue.http = Vue.prototype.$http = axios
Vue.config.productionTip = false

Vue.use(JsonViewer)
Vue.component('HexNumberInput', HexNumberInput)

Vue.filter('localDate', (value) => {
  if(!value) return '---'
  const d = (value instanceof Date) ? d : new Date(value)
  return d.toLocaleString()
})

new Vue({
  store,
  vuetify,
  render: h => h(App)
}).$mount('#app')

// import XdfImporter from './services/xdfImporter';
// XdfImporter.import("C:/Users/Toshiba/Downloads/1779038502.xdf")


if(DEV){
  RunDevTest()
}