<script>
import { OBDLabsService } from '../../services/tools/obdlabs'
import FileInput from '../templates/FileInput.vue'
import OBDLabsToolPanel from './obd-labs/OBDLabsToolPanel.vue'

export default {
    components: {
        OBDLabsToolPanel,
        FileInput
    },
    data: () => ({
        loading: false,
        inFile: '',
        outFile: '',
        deviceType: ''
    }),
    methods: {
        async compressFileClick(){
            this.loading = true
            try {
                await OBDLabsService.CompressFile({
                    inFilename: this.inFile,
                    outFilename: this.outFile,
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
        <div class="obdlabs-compressfile-tool">
            <FileInput v-model="inFile" legacy label="Input File" />
            <FileInput v-model="outFile" legacy label="Output File" type="save" />
            <div class="file-input">
                <v-text-field v-model="deviceType" label="Device Type" dense />
            </div>
            <v-btn @click="compressFileClick" :loading="loading">Compress file</v-btn>
        </div>
    </OBDLabsToolPanel>
</template>
