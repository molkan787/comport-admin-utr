<template>
    <Modal :open="open" :loading="saving" @okClick="okClick" @cancelClick="cancelClick"
        title="Manage Microcontrollers list" okButtonText="Save" cancelButtonText="Cancel / Close">
        <div v-if="loading" class="loading-container">
            <v-progress-circular indeterminate color="primary" ></v-progress-circular>
        </div>
        <div v-else class="items" ref="items">
            <div class="item" v-for="(item, index) in items" :key="index">
                <v-text-field v-model.trim="item.value" :readonly="!item.isNew" outlined dense hide-details placeholder="Microcontroller Name" />
                <v-btn @click="removeItem(index)" title="Remove item" icon elevation="0" small>
                    <v-icon>mdi-trash-can</v-icon>
                </v-btn>
            </div>
            <div class="empty-placeholder" v-if="items.length == 0">
                No microcontrollers added yet!
            </div>
        </div>
        <template #leftButtons>
            <v-btn @click="addItemClick" color="blue darken-1" text>
                <v-icon>mdi-plus</v-icon> Add Item
            </v-btn>
        </template>
    </Modal>
</template>

<script>
import Modal from '../templates/Modal.vue'
import { KvsService } from '../../services/kvs'
import { slugify } from '../../utils'

export default {
    components: {
        Modal
    },
    data: () => ({
        open: false,
        loading: false,
        saving: false,
        kvsGroup: 'microcontrollers',
        items: []
    }),
    methods: {
        async okClick(){
            this.saving = true
            try {
                await this.saveItems()
                this.saving = false
                await alert('Values successfully saved.', 'Success!')
                this.open = false;
            } catch (error) {
                panic(error)
            }
            this.saving = false
        },
        cancelClick(){
            this.open = false;
        },
        removeItem(index){
            this.items.splice(index, 1)
        },
        addItemClick(){
            this.items.push({
                value: '',
                isNew: true
            })
            this.$nextTick(() => {
                const el = this.$refs.items
                el.scrollBy({
                    left: 0,
                    top: el.scrollHeight,
                    behavior: 'smooth'
                })
            })
        },
        handleRequest(){
            this.open = true
            this.loadItems().then(() => this.loading = false)
        },
        async loadItems(){
            const items = await KvsService.GetAllGroupValues(this.kvsGroup)
            this.items = items
        },
        async saveItems(){
            const items = this.items.filter(item => !!item.value)
                                    .map(item => ({ key: slugify(item.value), value: item.value.trim() }))
            await KvsService.PutGroupValues(this.kvsGroup, items)
        }
    },
    created(){
        window.editMicrocontrollersList = () => this.handleRequest()
    },
    mounted(){
        // if(window.DEV){
        //     setTimeout(() => editMicrocontrollersList(), 3000)
        // }
    }
}
</script>


<style lang="scss" scoped>
.loading-container{
    height: calc(100vh - 300px);
    padding: 60px;
    text-align: center;
}
.items{
    height: calc(100vh - 300px);
    min-height: 50px;
    overflow-y: scroll;
    padding-top: 10px;
    .item, .header{
        display: flex;
        flex-direction: row;
        div:first-child{
            flex: calc(100% - 20px);
        }
        .v-btn{
            margin-top: 4px;
        }
    }
    .empty-placeholder{
        padding: 2rem;
        text-align: center;
        color: rgb(182, 182, 182);
        font-size: 1rem;
        font-style: italic;
        pointer-events: none;
    }
}
</style>