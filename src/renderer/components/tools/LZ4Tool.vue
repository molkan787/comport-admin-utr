<template>
    <div class="lz4-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input File" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output File" readonly dense />
            <v-btn @click="selectFileClick('out')">Select</v-btn>
        </div>
        <v-btn @click="compressFileClick" :loading="aip == 'compress'" :disabled="!!aip && aip != 'compress'">Compress file</v-btn>
        <v-btn @click="decompressFileClick" :loading="aip == 'decompress'" :disabled="!!aip && aip != 'decompress'">Decompress file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { LZ4Service } from '../../services/tools/lz4'

export default {
    data: () => ({
        aip: null,
        inFile: '',
        outFile: ''
    }),
    methods: {
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async compressFileClick(){
            if(!this.validateForm()) return
            this.aip = 'compress'
            try {
                await LZ4Service.CompressFile(this.inFile, this.outFile);
                alert('Compression completed!')
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.aip = null
        },
        async decompressFileClick(){
            if(!this.validateForm()) return
            this.aip = 'decompress'
            try {
                await LZ4Service.DecompressFile(this.inFile, this.outFile)
                alert('Decompression completed!')
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.aip = null
        },
        validateForm(){
            if(this.inFile.length == 0)
                alert('Please select an input file')
            else if(this.outFile.length == 0)
                alert('Please select an output file')
            else
                return true
            return false
        }
    }
}
</script>

<style lang="scss" scoped>
.lz4-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>