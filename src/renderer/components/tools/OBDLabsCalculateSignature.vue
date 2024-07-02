<template>
    <div class="obdlabs-checksun-patcher-tool">
        <div class="tool-form">
            <div class="file-input">
                <ResellerFileSelectInput v-model.trim="fileName" label="File Name" />
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="deviceType" label="Device Type" dense />
            </div>
            <div class="file-input">
                <v-select v-model="fileType" :items="fileTypeOptions" label="File Type" dense />
            </div>
            <v-btn @click="performActionClick" :loading="loading">Calculate Signature</v-btn>
            <div v-if="!loading && output" class="file-input" style="margin-top: 30px;">
                <v-text-field :value="output" label="Output (Signature)" dense readonly />
            </div>
        </div>
        <OBDLabsSettings />
    </div>
</template>

<script>
import { promptDirectory } from '../../utils'
import { OBDLabsService } from '../../services/tools/obdlabs'
import HexNumberInput from '../templates/HexNumberInput.vue'
import ResellerFileSelectInput from './obd-labs/ResellerFileSelectInput.vue'
import OBDLabsSettings  from './obd-labs/OBDLabsSettings.vue'

export default {
    components: {
        HexNumberInput,
        ResellerFileSelectInput,
        OBDLabsSettings
    },
    data: () => ({
        loading: false,
        deviceType: '',
        fileName: '',
        fileType: 'bootloader',
        output: '',
        fileTypeOptions: ['bootloader', 'application', 'calibration'],
    }),
    methods: {
        async selectFileClick(){
            const dir = await promptDirectory()
            if(dir){
                this.output = dir
            }
        },
        async performActionClick(){
            try {
                this.loading = true
                const signature = await OBDLabsService.CalculateSignature({
                    deviceType: this.deviceType,
                    fileName: this.fileName,
                    fileType: this.fileType,
                })
                this.output = signature
                alert("Signature successfully calculated", 'Success!')
            } catch (error) {
                panic(error)
            }
            this.loading = false
        }
    }
}
</script>

<style lang="scss" scoped>
.obdlabs-checksun-patcher-tool{
    display: flex;
    flex-direction: row;
    & > div{
        box-sizing: border-box;
        padding: 1rem;
    }
    .file-input{
        display: flex;
        flex-direction: row;
        &:not(.auto-size){
            width: 650px;
        }
    }
}
</style>