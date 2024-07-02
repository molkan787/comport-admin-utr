<template>
  <div class="customers-table">
    <v-data-table
      :search="searchInput"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
      :custom-filter="allPropsFilter"
      class="elevation-0"
    >
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="editItem(item)" elevation="0" small>View / Edit</v-btn>
      </template>

      <template v-slot:[`header.actions`]>
        <v-btn @click="editItem(null)" elevation="0" small>Add File</v-btn>
      </template>
    </v-data-table>
  </div>
</template>

<script>
import { GenericEntriesService } from "../../services/GenericEntries";
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import FileDatabaseAttachementField from '../divert/FileDatabaseAttachementField.vue'
const ENTRY_GROUP_NAME = 'file_database'

export default {
  props: {
    searchInput: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      headers: [
        { text: "Vehicle Manufacturer", value: "vehicle_manufacturer" },
        { text: "Vehicle Model", value: "vehicle_model" },
        { text: "Vehicle Year", value: "vehicle_year" },
        { text: "Vehicle Chassis", value: "vehicle_chassis" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          {
            type: 'component',
            component: FileDatabaseAttachementField,
            props: { groupName: ENTRY_GROUP_NAME }
          },
          { type: 'separator' },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              { label: "Vehicle Type", value: "vehicle_type", type: 'select', options: ['bike', 'car', 'truck'] },
              { label: "Vehicle Manufacturer", value: "vehicle_manufacturer" },
              { label: "Vehicle Year", value: "vehicle_year" },
              { label: "Vehicle Model", value: "vehicle_model" },
              { label: "Vehicle Chassis", value: "vehicle_chassis" },
              { label: "Vehicle Engine", value: "vehicle_engine" },
              { label: "Vehicle HP", value: "vehicle_hp" },
              { label: "Vehicle Fuel Type", value: "vehicle_fuel_type", type: 'select', options: ['petrol', 'diesel'] },
            ]
          },
          { type: 'separator' },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              { label: "ECU Manufacturer", value: "ecu_manufacturer" },
              { label: "ECU Name", value: "ecu_name" },
            ]
          },
          { type: 'separator' },
          {
            type: 'grid-group',
            grid: { cols: 3 },
            fields: [
              { label: "Bootloader Number", value: "bootloader_number" },
              { label: "Application Number", value: "application_number" },
              { label: "Calibration Number", value: "calibration_number" },
            ]
          },
          { type: 'separator' },
          { label: "EPROM", value: "eprom" },
          { type: 'separator' },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              { label: "Checksum 8 bit", value: "checksum_8bit" },
              { label: "Checksum 8 bit inv", value: "checksum_8bit_inv" },
            ]
          },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              { label: "Checksum 16 bit", value: "checksum_16bit" },
              { label: "Checksum 16 bit inv", value: "checksum_16bit_inv" },
            ]
          },
          {
            type: 'grid-group',
            grid: { cols: 2 },
            fields: [
              { label: "Checksum 32 bit", value: "checksum_32bit" },
              { label: "Checksum 32 bit inv", value: "checksum_32bit_inv" },
            ]
          },
          { type: 'separator' },
          { label: "notes", value: "notes", type: 'textarea' },
        ],
      },
    };
  },
  methods: {
    async loadItems() {
      this.loading = true;
      const items = await GenericEntriesService.GetEntries(ENTRY_GROUP_NAME);
      this.items = items;
      this.loading = false;
    },
    editItem(item) {
      editEntity({
          template: this.editFormTemplate,
          name: 'File',
          data: item,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data)
      })
    },
    async save(data, isNew){
      // data.__$attachements = [
      //   // "C:\\Users\\worw7\\Documents\\Comport\\Tmp Files\\0009029917-00050000_application.bin",
      //   "C:\\Users\\worw7\\Documents\\Comport\\Tmp Files\\cpc_ng-bootloader (1).bin"
      // ]
      // data.__$attachements.splice(0, 1)
      // data.__$attachements.push("C:\\Users\\worw7\\Documents\\Comport\\Tmp Files\\cpc_ng_application_cpcc2.bin")
      const doc = await GenericEntriesService.SaveEntry(ENTRY_GROUP_NAME, data)
      if(isNew){
          this.items.push(doc)
      }else{
          const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
          this.items.splice(index, 1, data)
      }
    },
    async delete(data){
        await GenericEntriesService.DeleteEntry(ENTRY_GROUP_NAME, data._id)
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