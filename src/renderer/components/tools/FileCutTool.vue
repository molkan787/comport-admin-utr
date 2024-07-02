<template>
    <div class="filecut-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input File" placeholder="input filename" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output File" placeholder="output filename" readonly dense />
            <v-btn @click="selectFileClick('out')">Select</v-btn>
        </div>
        <div class="file-input">
            <HexNumberInput v-model="startOffset" label="Start Offset (Hex)" dense />
        </div>
        <div class="file-input">
            <HexNumberInput v-model="blockLength" label="Block Length (Hex)" dense />
        </div>
        <div class="file-input">
            <HexNumberInput v-model="endOffset" label="End Offset (Hex)" dense />
        </div>
        <v-btn @click="cutFileClick" :loading="processing">Cut file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { FileCutterService } from '../../services/tools/fileCutter'
import HexNumberInput from '../templates/HexNumberInput.vue'

export default {
    components: {
        HexNumberInput
    },
    data: () => ({
        processing: false,
        inFile: '',
        outFile: '',
        startOffset: 0,
        blockLength: 0,
        endOffset: 0,
    }),
    watch: {
        blockLength(){
            this.updateEndOffset()
        },
        startOffset(){
            this.updateEndOffset()
        },
        endOffset(){
            const blockLength = this.endOffset - this.startOffset + 1
            this.blockLength = blockLength > 0 ? blockLength : 0
        }
    },
    methods: {
        updateEndOffset(){
            this.endOffset = this.startOffset + this.blockLength - 1
        },
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async cutFileClick(){
            if(!this.validateForm()) return
            this.processing = true
            try {
                await FileCutterService.CutFilePart({
                    inputFilename: this.inFile,
                    outputFilename: this.outFile,
                    partStartOffset: this.startOffset,
                    partEndOffset: this.endOffset
                })
                alert('Action completed!')
            } catch (error) {
                panic(error)
            }
            this.processing = false
        },
        validateForm(){
            if(this.inFile.length == 0) alert('Please select an input file')
            else if(this.outFile.length == 0) alert('Please select an output file')
            else return true
            return false
        }
    }
}
</script>

<style lang="scss" scoped>
.filecut-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>