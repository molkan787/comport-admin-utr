<template>
    <div class="shop-customers-field">
        Customers
        <ul>
            <li v-for="customer in customers" :key="customer._id.toString()">
                <v-chip @click="itemClick(customer)">{{ customer.email }}</v-chip>
            </li>
        </ul>
    </div>
</template>

<script>
import { ShopService } from '../../services/shop'

export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        customers: []
    }),
    watch: {
        data: {
            deep: false,
            immediate: true,
            handler(){
                this.customer = []
                if(this.data){
                    this.loadData()
                }
            }
        }
    },
    methods: {
        async loadData(){
            try {
                const customers = await ShopService.getCustomers(this.data._id.toString())
                this.customers = customers
            } catch (error) {
                console.error(error)
                alert('An error occured when loading customers list.')
            }
        },
        itemClick(item){
            window.editCustomerEntry(item._id)
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
</style>