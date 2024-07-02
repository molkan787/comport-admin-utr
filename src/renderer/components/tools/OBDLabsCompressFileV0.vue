<script>
import { OBDLabsService } from '../../services/tools/obdlabs'
import FileInput from '../templates/FileInput.vue'
import OBDLabsToolPanel from './obd-labs/OBDLabsToolPanel.vue'
import ResellerFileSelectInput from './obd-labs/ResellerFileSelectInput.vue'

export default {
    components: {
        OBDLabsToolPanel,
        FileInput,
        ResellerFileSelectInput
    },
    data: () => ({
        loading: false,
        outFile: '',
        fileName: '',
        deviceType: ''
    }),
    methods: {
        async compressFileClick(){
            this.loading = true
            try {
                await OBDLabsService.CompressFileV0({
                    outFilename: this.outFile,
                    fileName: this.fileName,
                    deviceType: this.deviceType
                })
                alert('Operation successfully completed!')
            } catch (error) {
                panic(error)
            }
            this.loading = false
        }
    }
}
</script>

<template>
    <OBDLabsToolPanel>
        <div class="obdlabs-compressfilev0-tool">
            <ResellerFileSelectInput v-model.trim="fileName" label="File Name" />
            <FileInput v-model="outFile" legacy label="Output File" type="save" />
            <div class="file-input">
                <v-text-field v-model="deviceType" label="Device Type" dense />
            </div>
            <v-btn @click="compressFileClick" :loading="loading">Compress file</v-btn>
        </div>
    </OBDLabsToolPanel>
</template>
