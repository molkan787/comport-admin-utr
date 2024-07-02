<template>
    <div class="ikvmconverter-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input JAR File" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output DLL" readonly dense />
            <v-btn @click="selectFileClick('out')">Select</v-btn>
        </div>
        <v-btn @click="convertClick" :loading="loading">Convert</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { CPCCompressionService } from '../../services/tools/cpcCompression'
import ExternalProgramsService from '../../services/externalPrograms'

export default {
    data: () => ({
        loading: false,
        inFile: '',
        outFile: ''
    }),
    methods: {
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async convertClick(){
            if(!this.validateForm()) return
            this.loading = true
            try {
                await ExternalProgramsService.ikvmc(this.inFile, this.outFile)
                alert('Conversion completed!')
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.loading = false
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
.ikvmconverter-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>