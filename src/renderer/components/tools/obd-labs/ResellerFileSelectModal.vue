<template>
    <Modal :open="open" title="OBD-Labs Reseller files" @okClick="open = false" :cancelButtonText="null" okButtonText="Cancel">
        <div class="obd-labs-reseller-file-select-modal">
            <div class="row">
                <v-text-field v-model.trim="deviceType" label="Microcontroller Name" :disabled="loadingFilesList" dense />
                <v-btn @click="listFiles" :disabled="!deviceType" :loading="loadingFilesList" >List files</v-btn>
            </div>
            <div class="files">
                <div class="file-item" v-for="f in files" :key="f.filePath">
                    <div class="name">{{ f.fileName }}</div>
                    <v-btn @click="selectFile(f)" x-small>Select</v-btn>
                </div>
            </div>
        </div>
    </Modal>
</template>

<script>
import Modal from '../../templates/Modal.vue'
import { OBDLabsService } from '../../../services/tools/obdlabs'

export default {
    components: {
        Modal
    },
    data: () => ({
        open: false,
        loadingFilesList: false,
        deviceType: '',
        files: []
    }),
    methods: {
        async listFiles(){
            this.loadingFilesList = true;
            try {
                const files = await OBDLabsService.GetResellerFiles({
                    deviceType: this.deviceType
                })
                this.files = files
            } catch (error) {
                panic(error)
            }
            this.loadingFilesList = false;
        },
        async selectFile(file){
            this.$emit('fileSelected', file);
            this.open = false;
            // this.$nextTick(() => this.files = []);
        },
        start(deviceType){
            // this.deviceType = deviceType || ''
            // this.files = []
            this.open = true
        }
    }
}
</script>

<style lang="scss" scoped>
.obd-labs-reseller-file-select-modal{
    padding: 10px;
    .row{
        display: flex;
        flex-direction: row;
    }
    .files{
        height: 340px;
        overflow-x: hidden;
        overflow-y: scroll;
        .file-item{
            .name{
                display: inline-block;
            }
            button{
                float: right;
            }
            padding: 2px 0;
            &:not(:last-child){
                border-bottom: 1px solid rgb(197, 197, 197);
            }
            &:hover{
                background-color: #f2f2f2;
            }
        }
    }
}
</style>