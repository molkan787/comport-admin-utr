<template>
    <div class="generic-entry-attachments-input">
        <template v-if="singleAttachment">
            <div class="single-attachement">
                <v-text-field :value="displayValue" :label="label" readonly dense placeholder="no file selected" />
                <v-btn @click="selectClick" title="Select file" icon >
                    <v-icon>mdi-dots-horizontal-circle</v-icon>
                </v-btn>
                <v-btn v-if="hasValue" @click="removeClick" title="Remove current file" icon>
                    <v-icon>mdi-delete-circle</v-icon>
                </v-btn>
                <v-btn v-if="isExistingValue" @click="downloadClick" :loading="downloading" title="Download" icon>
                    <v-icon>mdi-download-circle</v-icon>
                </v-btn>
            </div>
        </template>
        <template v-else>
            <b>Multiple attachments input not implemented.</b>
        </template>
    </div>
</template>

<script>
import path from 'path'
import { promptFile, promptSaveFile } from '../../utils'
import { GenericEntriesService } from '../../services/GenericEntries'

export default {
    props: {
        label: {
            type: String,
            default: 'Attachement'
        },
        groupName: {
            default: null
        },
        singleAttachment: {
            type: Boolean,
            default: false
        },
        entryData: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        value: null,
        downloading: false,
    }),
    watch: {
        value(v){
            if(this.singleAttachment){
                this.setSingleValue(v)
            }
        },
        'items.0': {
            immediate: true,
            handler(v) {
                if(this.singleAttachment){
                    this.value = v
                }
            }
        }
    },
    computed: {
        items(){
            return this.entryData && this.entryData.__$attachements
        },
        hasValue(){
            return !!this.value
        },
        isExistingValue(){
            return !!(this.hasValue && typeof this.value == 'object' && typeof this.value.fileId == 'string')
        },
        displayValue(){
            if(!this.hasValue) return ''
            const v = this.value
            if(typeof v == 'object'){
                return v.displayFilename
            }else if(typeof v == 'string'){
                return path.basename(v)
            }else{
                return ''
            }
        }
    },
    methods: {
        setSingleValue(value){
            if(!Array.isArray(this.items)){
                this.$set(this.entryData, '__$attachements', [])
            }
            if(value == null){
                this.items.splice(0, 1)
            }else{
                this.items[0] = value
            }
        },
        async downloadClick(){
            this.downloading = true
            try {
                const destinationFilename = await promptSaveFile({
                    defaultPath: this.displayValue
                })
                if(!destinationFilename){
                    this.downloading = false
                    return
                }
                await GenericEntriesService.DownloadEntryAttachement(this.groupName, this.value, destinationFilename)
            } catch (error) {
                panic(error)
            }
            this.downloading = false
        },
        async selectClick(){
            const filename = await promptFile()
            if(!filename) return
            this.value = {
                fsFilename: filename,
                displayFilename: path.basename(filename)
            }
            console.log(this)
        },
        removeClick(){
            this.value = null
        }
    }
}
</script>

<style lang="scss">
.generic-entry-attachments-input{
    .single-attachement{
        display: flex;
        flex-direction: row;
        .v-text-field{
            flex: 1;
            margin-right: 8px;
        }
    }
}
</style>
