<template>
    <div class="obdlabs-checksun-patcher-tool">
        <div class="tool-form">
            <div class="file-input">
                <ResellerFileSelectInput v-model.trim="fileName" label="File Name" />
            </div>
            <div class="file-input">
                <v-text-field :value="output" label="Output Directory" readonly dense />
                <v-btn @click="selectFileClick('output')">Select</v-btn>
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="deviceType" label="Device Type" dense />
            </div>
            <v-btn @click="performActionClick" :loading="loading">Extract Blocks</v-btn>
        </div>
        <OBDLabsSettings />
    </div>
</template>

<script>
import { deepClone, promptDirectory } from '../../utils'
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
        deviceType: "",
        fileName: '',
        output: '',
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
                const blocksNames = await OBDLabsService.ExtractMemoryBlocks({
                    deviceType: this.deviceType,
                    fileName: this.fileName,
                    outputDirectory: this.output
                }, deepClone(this.loginInfo))
                const msg = 'Successfully extracted the following blocks:\n\n' + blocksNames.join('\n')
                alert(msg, 'Success!')
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