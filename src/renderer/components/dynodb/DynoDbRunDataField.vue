<template>
    <div class="dynodb-rundata-field">
        <h3>
            Runs Data
            <v-btn @click="addFileClick" small>
                <v-icon>mdi-plus</v-icon>
                Add file
            </v-btn>
        </h3>
        <div v-for="(item, index) in runDataItems" :key="index" class="item">
            <FileInput
                v-model="item.filename"
                :allowClearOnly="true"
                @cleared="fileCleared(index)"
                label="CSV File"
            >
                <template #append>
                    <v-btn
                        :disabled="!canBeDownloaded(item)"
                        :loading="loadingItem === item._id"
                        @click="downloadClick(item)"
                        title="Download" icon
                    >
                        <v-icon>mdi-download</v-icon>
                    </v-btn>
                </template>
            </FileInput>
            <v-text-field v-model="item.description" label="Description" hide-details dense />
        </div>
    </div>
</template>

<script>
import { DynoDbService } from '../../services/dynodb'
import { promptFile, promptSaveFile, writeFile } from '../../utils'
import FileInput from '../templates/FileInput.vue'

export default {
    components: {
        FileInput
    },
    props: {
        isNew: {
            type: Boolean,
        },
        data: {
            type: Object
        }
    },
    computed: {
        runDataItems(){
            return this.data && this.data.runDataItems
        }
    },
    data: () =>({
        loadingItem: null
    }),
    methods: {
        fileCleared(index){
            this.runDataItems.splice(index, 1)
        },
        async addFileClick(){
            const filename = await promptFile()
            if(filename){
                this.runDataItems.unshift({
                    filename,
                    description: ''
                })
            }
        },
        canBeDownloaded(runData){
            return Array.isArray(runData.__$attachements) && runData.__$attachements.length > 0
        },
        async downloadClick(runData){
            try {
                const filename = await promptSaveFile()
                if(!filename) return
                this.loadingItem = runData._id
                const attachement = runData.__$attachements[0]
                const binData = await DynoDbService.GetRunDataFileBinary(attachement.fileId)
                await writeFile(filename, binData)
                alert('File successfully downloaded!')
            } catch (error) {
                panic(error)
            }
            this.loadingItem = null
        }
    }
}
</script>

<style lang="scss" scoped>
.dynodb-rundata-field{
    margin-top: 1.2rem;
    h3{
        color: #5d5d5d;
        button{
            float: right;
        }
    }
    .item{
        margin-top: 1rem;
        margin-bottom: 2rem;
    }
}
</style>