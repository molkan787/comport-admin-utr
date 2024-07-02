<script>
import { DynoDbService } from '../../services/dynodb';
import Modal from '../templates/Modal.vue'
import DynoShopWLogoField from './DynoShopWLogoField.vue';

export default {
    components: {
        Modal
    },
    data: () => ({
        isOpen: false,
        loading: false,
        items: [],
        callbacks: {
            resolve: null,
            reject: null
        },
        editFormTemplate: {
        fields: [
          { label: "Name", value: "name" },
          { type: 'component', component: DynoShopWLogoField }
        ],
      }
    }),
    methods: {
        editItem(item){
            editEntity({
                template: this.editFormTemplate,
                name: 'Dyno Shop',
                data: item,
                saveHandler: (data, isNew) => this.save(data, isNew),
                deleteHandler: (data) => this.delete(data),
            })
        },
        async save(data, isNew){
            const doc = await DynoDbService.SaveShop(data)
            if(isNew){
                this.items.push(doc)
            }else{
                const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
                this.items.splice(index, 1, doc)
            }
        },
        async delete(data){
            await DynoDbService.DeleteShop(data._id)
            const index = this.items.findIndex(item => item._id.toString() === data._id.toString())
            this.items.splice(index, 1)
        },
        cancelClick(){
            this.end(true);
        },
        async loadItems(){
            this.loading = true;
            try {
                this.items = await DynoDbService.GetCachedShops(true);
            } catch (error) {
                panic(error);
                return error;
            }
            this.loading = false;
        },
        open(){
            return new Promise(async (resolve, reject) => {
                this.callbacks.resolve = resolve;
                this.callbacks.reject = reject;
                this.isOpen = true;
                const result = this.loadItems();
                if(result instanceof Error){
                    reject(result);
                    this.isOpen = false;
                }
            })
        },
        end(result){
            this.isOpen = false;
            this.callbacks.resolve(result);
        }
    },
    created(){
        window.manageDynoDBShops = () => this.open();
    },
    mounted(){
        // setTimeout(window.manageDynoDBShops, 300)
    }
}
</script>

<template>
<Modal
    :open="isOpen"
    :contentLoading="loading"
    @cancelClick="cancelClick"
    title="Manage Shops" 
    cancelButtonText="Close"
    :okButtonText="null"
    :maxWidth="400"
    >
    <template #leftButtons>
        <v-btn @click="editItem(null)" text>
            <v-icon>mdi-plus</v-icon>
            Add New Shop
        </v-btn>
    </template>
    <div class="manage-shops">
        <div class="items">
            <table>
                <tbody>
                    <tr v-for="(item, index) in items" :key="index" class="item">
                        <td class="data">{{ item.name }}</td>
                        <td class="controls">
                            <v-btn @click="editItem(item)" small elevation="0">
                                <v-icon>mid-edit</v-icon>
                                View / Edit
                            </v-btn>
                        </td>
                    </tr>
                </tbody>
            </table>
        </div>
    </div>
</Modal>
</template>

<style lang="scss" scoped>
.manage-shops{
    min-height: 400px;
    .items{
        table{
            width: 100%;
            border-collapse: collapse;
        }
        .item{
            color: rgb(37, 37, 37);
            td.controls{
                text-align: right;
            }
            td{
                border-bottom: 1px solid rgb(235, 235, 235);
                padding: 4px;
            }
        }
    }
}
</style>