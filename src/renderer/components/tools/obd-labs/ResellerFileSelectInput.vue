<template>
    <div class="obd-labs-reseller-file-select-input">
        <div class="input-wrapper">
            <v-text-field v-model="fileName" :label="label" dense />
            <v-btn @click="selectFileClick()">Select</v-btn>
        </div>
        <ResellerFileSelectModal @fileSelected="fileSelected" ref="modal" />
    </div>
</template>

<script>
import ResellerFileSelectModal from '../obd-labs/ResellerFileSelectModal.vue'

export default {
    components: {
        ResellerFileSelectModal
    },
    props: {
        value: {
            type: String,
            default: ''
        },
        label: {
            type: String,
            default: ''
        }
    },
    watch: {
        value: {
            immediate: true,
            handler(newValue){
                this.fileName = newValue;
            }
        }
    },
    data: () => ({
        fileName: ''
    }),
    methods: {
        selectFileClick(){
            this.$refs.modal.start('');
        },
        fileSelected(file){
            this.setFileName(file.filePath)
        },
        setFileName(fileName){
            this.fileName = fileName;
            this.$emit('input', fileName);
        }
    }
}
</script>

<style lang="scss" scoped>
.obd-labs-reseller-file-select-input{
    .input-wrapper{
        display: flex;
        flex-direction: row;
        &:not(.auto-size){
            width: 650px;
        }
    }
}
</style>