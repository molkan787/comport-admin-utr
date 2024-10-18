<script>
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import { RemoteObdSnifferService } from '../../services/remoteObdSnifferService'
import ObdRecordingDetailsModal from './ObdRecordingDetailsModal.vue'

export default {
  components: {
    ObdRecordingDetailsModal
  },
  props: {
    searchInput: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      page: 1,
      loadingCreate: false,
      loadingItem: null,
      headers: [
        { text: "Name", value: "Name" },
        { text: "Updated At", value: "UpdatedAt", sort: (a, b) => a - b },
        { text: "Created At", value: "CreatedAt", sort: (a, b) => a - b },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
    };
  },
  methods: {
    async createRecording(){
      try {
        const name = await prompt({ title: 'Enter recording name', text: 'Name' })
        this.loadingCreate = true
        const recording = await RemoteObdSnifferService.CreateRecording({ Name: name })
        this.items.push(recording)
        this.viewDetails(recording)
      } catch (error) {
        panic(error)
      }
        this.loadingCreate = false
    },
    async viewDetails(item){
      try {
        this.loadingItem = item._id
        window.openObdRecordingDetails(item)
      } catch (error) {
        panic(error)
      }
      this.loadingItem = null
    },
    async loadItems() {
      this.loading = true;
      const items = await RemoteObdSnifferService.GetRecordings()
      this.items = items;
      this.loading = false;
      if(window.devFunc === 'ros')
        this.viewDetails(this.items[this.items.length - 1])
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
    <v-data-table
      :page.sync="page"
      :search="searchInput"
      :headers="headers"
      :items="items"
      :items-per-page="10"
      :loading="loading"
      :custom-filter="allPropsFilter"
      sort-by="UpdatedAt"
      sort-desc
      class="elevation-0"
    >
      <template v-slot:[`item.CreatedAt`]="{ item }">
        {{ item.CreatedAt.toLocaleString() }}
      </template>
      <template v-slot:[`item.UpdatedAt`]="{ item }">
        {{ item.UpdatedAt.toLocaleString() }}
      </template>
      <template v-slot:[`item.actions`]="{ item }">
        <v-btn @click="viewDetails(item)" elevation="0" small>View Details</v-btn>
      </template>

      <template v-slot:[`header.actions`]>
        <v-btn @click="createRecording()" :loading="loadingCreate" elevation="0" small>Create Recording</v-btn>
      </template>

      <template v-slot:[`footer.page-text`]>
        <div style="display: flex;align-items: center;">
          <span>Page:</span> <v-text-field v-model.number="page" dense hide-details style="width: 45px;font-size: 13px;padding-left: 0.5rem;" />
        </div>
      </template>

    </v-data-table>
    <ObdRecordingDetailsModal />
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
</style>