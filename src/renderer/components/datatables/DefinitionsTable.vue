<template>
  <v-data-table
    :search="searchInput"
    :headers="headers"
    :items="items"
    :items-per-page="5"
    :loading="loading"
    item-key="uuid"
    class="elevation-0"
  >
    <!-- <template v-slot:[`item.last_login`]="{ item }">
      <template v-if="item.last_login">
        {{ item.last_login | localDate }}
      </template>
      <template v-else> --- </template>
    </template> -->

    <template v-slot:[`item.actions`]="{ item }">
      <v-btn @click="editItem(item)" elevation="0" small>View / Edit</v-btn>
    </template>

    <template v-slot:[`header.actions`]>
      <v-btn @click="editItem(null)" elevation="0" small>Add Definition</v-btn>
    </template>
  </v-data-table>
</template>

<script>
import { DefinitionsService } from "../../services/definitions"
import DefinitionFolders from '../definition-forms/DefinitionFolders.vue'
import BlockInfoField from '../definition-forms/BlockInfoField.vue'

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
        { text: "Name", value: "name" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          { label: "Name", value: "name" },
          { type: 'component', component: BlockInfoField },
          { type: 'component', component: DefinitionFolders },
        ]
      }
    };
  },
  methods: {
    async loadItems() {
      this.loading = true;
      const items = await DefinitionsService.getDefinitions();
      this.items = items;
      this.loading = false;

      if(devFunc == 'table_form') // dev only
        this.editItem( items.find(i => i.name == '1779038404') )
    },
    editItem(item) {
      const existing = !!item
      this.editFormTemplate.fields[0].type = existing ? 'display' : 'textbox'
      editEntity({
          template: this.editFormTemplate,
          name: 'Definition',
          data: item,
          viewOnly: existing,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data)
      })
    },
    async save(data, isNew){
        try {
          const doc = await DefinitionsService.createDefinition(data)
          if(isNew){
              this.items.push(doc)
              this.editItem(doc)
          }
        } catch (error) {
          console.error(error)
          alert(error.message, 'Error')
        }
    },
    async delete(data){
        await DefinitionsService.deleteDefinition(data)
        const index = this.items.findIndex(item => item.uuid.toString() === data.uuid.toString())
        this.items.splice(index, 1)
    },
    refresh(){
      return this.loadItems();
    }
  },
  mounted() {
    this.loadItems();
  },
};
</script>