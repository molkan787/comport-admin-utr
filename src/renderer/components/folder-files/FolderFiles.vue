<script>
import electron from 'electron'
import path from 'path'
import { FolderService } from '../../services/folder'
import { promptFile, promptSaveFile } from '../../utils';
import { showItemInFolder } from '../../utils'
import FileAttributesForm from './FileAttributesForm.vue'

export default {
    components: {
        FileAttributesForm
    },
    props: {
        data: {
            type: Object,
            required: true,
        },
        isNew: {
            type: Boolean,
            required: true,
        },
    },
    data: () => ({
        tableKey: 0,
        savingSortOrder: false,
        expandedItem: [],
        itemsPerPage: 5,
        headers: [
            { text: "Name", value: "name" },
            { text: "File Size", value: "length" },
            { text: "Upload Date", value: "uploadDate" },
            { text: "Actions", value: "actions", align: 'end' },
            { text: "", value: "sort", sortable: false },
        ],
        items: [],
        uploading: false,
        editAttributesFormTemplate: {
            fields: [
                { type: 'component', component: FileAttributesForm },
            ]
        },
        downloadState: {},
        updateState: {},
        searchText: '',
    }),
    computed: {
        displayItems(){
            if(this.searchText.trim()){
                const s = this.searchText.trim().toLowerCase()
                return this.items.filter(e => e.name.toLowerCase().includes(s))
            }else{
                return this.items
            }
        },
        inSearch(){
            return this.searchText.trim().length > 0
        }
    },
    methods: {
        moveItem(item, direction){
            const currentIndex = this.items.indexOf(item)
            if(
                (currentIndex === 0 && direction === -1) ||
                (currentIndex === this.items.length - 1 && direction === 1)
            ) return
            const newIndex = currentIndex + direction
            const otherItem = this.items[newIndex]
            this.items[currentIndex] = otherItem
            this.items[newIndex] = item
            this.$set(item, 'sortOrder', newIndex)
            this.$set(otherItem, 'sortOrder', currentIndex)
            this.tableKey++;
        },
        async saveSortOrder(){
            try {
                this.savingSortOrder = true
                const items = this.items.map((f, i) => ({
                    _id: f._id,
                    sortOrder: i
                }))
                await FolderService.saveFilesSortOrder(this.data.name, items)
            } catch (error) {
                console.error(error)
                alert('An error occured while saving the sort order.', 'Error')
            }
            this.savingSortOrder = false
        },
        async uploadClick() {
            try {
                const filename = await promptFile()
                if(!filename) return
                this.uploading = true
                const file = await FolderService.uploadFile(this.data.name, filename)
                this.items.push(file)
                alert('The file was successfully uploaded!', 'Success')
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.', 'Error')
            }
            this.uploading = false
        },
        async deleteItem(item){
            if(await confirm(`Delete file "${item.name}" ?`)){
                try {
                    await FolderService.deleteFile(this.data.name, item._id)
                    const index = this.items.findIndex(f => f._id.toString() === item._id.toString())
                    this.items.splice(index, 1)
                } catch (error) {
                    console.error(error)
                    alert('An error occured, Please try again.', 'Error')
                }
            }
        },
        async renameItem(item){
            try {
                const newName = await prompt({
                    title: 'Rename file',
                    text: 'Name',
                    value: item.name,
                    okButtonText: 'Save'
                })
                if(newName === false) return
                if(typeof newName !== 'string' || newName.length < 5){
                    alert('Please enter at least 5 characters as file name.')
                    return
                }
                const file = await FolderService.renameFile(this.data.name, item._id, newName)
                item.name = newName
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.')
            }
        },
        async downloadItem(item){
            if(typeof this.downloadState[item._id] === 'number')
                return // already downloading...
            try {
                const destFilename = await promptSaveFile({ defaultPath: item.name })
                if(!destFilename) return
                this.$set(this.downloadState, item._id, 0)
                const filename = await FolderService.downloadFile(
                    this.data.name,
                    item._id,
                    destFilename,
                    ({ percentage }) => this.downloadState[item._id] = percentage
                )
                if(await confirm(`File "${item.name}" was successfully downloaded, Do you want to open it?`)){
                    showItemInFolder(filename)
                }
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.')
            } finally {
                this.$delete(this.downloadState, item._id)
            }
        },
        async updateItem(item){
            if(typeof this.updateState[item._id] === 'number')
                return // already uploading...
            try {
                const filename = await promptFile()
                if(!filename) return
                this.$set(this.updateState, item._id, 0)
                await FolderService.replaceFile(
                    this.data.name,
                    item._id,
                    filename,
                    ({ percentage }) => this.updateState[item._id] = percentage
                )
                alert(`File "${item.name}" was successfully updated!`, 'Success')
            } catch (error) {
                console.error(error)
                alert(`An error occured while updating file "${item.name}", Please try again.`)
            } finally {
                this.$delete(this.updateState, item._id)
            }
        },
        editItemAttributes(item){
            editEntity({
                template: this.editAttributesFormTemplate,
                name: 'Attributes',
                data: item,
                saveHandler: (data) => this.saveAttributes(data),
                modalWidth: 500,
                hideDelete: true
            })
        },
        async saveAttributes(data){
            const { _id, metadata: { attributes } } = data
            await FolderService.updateFileAttributes(_id, attributes)
            const fileIndex = this.items.findIndex(f => f._id.toString() === _id.toString())
            if(fileIndex >= 0){
                const file = this.items[fileIndex]
                if(typeof file.metadata !== 'object'){
                    this.$set(file, 'metadata', {})
                }
                this.$set(file.metadata, 'attributes', attributes)
            }
        },
        async loadFiles(){
            const files = await FolderService.getFiles(this.data.name)
            files.forEach(f => {
                f._id = f._id.toString()
                f.uploadDate = f.uploadDate.toLocaleString()
            })
            this.items = files
        }
    },
    mounted(){
        this.items = []
        this.loadFiles()
    }
};
</script>

<template>
    <div class="folder-files">
        <template v-if="!isNew">
            <h2>
                Files
                <v-btn @click="uploadClick" :loading="uploading" elevation="0" style="float: right" small>Upload file</v-btn>
                <v-btn @click="saveSortOrder" :loading="savingSortOrder" elevation="0"
                    style="float:right;margin-right:6px" small>Save order</v-btn>
                <v-text-field v-model="searchText" label="Search Files" style="float:right;margin-right: 6px;" dense outlined hide-details />
            </h2>
            <v-data-table
                :key="tableKey"
                :headers="headers"
                :items="displayItems"
                :items-per-page.sync="itemsPerPage"
                item-key="_id"
                class="elevation-0" >

                <template v-slot:[`item.length`]="{ item }">
                    <span class="fileSize">{{ item.length }}</span>
                </template>

                <template v-slot:[`item.sort`]="{ item }">
                    <div style="white-space:nowrap">
                        <v-btn @click="moveItem(item, -1)" :disabled="savingSortOrder || inSearch" title="Move up" elevation="0" icon small>
                            <v-icon>mdi-arrow-up</v-icon>
                        </v-btn>
                        <v-btn @click="moveItem(item, 1)" :disabled="savingSortOrder || inSearch" title="Move down" elevation="0" icon small>
                            <v-icon>mdi-arrow-down</v-icon>
                        </v-btn>
                    </div>
                </template>

                <template v-slot:[`item.actions`]="{ item }">
                    <v-btn @click="deleteItem(item)" elevation="0" outlined color="red" small>Delete</v-btn>
                    <v-btn @click="renameItem(item)" elevation="0" outlined small>Rename</v-btn>
                    <v-btn @click="downloadItem(item)" elevation="0" outlined small>
                        <template v-if="typeof downloadState[item._id] === 'number'">
                            Downloading {{ Math.floor(downloadState[item._id]) }}%
                        </template>
                        <template v-else>Download</template>
                    </v-btn>
                    <v-btn @click="updateItem(item)" elevation="0" outlined small>
                        <template v-if="typeof updateState[item._id] === 'number'">
                            Uploading {{ Math.floor(updateState[item._id]) }}%
                        </template>
                        <template v-else>Update</template>
                    </v-btn>
                    <v-btn @click="editItemAttributes(item)" elevation="0" outlined small>Attributes</v-btn>
                </template>
            </v-data-table>
        </template>
    </div>
</template>

<style lang="scss" scoped>
.fileSize{
    opacity: 0.8;
    font-size: 0.8rem;
    user-select: all;
}
</style>

<style lang="scss">
.v-data-table__wrapper{
    width: 100%;
}
</style>