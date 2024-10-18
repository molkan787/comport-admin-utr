<script>
import { DynoDbService } from "../../services/dynodb";
import DynoShopWLogoField from "../dynodb/DynoShopWLogoField.vue";
import { allPropsSearchFilter } from "../../helpers/allPropsSearchFilter";

export default {
  props: {
    searchInput: {
      type: String
    }
  },
  data: () => ({
    isOpen: false,
    loading: false,
    page: 1,
    items: [],
    callbacks: {
      resolve: null,
      reject: null,
    },
    headers: [
      { text: "Name", value: "name" },
      { text: "Has access to Admin App", value: "enable_dyno_admin_app_access" },
      { text: "", value: "actions", align: 'end', sortable: false },
    ],
    editFormTemplate: {
      fields: [
        { label: "Name", value: "name" },
        { type: "component", component: DynoShopWLogoField },
        { type: 'checkbox', label: "Enable access to Dyno Shop Admin App", value: "enable_dyno_admin_app_access" },
        { label: "Username", value: "username", condition: d => !!d.enable_dyno_admin_app_access },
        { label: "Password", value: "password", condition: d => !!d.enable_dyno_admin_app_access },
      ],
    },
  }),
  methods: {
    editItem(item) {
      editEntity({
        template: this.editFormTemplate,
        name: "Dyno Shop",
        data: item,
        saveHandler: (data, isNew) => this.save(data, isNew),
        deleteHandler: (data) => this.delete(data),
      });
    },
    async save(data, isNew) {
      const doc = await DynoDbService.SaveShop(data);
      if (isNew) {
        this.items.push(doc);
      } else {
        const index = this.items.findIndex(
          (item) => item._id.toString() === data._id.toString()
        );
        this.items.splice(index, 1, doc);
      }
    },
    async delete(data) {
      await DynoDbService.DeleteShop(data._id);
      const index = this.items.findIndex(
        (item) => item._id.toString() === data._id.toString()
      );
      this.items.splice(index, 1);
    },
    async loadItems() {
      this.loading = true;
      try {
        this.items = await DynoDbService.GetCachedShops(true);
      } catch (error) {
        panic(error);
        return error;
      }
      this.loading = false;
    },
    refresh(){
      return this.loadItems();
    },
    allPropsFilter(value, search, item) {
      return allPropsSearchFilter(value, search, item);
    },
  },
  mounted() {
    this.loadItems();
  },
};
</script>

<template>
  <div class="dynodb-shops-table">
    <v-data-table
      :page.sync="page"
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

      <template v-slot:[`item.enable_dyno_admin_app_access`]="{ item }">
        {{ item.enable_dyno_admin_app_access ? "Yes" : "No" }}
      </template>

      <template v-slot:[`header.actions`]>
        <v-btn @click="editItem(null)" elevation="0" small>Add Shop</v-btn>
      </template>
      
      <template v-slot:[`footer.page-text`]>
        <div style="display: flex;align-items: center;">
          <span>Page:</span> <v-text-field v-model.number="page" dense hide-details style="width: 45px;font-size: 13px;padding-left: 0.5rem;" />
        </div>
      </template>

    </v-data-table>
  </div>
</template>
