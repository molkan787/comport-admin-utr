import Vue from 'vue'
import Vuex from 'vuex'
import { arrayToMap } from '../utils'

Vue.use(Vuex)

const store = new Vuex.Store({
  state: {
    loggedIn: false,
    mappedCustomers: {},
    customersIdsList: [],
    shopsCache: {
      list: [],
      mapped: {}
    },
    settings: {
      micros: null,
      carsMakes: null,
      mappedCarsMakes: null,
      vehicles: null
    },
    obdLabs: {
      loginInfo: {
          username: 'wbenjamin@amrtuned.com',
          password: 'benjamin'
      },
      proxy: {
        host: '181.215.184.122',
        port: 49155,
        username: 'automasterno1',
        password: 'pnm6GYI3RE'
      }
    },
    ui: {
      showRefreshButton: false,
    }
  },
  actions: {
    setCustomersList({ state }, customers){
      const mapped = {}
      const ids = []
      for(let i = 0; i < customers.length; i++){
        const c = customers[i]
        const id = c._id.toString()
        mapped[id] = c
        ids.push(id)
      }
      state.mappedCustomers = mapped
      state.customersIdsList = ids
    },
    setShopsList({ state }, shops){
      state.shopsCache.list = shops
      state.shopsCache.mapped = arrayToMap(shops, s => s._id.toString(), s => s)
    }
  },
  strict: false //process.env.NODE_ENV !== 'production'
})
window.store = store
export default store
