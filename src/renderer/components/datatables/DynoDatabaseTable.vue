<template>
  <div class="dynodb-table">
    <v-data-table
      :search="searchInput"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
      :custom-filter="allPropsFilter"
      class="elevation-0"
    >
    
      <template v-slot:[`item.shop`]="{ item }">
        {{ shopsNames[item.shop] || item.shop }}
      </template>
    
      <template v-slot:[`item.make`]="{ item }">
        {{ mappedCarsMakes[item.make] || item.make }}
      </template>

      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="editItem(item)" elevation="0" small>View / Edit</v-btn>
      </template>

      <template v-slot:[`header.actions`]>
        <v-btn @click="editItem(null)" elevation="0" small>Add Entry</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { DynoDbService } from "../../services/dynodb";
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import DynoDbRunDataField from '../dynodb/DynoDbRunDataField.vue'
import DynoDbShopField from '../dynodb/DynoDbShopField.vue'
import { arrayToMap } from '../../utils';
import { mapState } from 'vuex';

export default {
  props: {
    searchInput: {
      type: String
    }
  },
  computed: mapState({
    carsMakes: state => state.settings.carsMakes,
    mappedCarsMakes: state => state.settings.mappedCarsMakes,
  }),
  data() {
    return {
      loading: false,
      page: 1,
      headers: [
        { text: "Shop", value: "shop" },
        { text: "Make", value: "make" },
        { text: "Model", value: "model" },
        { text: "Year", value: "year" },
        { text: "Owner", value: "owner" },
        { text: "", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      shopsNames: {},
      editFormTemplate: {
        fields: [
          { type: 'component', component: DynoDbShopField },
          {
            label: "Make", value: "make",
            type: 'select',
            textProp: 'v',
            valueProp: 'k',
            options: () => this.carsMakes
          },
          { label: "Model", value: "model" },
          { label: "Year", value: "year" },
          { label: "Owner", value: "owner" },
          { label: "Display this car in Dyno App", value: "display_in_dyno_app", type: "checkbox" },
          { label: 'Run Data', type: 'component', component: DynoDbRunDataField }
        ],
      },
    };
  },
  methods: {
    async loadItems() {
      this.loading = true;
      const items = await DynoDbService.GetEntries(null);
      const len = items.length;
      for(let i = 0; i < len; i++){
        const item = items[i]
        if(!Array.isArray(item.runDataItem)){
          this.$set(item, 'runDataItems', [])
        }
      }
      const shops = await DynoDbService.GetCachedShops();
      this.shopsNames = arrayToMap(shops, s => s._id, s => s.name);
      this.items = items;
      this.loading = false;
    },
    editItem(item) {
      editEntity({
          template: this.editFormTemplate,
          name: 'Dyno Entry',
          data: item,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data),
          loadHandler: (data, isNew) => this.loadEntryAdditionalData(data, isNew)
      })
    },
    async loadEntryAdditionalData(data, isNew){
      if(!isNew){
        const runDataItems = await DynoDbService.GetRunsData(data._id)
        this.$set(data, 'runDataItems', runDataItems)
      }else if(!Array.isArray(data.runDataItems)){
        this.$set(data, 'runDataItems', [])
      }
    },
    async save(data, isNew){
      data.runDataItems = data.runDataItems.filter(item => !!item.filename)
      if(isNew){
        const doc = await DynoDbService.AddEntry(data)
        this.items.push(doc)
      }else{
        const doc = await DynoDbService.EditEntry(data)
        const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
        this.items.splice(index, 1, doc)
      }
    },
    async delete(data){
        await DynoDbService.DeleteEntry(data._id)
        const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
        this.items.splice(index, 1)
    },
    refresh(){
      return this.loadItems();
    },
    allPropsFilter(value, search, item){
      return allPropsSearchFilter(value, search, item)
    }
  },
  mounted() {
    this.loadItems();
  },
};
</script>