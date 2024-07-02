<script>
import { mapState } from 'vuex'

export default {
    props: {
        data: {
            type: Object,
            required: true
        },
        isNew: {
            type: Boolean,
            required: true
        }
    },
    data: () => ({
        editing: false,
        shops: []
    }),
    computed: {
        ...mapState({
            mappedShops: state => state.shopsCache.mapped,
            shopsList: state => state.shopsCache.list
        }),
        shopName(){
            const { shopId } = this.data
            if(!!shopId){
                const shop = this.mappedShops[shopId]
                return (shop && shop.shop) || shopId
            }else{
                return '--'
            }
        },
        shopsOptions(){
            return this.shopsList.map(s => ({
                text: s.shop,
                value: s._id.toString()
            }))
        }
    }
}
</script>

<template>
<div class="customer-shop-field">
    Shop:
    <v-select v-if="editing" v-model="data.shopId" :items="shopsOptions" clearable />
    <template v-else>
        <b>{{ shopName }}</b>
        <v-btn @click="editing = true" icon title="Change Shop">
            <v-icon>mdi-pencil-outline</v-icon>
        </v-btn>
    </template>
</div>
</template>

<style lang="scss" scoped>
.customer-shop-field{
    display: flex;
    flex-direction: row;
}
</style>