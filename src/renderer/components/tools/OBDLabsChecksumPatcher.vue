<template>
    <div class="obdlabs-checksun-patcher-tool">
        <div class="tool-form">
            <div class="file-input">
                <v-text-field :value="input" label="Input File" readonly dense />
                <v-btn @click="selectFileClick('input')">Select</v-btn>
            </div>
            <div class="file-input">
                <v-text-field :value="output" label="Output File" readonly dense />
                <v-btn @click="selectFileClick('output', true)">Select</v-btn>
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="deviceType" label="Device Type" dense />
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="memoryLayout" label="Memory Layout" dense />
            </div>
            <div class="file-input">
                <v-select v-model="fileType" :items="fileTypeOptions" label="File Type" dense />
            </div>
            <div class="file-input">
                <HexNumberInput v-model.number="crcTableOffset" label="CRC Table Offset (Hex)" dense />
            </div>
            <v-btn @click="patchClick" :loading="loading">Patch file</v-btn>
        </div>
        <OBDLabsSettings />
    </div>
</template>

<script>
import { deepClone, promptFile, promptSaveFile } from '../../utils'
import { OBDLabsService } from '../../services/tools/obdlabs'
import HexNumberInput from '../templates/HexNumberInput.vue'
import OBDLabsSettings  from './obd-labs/OBDLabsSettings.vue'

export default {
    components: {
        HexNumberInput,
        OBDLabsSettings
    },
    data: () => ({
        loading: false,
        deviceType: "",
        memoryLayout: "",
        fileType: "",
        crcTableOffset: 0,
        input: '',
        output: '',

        fileTypeOptions: ['bootloader', 'application', 'calibration'],
    }),
    methods: {
        async selectFileClick(prop, saveDialog){
            const fn = saveDialog ? promptSaveFile : promptFile
            const filename = await fn()
            if(!!filename){
                this.$set(this, prop, filename)
            }
        },
        async patchClick(){
            try {
                this.loading = true
                await OBDLabsService.CalculateAndPatchChecksum({
                    deviceType: this.deviceType,
                    memoryLayout: this.memoryLayout,
                    fileType: this.fileType,
                    crcTableOffset: this.crcTableOffset,
                    inputFilename: this.input,
                    outputFilename: this.output
                }, deepClone(this.loginInfo))
                alert('File successfully patched!', 'Success!')
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