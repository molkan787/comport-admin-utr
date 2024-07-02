<script>
import OBDLabsToolPanel from './obd-labs/OBDLabsToolPanel.vue'
import FileInput from '../templates/FileInput.vue'
import { readBinFile, writeFile } from '../../utils'
import { OBDLabsService } from '../../services/tools/obdlabs'

export default {
    components: {
        OBDLabsToolPanel,
        FileInput
    },
    data: () => ({
        fileTypesItems: ['calibration', 'bootloader'],
        calc: {
            inputFile: '',
            fileType: 'calibration',
            loading: false,
            response: null,
        },
        patch: {
            loading: false,
            inputFile: '',
            outputFile: '',
            fileType: 'calibration',
            calculatedCrc: 0
        },
    }),
    methods: {
        async readAndCalculateChecksum(){
            const _this = this.calc
            _this.loading = true
            _this.response = null
            try {
                const binData = await readBinFile(_this.inputFile)
                const response = await OBDLabsService.VGS4NAG2_readAndCalculateChecksum(binData, _this.fileType)
                _this.response = response
            } catch (error) {
                panic(error)
            }
            _this.loading = false
        },
        async patchChecksum(){
            const _this = this.patch
            _this.loading = true
            try {
                const binData = await readBinFile(_this.inputFile)
                OBDLabsService.VGS4NAG2_patchChecksum(binData, _this.fileType, _this.calculatedCrc)
                await writeFile(_this.outputFile, binData)
                alert('File Succcessfully patched!')
            } catch (error) {
                panic(error)
            }
            _this.loading = false
        }
    }
}
</script>

<template>
    <OBDLabsToolPanel>
        <div class="tool">
            <h3>ReadAndCalculateChecksum</h3>
            <div class="file-input">
                <FileInput v-model="calc.inputFile" label="Input File (Binary)" legacy />
            </div>
            <div class="file-input">
                <v-select v-model="calc.fileType" label="File Type" :items="fileTypesItems" />
            </div>
            <v-btn @click="readAndCalculateChecksum" :loading="calc.loading">Calculate</v-btn>
            <template v-if="calc.response">
                &nbsp;&nbsp;&nbsp;&nbsp;
                CRC: <b>{{ calc.response.crc }}</b> &nbsp;&nbsp;&nbsp;&nbsp;
                CalculatedCRC: <b>{{ calc.response.calculatedCrc }}</b>
            </template>
        </div>
        <div class="tool patchChecksum">
            <h3>PatchChecksum</h3>
            <div class="file-input">
                <FileInput v-model="patch.inputFile" label="Input File (Binary)" legacy />
            </div>
            <div class="file-input">
                <FileInput v-model="patch.outputFile" label="Output File" type="save" legacy />
            </div>
            <div class="file-input">
                <v-select v-model="patch.fileType" label="File Type" :items="fileTypesItems" />
            </div>
            <div class="file-input">
                <v-text-field v-model.number="patch.calculatedCrc" label="Calculated CRC (number)" type="number" />
            </div>
            <v-btn @click="patchChecksum" :loading="patch.loading">Patch</v-btn>
        </div>
    </OBDLabsToolPanel>
</template>

<style lang="scss" scoped>
.patchChecksum{
    margin-top: 1rem;
}
h3{
    margin-bottom: 10px;
}
b{
    user-select: all;
}
</style>