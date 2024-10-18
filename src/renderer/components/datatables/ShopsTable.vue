<template>
  <v-data-table
    :page.sync="page"
    :search="searchInput"
    :headers="headers"
    :items="items"
    :items-per-page="5"
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
      <v-btn @click="editItem(null)" elevation="0" small>Add Shop</v-btn>
    </template>
    
    <template v-slot:[`footer.page-text`]>
        <div style="display: flex;align-items: center;">
          <span>Page:</span> <v-text-field v-model.number="page" dense hide-details style="width: 45px;font-size: 13px;padding-left: 0.5rem;" />
        </div>
      </template>

  </v-data-table>
</template>

<script>
import { ShopService } from "../../services/shop"
import { allPropsSearchFilter } from '../../helpers/allPropsSearchFilter'
import { mapActions } from 'vuex'
import ShopLogoFieldVue from '../shop-forms/ShopLogoField.vue';
import ShopAllowedMicrosFieldVue from '../shop-forms/ShopAllowedMicrosField.vue';
import ShopAllowedRefNumbersField from '../shop-forms/ShopAllowedRefNumbersField.vue';
import ShopCustomersField from '../shop-forms/ShopCustomersField.vue';

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
      headers: [
        { text: "Name", value: "shop" },
        { text: "Email", value: "email" },
        { text: "Last login", value: "last_login" },
        { text: "Credit", value: "credit" },
        { text: "Actions", value: "actions", align: 'end', sortable: false },
      ],
      items: [],
      editFormTemplate: {
        fields: [
          { label: "Name", value: "shop" },
          { label: "Email", value: "email" },
          { label: "Password", value: "pw" },
          { type: 'component', component: ShopLogoFieldVue },
          { label: "Enable access to Map Editor", value: "has_access_to_map_editor", type: 'checkbox' },
          { label: "Enable access to Shop Admin", value: "has_access_to_shop_admin", type: 'checkbox' },
          {
            type: 'grid-group',
            fields: [
              { label: "User Type", value: "userType", type: 'select', options: [{ value: 'reseller', text: 'Reseller' }, { value: 'admin-tool', text: 'Admin Tool App' }] },
              { label: "Credit", value: "credit", type: 'number' },
            ]
          },
          { type: 'component', component: ShopAllowedRefNumbersField },
          { type: 'component', component: ShopAllowedMicrosFieldVue },
          {
            label: "Last login",
            value: "last_login",
            type: "display",
            filter: "localDate",
          },
          {
            label: "Last file uploaded",
            value: "last_file_uploaded",
            type: "display",
          },
          {
            label: "Last customer folder",
            value: "last_customer_folder",
            type: "display",
          },
          { type: 'component', component: ShopCustomersField },
        ]
      }
    };
  },
  methods: {
    ...mapActions(['setShopsList']),
    async loadItems() {
      this.loading = true;
      const items = await ShopService.getShops();
      this.items = items;
      this.loading = false;
    },
    editItem(item) {
      editEntity({
          template: this.editFormTemplate,
          name: 'Shop',
          data: item,
          saveHandler: (data, isNew) => this.save(data, isNew),
          deleteHandler: (data) => this.delete(data),
          defaultValues: {
            credit: 0
          }
      })
    },
    async save(data, isNew){
        const doc = await ShopService.saveShop(data, isNew)
        if(isNew){
            this.items.push(doc)
        }else{
            const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
            this.items.splice(index, 1, data)
        }
        this.setShopsList(this.items)
    },
    async delete(data){
        const doc = await ShopService.deleteShop(data)
        const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
        this.items.splice(index, 1)
        this.setShopsList(this.items)
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