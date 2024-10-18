<template>
  <v-data-table
    :page.sync="page"
    :search="searchInput"
    :headers="headers"
    :items="items"
    :items-per-page="5"
    :sort-by.sync="sortBy"
    :sort-desc.sync="sortDesc"
    :loading="loading"
    :custom-filter="allPropsFilter"
    class="elevation-0"
  >
    <template v-slot:[`item.last_login`]="{ item }">
      <template v-if="item.last_login">
        {{ item.last_login | localDate }}
      </template>
      <template v-else> --- </template>
    </template>

    <template v-slot:[`item.actions`]="{ item }">
      <v-btn @click="editItem(item)" elevation="0" small>View / Edit</v-btn>
    </template>

    <template v-slot:[`header.actions`]>
      <v-btn @click="editItem(null)" elevation="0" small>Add User</v-btn>
    </template>

    <template v-slot:[`footer.page-text`]>
      <div style="display: flex;align-items: center;">
        <span>Page:</span> <v-text-field v-model.number="page" dense hide-details style="width: 45px;font-size: 13px;padding-left: 0.5rem;" />
      </div>
    </template>

  </v-data-table>
</template>

<script>
import { TunerUsersService } from '../../services/tunerUsers'
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'

export default {
  props: {
    searchInput: {
      type: String
    }
  },
  data() {
    return {
      loading: false,
      page: 1,
      sortBy: 'last_login',
      sortDesc: true,
      headers: [
        { text: "Name", value: "name" },
        { text: "Username", value: "username" },
        { text: "Last login", value: "last_login" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          { label: "Name", value: "name" },
          { label: "Username", value: "username" },
          { label: "Password", value: "password" },
          {
            label: "Last login",
            value: "last_login",
            type: "display",
            filter: "localDate",
          },
          {
            label: "Last login IP Address",
            value: "last_login_ip",
            type: "display",
          }
        ]
      }
    };
  },
  methods: {
    async loadItems() {
      this.loading = true;
      const items = await TunerUsersService.GetUsers()
      this.items = items;
      this.loading = false;
    },
    editItem(item) {
      editEntity({
          template: this.editFormTemplate,
          name: 'Shop',
          data: item,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data)
      })
    },
    async save(data, isNew){
        const user = await TunerUsersService.PutUser(data)
        if(isNew){
            this.items.push(user)
        }else{
            const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
            this.items.splice(index, 1, data)
        }
    },
    async delete(data){
        await TunerUsersService.DeleteUser(data._id)
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