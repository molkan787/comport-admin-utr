<template>
    <div class="shop-customers-field">
        Customers
        <div>
            <v-btn @click="viewListClick">View customers list</v-btn>
        </div>
        <!-- <ul>
            <li v-for="customer in customers" :key="customer._id.toString()">
                <v-chip @click="itemClick(customer)">{{ customer.email }}</v-chip>
            </li>
        </ul> -->
        <Modal :open="modalOpen" @okClick="modalOpen = false" :cancelButtonText="null" okButtonText="Close">
            <div class="customers-list-modal">
                <v-text-field v-model="searchText" clearable label="Search" placeholder="by email or vin" hide-details />
                <v-data-table
                    :loading="loadingCustomersList"
                    :headers="headers"
                    :items="customers"
                    item-key="email"
                    :search="searchText"
                    >
                    <template v-slot:[`item.actions`]="{ item }">
                        <v-btn @click="viewDetailsClick(item)"
                        :loading="loadingCustomer === item._id.toString()" elevation="0" small>View</v-btn>
                    </template>
                </v-data-table>
            </div>
        </Modal>
    </div>
</template>

<script>
import { ShopService } from '../../services/shop'
import Modal from '../templates/Modal.vue'

export default {
    components: {
        Modal,
    },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        customers: [],
        modalOpen: false,
        loadingCustomersList: false,
        searchText: '',
        loadingCustomer: null,
        headers: [
            { text: 'Email', value: 'email' },
            { text: 'VIN', value: 'vin' },
            { text: 'Action', value: 'actions' },
        ]
    }),
    methods: {
        viewListClick(){
            this.loadingCustomersList = true
            this.modalOpen = true
            this.loadData()
        },
        async loadData(){
            try {
                const customers = await ShopService.getCustomers(this.data._id.toString())
                this.customers = customers
                this.loadingCustomersList = false
            } catch (error) {
                console.error(error)
                alert('An error occured when loading customers list.')
            }
        },
        async viewDetailsClick(item){
            this.loadingCustomer = item._id.toString()
            await window.editCustomerEntry(item._id)
            this.loadingCustomer = null
        }
    }
}
</script>

<style lang="scss" scoped>
.shop-customers-field{
    li{
        margin-bottom: 0.4rem;
        span{
            cursor: pointer !important;
        }
    }
}
.customers-list-modal{
    min-height: calc(100vh - 150px);
}
</style>