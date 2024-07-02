<template>
  <div class="customers-table">
    <v-data-table
      :search="searchInput"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :sort-by.sync="sortBy"
      :sort-desc.sync="sortDesc"
      :loading="loading"
      :custom-filter="allPropsFilter"
      class="elevation-0"
    >
      <template v-slot:[`item.email`]="{ item }">
        {{ item.email }}
        <v-icon v-if="item.status === 'pending'" color="blue" title="Activation Pending">mdi-clock-time-five-outline</v-icon>
        <v-icon v-else-if="item.status === 'banned'" color="red" title="Banned">mdi-cancel</v-icon>
      </template>

      <template v-slot:[`item.vin`]="{ item }">
        {{ item.vin }}
        <v-chip v-if="hasVinMismatch(item)" color="red" text-color="white" x-small>MISMATCH</v-chip>
      </template>

      <template v-slot:[`item.last_login`]="{ item }">
        <template v-if="item.last_login">
          {{ item.last_login | localDate }}
        </template>
        <template v-else> --- </template>
      </template>

      <template v-slot:[`item.status`]="{ item }">
        {{ item.status | capitalize }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="editItem(item)" :loading="editBtnLoading == item._id.toString()" elevation="0" small>
          <v-icon color="grey">mdi-open-in-new</v-icon>
          Open
        </v-btn>
        <v-btn @click="viewDatabase(item)" elevation="0" small class="grey--text" title="View Customer Flashes Folder">
          <v-icon>mdi-database</v-icon>
        </v-btn>
      </template>

      <template v-slot:[`header.actions`]>
        <v-btn @click="editItem(null)" elevation="0" small>Add Customer</v-btn>
      </template>
    </v-data-table>
    <UserLogsModal :customer="userLogsCustomer" :open="!!userLogsCustomer" @closeRequest="userLogsCustomer = null" />
  </div>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import { CustomerService } from "../../services/customer";
import { getCustomDbName } from '../../comportHelpers'
import MicrosDataField from '../customer-forms/MicrosDataField.vue'
import UserLogsModal from '../customer-forms/UserLogsModal.vue'
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import CustomerVinField from '../customer-forms/CustomerVinField.vue'
import { cloneArray, sleep, textContains } from '../../utils';
import CustomerStatusField from '../customer-forms/CustomerStatusField.vue';
import CustomerShopField from '../customer-forms/CustomerShopField.vue';

export default {
  components: {
    UserLogsModal
  },
  props: {
    searchInput: {
      type: String
    }
  },
  computed: mapState({
    settings: state => state.settings,
    mappedShops: state => state.shopsCache.mapped,
  }),
  data() {
    return {
      loading: false,
      userLogsCustomer: null,
      editBtnLoading: null,
      sortBy: 'last_login',
      sortDesc: true,
      headers: [
        { text: "Email", value: "email" },
        { text: "VIN", value: "vin" },
        { text: "Status", value: "status" },
        { text: "Last login", value: "last_login" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              {
                label: "Email",
                value: "email",
                valuePipe: ({ currentValue }) => currentValue.toLowerCase()
              },
              { type: 'component', component: CustomerStatusField },
            ]
          },
          { type: 'component', component: CustomerVinField, attributes: { uppercase: true } },
          { label: "Password", value: "pw" },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              {
                label: "Bypass VIN Check",
                value: "bypass_vin_check",
                type: "checkbox"
              },
              {
                label: "Admin Mode",
                value: "admin_mode",
                type: "checkbox"
              }
            ]
          },
          { type: 'separator' },
          {
            type: 'grid-group',
            grid: { cols: 3 },
            fields: [
              { label: "ECU", value: "ecu", type: 'select', options: () => this.getSortedMicrosList('ecu'), clearable: true },
              { label: "TCU", value: "tcu", type: 'select', options: () => this.getSortedMicrosList('tcu'), clearable: true },
              { label: "CPC", value: "cpc", type: 'select', options: () => this.getSortedMicrosList('cpc'), clearable: true }
            ]
          },
          {
            label: "Flash enabled",
            value: "flash_enabled",
            type: "checkbox",
            trueValue: 'yes',
            falseValue: 'no'
          },
          {
            type: 'grid-group',
            grid: {
              cols: 3
            },
            fields: [
              {
                label: "Load shared tunes",
                value: "load_shared_tunes",
                type: "checkbox"
              },
              {
                label: "Load TCU tunes",
                value: "load_tcu_tunes",
                type: "checkbox"
              },
              {
                label: "Load CPC tunes",
                value: "load_cpc_tunes",
                type: "checkbox"
              }
            ]
          },
          {
            type: 'grid-group',
            subdataProp: 'enabled_tunes',
            grid: {
              cols: 3
            },
            fields: [
              {
                label: "Stage 1",
                value: "stage_1",
                type: "checkbox"
              },
              {
                label: "Stage 2",
                value: "stage_2",
                type: "checkbox"
              },
              {
                label: "Burble",
                value: "burble",
                type: "checkbox"
              },
              {
                label: "91 Octane",
                value: "octane_91",
                type: "checkbox"
              },
              {
                label: "93 Octane",
                value: "octane_93",
                type: "checkbox"
              }
            ]
          },
          {
            label: "ECU Info",
            value: "ecuInfo",
          },
          {
            label: "CPC Info",
            value: "cpcInfo",
          },
          {
            label: "TCU Info",
            value: "tcuInfo",
          },
          {
            type: 'component',
            component: MicrosDataField
          },
          {
            type: 'grid-group',
            fields: [
              {
                label: "Login Count",
                value: "login_count",
                type: "display",
              },
              {
                label: "Flash Count",
                value: "flash_count",
                type: "display",
              },
            ]
          },
          {
            label: "Last login",
            value: "last_login",
            type: "display",
            filter: "localDate",
          },
          { type: 'separator' },
          {
            label: "ECU: Last tune flashed",
            value: "tune_name",
            type: "display",
            subdataProp: 'last_flashing_ecu'
          },
          {
            type: 'grid-group',
            subdataProp: 'last_flashing_ecu',
            fields: [
              {
                label: "ECU: Last tune flash result",
                value: "result",
                type: "display",
              },
              {
                label: "ECU: Last tune flashed on",
                value: "date",
                type: "display",
                filter: "localDate",
              }
            ]
          },
          { type: 'separator' },

           // TCU Last flashing info
          {
            label: "TCU: Last tune flashed",
            value: "tune_name",
            type: "display",
            subdataProp: 'last_flashing_tcu'
          },
          {
            type: 'grid-group',
            subdataProp: 'last_flashing_tcu',
            fields: [
              {
                label: "TCU: Last tune flash result",
                value: "result",
                type: "display",
              },
              {
                label: "TCU: Last tune flashed on",
                value: "date",
                type: "display",
                filter: "localDate",
              }
            ]
          },
          { type: 'separator' },

           // CPC Last flashing info
          {
            label: "CPC: Last tune flashed",
            value: "tune_name",
            type: "display",
            subdataProp: 'last_flashing_cpc'
          },
          {
            type: 'grid-group',
            subdataProp: 'last_flashing_cpc',
            fields: [
              {
                label: "CPC: Last tune flash result",
                value: "result",
                type: "display",
              },
              {
                label: "CPC: Last tune flashed on",
                value: "date",
                type: "display",
                filter: "localDate",
              }
            ]
          },
          {
            type: 'grid-group',
            fields: [
              {
                type: 'button',
                label: 'View Flashing History',
                onClick: (...args) => this.viewFlashingHistory(...args)
              },
              {
                type: 'button',
                label: 'View Flasher Logs',
                onClick: (...args) => this.viewUserLogs(...args)
              }
            ]
          },
          { type: 'separator' },
          { type: 'component', component: CustomerShopField },
        ],
      },
    };
  },
  methods: {
    ...mapActions(['setCustomersList']),
    getSortedMicrosList(microType){
      const micros = cloneArray(this.settings.micros[microType])
      return micros.sort((a, b) => a.localeCompare(b))
    },
    hasVinMismatch(customer){
      return !!(customer.flags && customer.flags[CustomerService.Flags.POSTFLASH_VIN_MISMATCH])
    },
    viewDatabase(customer){
      const { email, vin } = customer
      const dbName = getCustomDbName(email, vin)
      this.$emit('navigateRequest', 'databases', dbName)
    },
    async loadItems() {
      this.loading = true;
      const items = await CustomerService.getCustomers();
      this.setCustomersList(items);
      this.items = items;
      this.loading = false;
    },
    async editItem(item) {
      this.editBtnLoading = item && item._id.toString()
      let fullData = null
      try {
        fullData = !!item ? (await CustomerService.getCustomerFullData(item._id)) : null
        editEntity({
          template: this.editFormTemplate,
          name: 'Customer',
          data: fullData,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data)
        })
      } catch (error) {
        panic(error)
      }
      this.editBtnLoading = null
      return fullData
    },
    async save(data, isNew){
        data.vin = (data.vin || '').toUpperCase()
        const doc = await CustomerService.saveCustomer(data, isNew)
        if(isNew){
            this.items.push(doc)
        }else{
            const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
            this.items.splice(index, 1, data)
        }
    },
    async delete(data){
        const doc = await CustomerService.deleteCustomer(data)
        const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
        this.items.splice(index, 1)
    },
    viewUserLogs(customer){
      this.userLogsCustomer = customer
    },
    viewFlashingHistory(customer){
      openCustomerFlashingHistory({
        customerId: customer._id.toString()
      })
    },
    refresh(){
      return this.loadItems();
    },
    allPropsFilter(value, search, item){
      const { shopId } = item
      if(shopId){
        const shop = this.mappedShops[shopId]
        if(shop && textContains(shop.shop, search)){
          return true
        }
      }
      return allPropsSearchFilter(value, search, item)
    }
  },
  mounted() {
    if(window.devFunc === 'userlogs'){
      this.loadItems()
      .then(async () => {
        const test2User = this.items.find(item => item.email === 'test2@test.com')
        const fullData = await this.editItem(test2User)
        await sleep(500)
        this.viewUserLogs(fullData)
      })
    }else{
      this.loadItems();
    }
  },
  filters: {
    capitalize(v){
      return v.charAt(0).toUpperCase() + v.substring(1)
    }
  },
  created(){
    window.editCustomerEntry = customerId => this.editItem({ _id: customerId })
  }
};
</script>