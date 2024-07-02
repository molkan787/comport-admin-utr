<template>
  <v-data-table
    :headers="headers"
    :items="items"
    :items-per-page="10"
    :loading="loading"
    class="elevation-0"
  >
    <template v-slot:[`item.last_login`]="{ item }">
      <template v-if="item.last_login">
        {{ item.last_login | localDate }}
      </template>
      <template v-else> --- </template>
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <v-btn @click="editItem(item)" elevation="0" small>View</v-btn>
    </template>

    <template v-slot:[`header.actions`]>
      <v-btn @click="editItem(null)" elevation="0" small>Add Database</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import debounce from 'debounce'
import { FolderService } from "../../services/folder";
import FolderFiles from '../folder-files/FolderFiles.vue'

export default {
  props: {
    searchInput: {
      type: String
    }
  },
  watch: {
    searchInput: {
      immediate: false,
      handler(){
        this.searchHandler()
      }
    }
  },
  data() {
    return {
      loading: false,
      headers: [
        { text: "Name", value: "name" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          {
            label: "Database Name",
            value: "name",
            type: 'textbox',
            appendButton: null
          },
          { label: "Files", type: 'component', component: FolderFiles },
        ]
      },
      searchHandler: null
    };
  },
  methods: {
    async loadItems() {
      this.loading = true;
      try {
        const query = (this.searchInput || '').toLowerCase()
        const isDirectName = query.includes('@')
        let items = await (!!query && !isDirectName ? FolderService.search(query) : FolderService.getFolders());
        if(isDirectName){
          items = items.filter(item => item.name.toLowerCase().includes(query))
        }
        this.items = items;
      } catch (error) {
        panic(error)
      }
      this.loading = false;
    },
    editItem(item) {
      const existing = !!item
      const field = this.editFormTemplate.fields[0]
      if(existing){
        field.appendButton = {
          icon: 'mdi-pencil-outline',
          onClick: (data) => this.renameClick(data)
        }
      }else{
        field.appendButton = null
      }
      editEntity({
          template: this.editFormTemplate,
          name: 'Database',
          data: item,
          viewOnly: existing,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data),
          modalWidth: 500,
          fullscreen: existing
      })
    },
    async renameClick(data){
        const field = this.editFormTemplate.fields[0]
      try {
        const sourceName = data.name
        let targetName = await prompt({ title: 'Enter new Database Name', text: 'Name' })
        if(targetName){
          field.loading = true
          targetName = targetName.trim()
          await FolderService.renameFolder(sourceName, targetName)
          data.name = targetName
          const item = this.items.find(i => i.name === sourceName)
          if(item) item.name = targetName
        }
      } catch (error) {
        panic(error)
      }
      field.loading = false
    },
    async save(data, isNew){
        const doc = await FolderService.addFolder(data)
        this.items.push(doc)
        if(isNew){
          this.editItem(doc)
        }
    },
    async delete(data){
        await FolderService.deleteFolder(data._id)
        const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
        this.items.splice(index, 1)
    },
    refresh(){
      return this.loadItems();
    }
  },
  mounted() {
    this.loadItems();
  },
  created(){
    this.searchHandler = debounce(() => this.loadItems(), 200)
  }
};
</script>