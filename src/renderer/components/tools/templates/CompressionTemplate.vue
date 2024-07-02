<script>
import { promptFile, promptSaveFile } from '../../../utils'

export default {
    props: {
        options: {
            type: Object
        }
    },
    computed: {
        dynamicOutFile(){
            return this.options.dynamicOutFile
        }
    },
    data: () => ({
        aip: null,
        inFile: '',
        outFile: '',
        extraData: {}
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
                const result = await this.options.compressFile(this.inFile, this.outFile, this.extraData)
                if(this.dynamicOutFile && typeof result === 'string'){
                    this.outFile = result
                }
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
                const result = await this.options.decompressFile(this.inFile, this.outFile, this.extraData)
                if(this.dynamicOutFile && typeof result === 'string'){
                    this.outFile = result
                }
                alert('Decompression completed!')
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.aip = null
        },
        validateForm(){
            // TODO: Add validate for extraFields values
            if(this.inFile.length == 0)
                alert('Please select an input file')
            else if(!this.dynamicOutFile && this.outFile.length == 0)
                alert('Please select an output file')
            else
                return true
            return false
        }
    }
}
</script>

<template>
    <div class="compression-template-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input File" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output File" readonly dense />
            <v-btn v-if="!dynamicOutFile" @click="selectFileClick('out')">Select</v-btn>
        </div>
        <template v-if="options.extraFields">
            <div v-for="field in options.extraFields" :key="field.value" class="file-input">
                <v-text-field
                    v-model="extraData[field.value]"
                    :label="field.label"
                    :type="field.type || 'text'"
                    dense
                />
            </div>
        </template>
        <v-btn
            v-if="options.compressFile"
            @click="compressFileClick"
            :loading="aip == 'compress'"
            :disabled="!!aip && aip != 'compress'">
            Compress file
        </v-btn>
        <v-btn
            v-if="options.decompressFile"
            @click="decompressFileClick"
            :loading="aip == 'decompress'"
            :disabled="!!aip && aip != 'decompress'">
            Decompress file
        </v-btn>
    </div>
</template>

<style lang="scss" scoped>
.compression-template-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>