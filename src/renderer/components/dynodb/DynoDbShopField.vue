<template>
    <div class="dynodb-shop-field">
        <v-select
            label="Shop"
            dense
            hide-details
            v-model="data.shop"
            :loading="loading"
            :items="shops"
            item-value="_id"
            item-text="name"
        />
    </div>
</template>

<script>
import { DynoDbService } from '../../services/dynodb'
export default {
    props: {
        data: {
            type: Object,
        }
    },
    data: () => ({
        loading: false,
        shops: []
    }),
    methods: {
        async loadShopsItems(){
            this.loading = true;
            try {
                this.shops = await DynoDbService.GetCachedShops();
            } catch (error) {
                panic(error);
            }
            this.loading = false;
        }
    },
    mounted(){
        this.loadShopsItems();
    }
}
</script>

<style lang="scss">
.dynodb-shop-field{
    margin-top: 12px;
    display: flex;
    flex-direction: row;
    .v-select{
        flex: 1;
    }
}
</style>