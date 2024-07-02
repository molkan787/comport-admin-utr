<template>
    <div class="micro-models-list">
        <div class="items">
            <div class="item">
                <v-btn @click="addClick" :loading="addBtnLoading" color="primary" text style="padding: 0 5px;">
                    <v-icon>mdi-plus</v-icon>
                    Add Micro Model
                </v-btn>
            </div>
            <div class="item" v-for="item in items" :key="item">
                <v-btn @click="deleteClick(item)" title="Delete" icon>
                    <v-icon>mdi-delete-outline</v-icon>
                </v-btn>
                {{ item }}
            </div>
        </div>
    </div>
</template>

<script>
export default {
    props: {
        type: {
            type: String,
            required: true
        },
        items: {
            type: Array,
            required: true
        },
        addBtnLoading: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        addClick(){
            this.$emit('AddItemClick', this.type)
        },
        deleteClick(item){
            this.$emit('DeleteItemClick', this.type, item)
        }
    }
}
</script>

<style lang="scss" scoped>
.micro-models-list{
    &, .items{
        height: 100%;
    }
    .items{
        width: 100%;
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-right: 10px;
        padding-top: 10px;
        .item{
            color: black;
            padding: 2px;
            &:not(:last-child){
                border-bottom: 1px solid #e7e7e7;
            }
        }
    }
}
</style>