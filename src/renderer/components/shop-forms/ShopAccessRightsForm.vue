<template>
    <div class="shop-access-rigts-form">
        <v-checkbox
            v-model="permissions.upload_cpc_files"
            label="Shop Admin App: Enable CPC Files upload"
            hide-details
        ></v-checkbox>

        <v-radio-group v-model="data.access_customers">
            <v-radio value="all" label="Access to all customers" />
            <v-radio value="selected" label="Access to selected customers only" />
        </v-radio-group>
        <v-autocomplete
            v-if="data.access_customers === 'selected'"
            label="Select customers to which this shop have access"
            v-model="data.access_selected_customers"
            :items="customersIdsList"
            :filter="searchCustomerFilter"
            multiple
            chips
            deletable-chips
            clearable
        >
             <template slot="selection" slot-scope="{ item }">
                <v-chip
                    class="ma-2" close
                    @click:close="removeCustomerFromAccessList(item)" >
                    {{ getCustomerText(item) }}
                </v-chip>
            </template>
            <template slot="item" slot-scope="{ item }">
                {{ getCustomerText(item) }}
            </template>
        </v-autocomplete>
    </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    watch: {
        data: {
            immediate: true,
            deep: false,
            handler(shop){
                if(typeof shop.access_customers == 'undefined'){
                    this.$set(shop, 'access_customers', 'selected')
                }
                if(typeof shop.access_selected_customers == 'undefined'){
                    this.$set(shop, 'access_selected_customers', [])
                }
            }
        }
    },
    computed: { 
        ...mapState(['mappedCustomers', 'customersIdsList']),
        permissions(){
            return this.data.permissions || {}
        }
    },
    methods: {
        getCustomerText(customerId){
            const c = this.mappedCustomers[customerId]
            if(typeof c == 'object'){
                return `${c.email} - ${c.vin}`
            }else{
                return customerId
            }
        },
        removeCustomerFromAccessList(customerId){
            const list = this.data.access_selected_customers
            const index = list.indexOf(customerId)
            if(index >= 0)
                list.splice(index, 1)
        },
        searchCustomerFilter(item, searchText){
            return this.getCustomerText(item)
                        .toLowerCase()
                        .indexOf(searchText.toLowerCase()) >= 0
        }
    },
    mounted(){
        if(!this.data.permissions){
            this.$set(this.data, 'permissions', {})
        }
        window.shop = this.data
    }
}
</script>
