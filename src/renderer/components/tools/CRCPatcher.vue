<template>
    <div class="file-fix-tool">
        <div class="file-input">
            <v-text-field :value="input" label="Input File" readonly dense />
            <v-btn @click="selectFileClick('input')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="output" label="Output File" readonly dense />
            <v-btn @click="selectFileClick('output', true)">Select</v-btn>
        </div>
        <div class="file-input">
            <v-select v-model="algorithm" :items="algorithms" label="Algorithm" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model.trim="targetChecksum" label="Target Checksum (Hex)" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model.number="patchOffset" label="Patch Offset (Decimal)" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model.trim="polynomial" label="Polynomial (Hex) (Optional)" dense />
        </div>
        <v-btn @click="patchClick" :loading="loading">Patch file</v-btn>
        <v-btn @click="testClick" :loading="loading">Test</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import ExternalProgramsService from '../../services/externalPrograms'

export default {
    data: () => ({
        loading: false,
        algorithm: 'CRC32',
        targetChecksum: '',
        polynomial: '',
        patchOffset: 0,
        input: '',
        output: '',
        algorithms: [ 'CRC32', 'CRC32POSIX', 'CRC16CCITT', 'CRC16IBM' ]
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
                await ExternalProgramsService.CRCManip({
                    algorithm: this.algorithm,
                    targetChecksum: this.targetChecksum,
                    patchOffset: this.patchOffset,
                    polynomial: this.polynomial,
                    inputFilename: this.input,
                    outputFilename: this.output
                })
                alert('File successfully patched!', 'Success!')
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        async testClick(){
            try {
                this.loading = true
                const correction = await ExternalProgramsService.GetCRCManipCorrection({
                    algorithm: this.algorithm,
                    targetChecksum: this.targetChecksum,
                    patchOffset: this.patchOffset,
                    polynomial: this.polynomial,
                    inputFilename: this.input,
                })
                alert(`Patch data: ${correction.toUpperCase()}`, 'Success!', { allowSelection: true })
            } catch (error) {
                panic(error)
            }
            this.loading = false
        }
    }
}
</script>

<style lang="scss" scoped>
.file-fix-tool{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>