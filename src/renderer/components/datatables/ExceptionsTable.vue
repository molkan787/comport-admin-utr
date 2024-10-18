<script>
import Teleport from 'vue2-teleport'
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import { ComportDebugSerivce } from '../../services/comportDebug'
import ExceptionDetailsModal from '../comport-debug/ExceptionDetailsModal.vue'

export default {
  components: {
    ExceptionDetailsModal,
    Teleport,
  },
  props: {
    searchInput: {
      type: String
    },
    activePage: {
      type: Boolean,
    },
  },
  data() {
    return {
      loading: false,
      page: 1,
      loadingItem: null,
      headers: [
        { text: "Exception Header", value: "ExceptionHeader" },
        { text: "Count", value: "Count" },
        { text: "Last Occurrence Date", value: "LastOccurrenceDate", sort: (a, b) => a - b },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      archiving: false,
    };
  },
  methods: {
    async viewDetails(item){
      try {
        this.loadingItem = item._id
        window.openExceptionDetails(item, {
          reload: true,
          onDeleted: d => this._onDeletedHandler(d)
        })
      } catch (error) {
        panic(error)
      }
      this.loadingItem = null
    },
    _onDeletedHandler(item){
      const index = this.items.findIndex(d => d._id.toString() === item._id.toString())
      if(index >= 0){
        this.items.splice(index, 1)
      }
    },
    async loadItems() {
      this.loading = true;
      const items = await ComportDebugSerivce.GetExceptions('flasher')
      this.items = items;
      this.loading = false;
      if(window.devFunc === 'exception')
        this.viewDetails(this.items.find(ex => ex.ExceptionHeader === 'FlasherCore.ProcedureException: Test Error'))
    },
    async archiveAllClick(){
      if(await confirm('Archive all exceptions?')){
        try {
          this.archiving = true
          await ComportDebugSerivce.ArchiveAllExceptions('flasher')
          await this.loadItems()
          await alert('All exceptions were successfully archived!')
        } catch (error) {
          panic(error)
        }
        this.archiving = false
      }
    },
    async deleteAllClick(){
      if(await confirm('Delete all exceptions?')){
        try {
          this.archiving = true
          await ComportDebugSerivce.DeleteAllExceptions('flasher')
          await this.loadItems()
          await alert('All exceptions were successfully deleted!')
        } catch (error) {
          panic(error)
        }
        this.archiving = false
      }
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

<template>
  <div class="exceptions-table">

    <Teleport to="#header-extra-buttons">
      <v-btn v-if="activePage" @click="deleteAllClick" text color="white">
        <v-icon>mdi-trash-can</v-icon>
        &nbsp; DELETE ALL
      </v-btn>
      <v-btn v-if="activePage" @click="archiveAllClick" text color="white">
        <v-icon>mdi-archive</v-icon>
        &nbsp; ARCHIVE ALL
      </v-btn>
    </Teleport>

    <v-data-table
      :page.sync="page"
      :search="searchInput"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
      :custom-filter="allPropsFilter"
      sort-by="LastOccurrenceDate"
      sort-desc
      class="elevation-0"
    >

      <template v-slot:[`item.ExceptionHeader`]="{ item }">
        <span class="chip ExceptionHeader" :class="item.Archived ? 'verylight-grey' : 'light-grey'">{{ item.ExceptionHeader }}</span>
      </template>
      <template v-slot:[`item.LastOccurrenceDate`]="{ item }">
        {{ item.LastOccurrenceDate.toLocaleString() }}
      </template>
      <template v-slot:[`item.Count`]="{ item }">
        <span class="chip" :class="item.Archived ? 'verylight-grey' : 'light-red'">{{ item.Count }}</span>
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="viewDetails(item)" elevation="0" small>View Details</v-btn>
      </template>
      
      <template v-slot:[`footer.page-text`]>
        <div style="display: flex;align-items: center;">
          <span>Page:</span> <v-text-field v-model.number="page" dense hide-details style="width: 45px;font-size: 13px;padding-left: 0.5rem;" />
        </div>
      </template>

    </v-data-table>
    <ExceptionDetailsModal />
  </div>
</template>

<style lang="scss" scoped>
.chip{
  border-radius: 5px;
  padding: 4px 12px;
  &.light-red{
    background-color: #f07e7e;
    color: white;
  }
  &.light-grey{
    background-color: #c7c7c7;
    color: rgb(22, 22, 22);
  }
  &.verylight-grey{
    background-color: #ededed;
    color: rgb(53, 53, 53);
  }
}
.ExceptionHeader{
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: calc(100vw - 700px);
}
</style>