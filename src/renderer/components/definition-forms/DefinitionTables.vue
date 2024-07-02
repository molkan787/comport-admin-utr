<template>
    <div class="definition-folders">
        <template v-if="!isNew">
            <h2>
                Tables
                <v-btn @click="editItem(null)" elevation="0" style="float: right" small>Add table</v-btn>
                <v-btn @click="saveSortOrder" :loading="savingSortOrder" elevation="0" style="float:right;margin-right:6px" small>Save order</v-btn>
            </h2>
            <v-data-table
                :key="tableKey"
                :headers="headers"
                :items="items"
                :items-per-page="5"
                :options.sync="pagination"
                class="elevation-0" >

                <template v-slot:[`item.actions`]="{ item }">
                    <div style="white-space:nowrap">
                        <v-btn @click="moveItem(item, -1)" :disabled="savingSortOrder" title="Move up" elevation="0" icon small>
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                        <v-btn @click="moveItem(item, 1)" :disabled="savingSortOrder" title="Move down" elevation="0" icon small>
                            <v-icon>mdi-arrow-down</v-icon>
                        </v-btn>
                        <v-btn @click="editItem(item)" elevation="0" small>Edit / View</v-btn>
                    </div>
                </template>

            </v-data-table>
        </template>
    </div>
</template>

<script>
import { DefinitionsService } from '../../services/definitions'
import TableForm from './TableForm.vue'

export default {
    props: {
        data: {
            type: Object,
            required: true,
        },
        isNew: {
            type: Boolean,
            required: true,
        },
        payload: {
            type: Object,
            required: true
        }
    },
    computed: {
        items(){
            return (this.data && this.data.tables) || []
        }
    },
    data: () => ({
        tableKey: 0,
        pagination: {},
        savingSortOrder: false,
        headers: [
            { text: "Name", value: "name", sortable: false },
            { text: "Actions", value: "actions", align: 'end', sortable: false },
        ],
        editItemFormTemplate: {
            fields: [
                { label: "Name", value: "name" },
                { label: "Description", value: "description", type: 'textarea' },
                { label: "", value: "", type: 'component', component: TableForm },
            ],
        },
    }),
    methods: {
        moveItem(item, direction){
            const currentIndex = this.items.indexOf(item)
            if(
                (currentIndex === 0 && direction === -1) ||
                (currentIndex === this.items.length - 1 && direction === 1)
            ) return
            const newIndex = currentIndex + direction
            const otherItem = this.items[newIndex]
            this.items[currentIndex] = this.items[newIndex]
            this.items[newIndex] = item
            this.$set(item, 'sortOrder', newIndex)
            this.$set(otherItem, 'sortOrder', currentIndex)
            this.tableKey++
        },
        async saveSortOrder(){
            try {
                this.savingSortOrder = true
                const items = this.items.map((f, i) => ({
                    _id: f._id,
                    sortOrder: i
                }))
                await DefinitionsService.setDefinitionTablesSortOrder(this.payload.definitionName, this.data._id, items)
            } catch (error) {
                console.error(error)
                alert('An error occured while saving the sort order.', 'Error')
            }
            this.savingSortOrder = false
        },
        editItem(item){
            editEntity({
                template: this.editItemFormTemplate,
                name: 'Table',
                data: item,
                saveHandler: (data, isNew) => this.saveItem(data, isNew),
                deleteHandler: (data) => this.deleteItem(data)
            })
        },
        async saveItem(item, isNew){
            try {
                if(isNew) item.sortOrder = this.items.length
                const data = await DefinitionsService.saveDefinitionTable(
                    this.payload.definitionName,
                    this.data._id,
                    item,
                    isNew
                )
                if(isNew){
                    this.items.push(data)
                }else{
                    const index = this.items.findIndex(f => f._id.toString() === item._id.toString())
                    this.items.splice(index, 1, data)
                }
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.', 'Error')
            }
        },
        async deleteItem(item){
            try {
                await DefinitionsService.deleteDefinitionFolder(this.data.name, item)
                const index = this.items.findIndex(f => f._id.toString() === item._id.toString())
                this.items.splice(index, 1)
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.', 'Error')
            }
        }
    },
    mounted(){
        this.data.tables = this.items.sort((a, b) => a.sortOrder - b.sortOrder)

        if(devFunc == 'table_form') // dev only
            setTimeout(() => this.editItem(this.data.tables[0]), 500)
    }
};
</script>

<style lang="scss">
.v-data-table__wrapper{
    width: 100%;
}
</style>