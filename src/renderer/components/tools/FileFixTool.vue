<template>
    <div class="file-fix-tool">
        <div class="file-input">
            <v-text-field :value="inputA" label="Input File A" readonly dense />
            <v-btn @click="selectFileClick('inputA')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="inputB" label="Input File B" readonly dense />
            <v-btn @click="selectFileClick('inputB')">Select</v-btn>
        </div>
        <div class="file-input">
            <HexNumberInput v-model="blockLength" label="Block Length (Hex)" dense />
            <!-- <v-btn @click="selectFileClick('output', true)">Select</v-btn> -->
        </div>
        <div class="file-input">
            <v-text-field :value="output" label="Output File" readonly dense />
            <v-btn @click="selectFileClick('output', true)">Select</v-btn>
        </div>
        <v-btn @click="fixClick" :loading="loading">Fix file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { FileFixService } from '../../services/tools/filefix'
import HexNumberInput from '../templates/HexNumberInput.vue'

export default {
    components: {
        HexNumberInput
    },
    data: () => ({
        loading: false,
        blockLength: 0,
        inputA: '',
        inputB: '',
        output: ''
    }),
    methods: {
        async selectFileClick(prop, saveDialog){
            const fn = saveDialog ? promptSaveFile : promptFile
            const filename = await fn()
            if(!!filename){
                this.$set(this, prop, filename)
            }
        },
        async fixClick(){
            try {
                this.loading = true
                await FileFixService.FixFile({
                    filenameA: this.inputA,
                    filenameB: this.inputB,
                    outputFilename: this.output,
                    totalLength: this.blockLength
                })
                alert('File successfully fixed!', 'Success!')
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