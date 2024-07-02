<template>
    <div class="elements-list">
        <v-data-table
            :headers="headers"
            disable-sort
            :items-per-page="5"
            :items="elements"
        >

            <template v-slot:[`header.actions`]>
                <v-btn @click="editItem(null)" elevation="0" small>Add Element</v-btn>
            </template>

            <template v-slot:[`item.actions`]="{ item }">
                <v-btn @click="editItem(item)" elevation="0" small>Edit / View</v-btn>
            </template>

        </v-data-table>
    </div>
</template>

<script>
import { ObjectId } from 'mongodb'
import ElementForm from './ElementForm.vue'

export default {
    components: {
        ElementForm
    },
    props: {
        data: {
            type: Object,
            required: true,
        }
    },
    watch: {
        data: {
            immediate: true,
            deep: false,
            handler(d){
                if(!Array.isArray(d.elements))
                this.$set(d, 'elements', [])
            }
        }
    },
    computed: {
        elements(){
            return this.data.elements
        }
    },
    methods: {
        editItem(element){
            if(!element){
                element = {
                    _id: ObjectId(),
                    name: '',
                    type: 'dropdown',
                    offset: 0x00,
                    dropdownItems: []
                }
            }
            editEntity({
                template: this.editElementFormTemplate,
                name: 'Element',
                data: element,
                saveHandler: (data) => this.saveItem(data),
                deleteHandler: (data) => this.deleteItem(data),
                saveButtonText: 'Ok',
                deleteButtonText: 'Remove'
            })
        },
        saveItem(data){
            console.log(data)
            const index = this.elements.findIndex(el => el._id.toString() === data._id.toString())
            if(index >= 0)
                this.$set(this.elements, index, data)
            else
                this.elements.push(data)
        },
        deleteItem(data){
            const index = this.elements.findIndex(el => el._id.toString() === data._id.toString())
            this.elements.splice(index, 1)
        }
    },
    data: () => ({
        editElementFormTemplate: {
            fields: [
                { label: 'Name', value: 'name' },
                { type: 'component', component: ElementForm }
            ]
        },
        headers: [
            { text: 'Name', value: 'name' },
            { text: 'Type', value: 'type' },
            { text: '', value: 'actions', align: 'end' },
        ],
        items: [
            {
                _id: ObjectId(),
                name: 'Option A',
                type: 'dropdown',
                offset: 0x5FC,
                dropdownItems: [
                    { text: 'ON', value: [0xFF] },
                    { text: 'OFF', value: [0x00] },
                ]
            }
        ]
    })
}
</script>