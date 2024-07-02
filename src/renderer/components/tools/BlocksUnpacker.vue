<script>
import MultiFileInput from '../templates/MultiFileInput.vue'
import FileInput from '../templates/FileInput.vue'
import { BlocksUnpackerService, DECOMPRESSION_ALGORITHMS, PADDING_TYPES } from '../../services/tools/blocksUnpacker'

const TestInput = false
export default {
    components: {
        MultiFileInput,
        FileInput
    },
    props: {
        options: {
            type: Object,
        }
    },
    computed: {
        isPacker(){
            return (this.options || {}).isPacker
        }
    },
    watch: {
        'decryption.AesKey'(){
            this.decryption.AesKey = this.decryption.AesKey.replace(/\s/g, '')
        },
        'decryption.AesIV'(){
            this.decryption.AesIV = this.decryption.AesIV.replace(/\s/g, '')
        }
    },
    data: () => ({
        loading: false,
        inputFiles: TestInput ? ['C:\\Users\\worw7\\Downloads\\FD_01.bin'] : [],
        outputDirectory: TestInput ? 'C:\\Users\\worw7\\Downloads\\unpacked blocks' : '',
        decryption: {
            AesKey: TestInput ? '8341C1ED72CDC25F9BAF7AEA946177EF' : '',
            AesIV: TestInput ? '000102030405060708090A0B0C0D0E0F' : ''
        },
        decompression: {
            Algorithm: DECOMPRESSION_ALGORITHMS.LZRB 
        },
        padding: {
            Type: PADDING_TYPES.LENGTH_BASED_BYTE,
            ExactByte: ''
        },
        LENGTH_BASED_BYTE: PADDING_TYPES.LENGTH_BASED_BYTE,
        EXACT_BYTE: PADDING_TYPES.EXACT_BYTE
    }),
    methods: {
        async unpackClick(){
            this.loading = true
            try {
                if(this.validateInput()){
                    await this.unpack()
                    alert('Files successfully Unpacked', 'Completed')
                }
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        async unpack(){
            const files = this.inputFiles.filter(f => !!f)
            if(this.isPacker){
                await BlocksUnpackerService.PackMultipleFiles({
                    InputFiles: files,
                    OutputDirectory: this.outputDirectory,
                    EncryptionConfig: this.decryption,
                    PaddingConfig: {
                        Type: this.padding.Type,
                        ExactByte: parseInt(this.padding.ExactByte.trim(), 16)
                    },
                    CompressionConfig: this.decompression
                })
            }else{
                await BlocksUnpackerService.UnpackMultipleFiles({
                    InputFiles: files,
                    OutputDirectory: this.outputDirectory,
                    DecryptionConfig: this.decryption,
                    PaddingConfig: {
                        Type: this.padding.Type,
                        ExactByte: parseInt(this.padding.ExactByte.trim(), 16)
                    },
                    DecompressionConfig: this.decompression
                })
            }
        },
        validateInput(){
            const files = this.inputFiles.filter(f => !!f)
            if(!this.outputDirectory || this.outputDirectory.length === 0){
                alert('Please select an output directory')
            }else if(files.length == 0){
                alert('Please select atleast one input file')
            }else if(this.decryption.AesKey.length === 0 || this.decryption.AesIV.length === 0){
                alert('Please enter a valid AES Config')
            }else if(this.padding.Type === PADDING_TYPES.EXACT_BYTE && this.padding.ExactByte.trim().length !== 2){
                alert('Please enter a valid padding byte value (A single byte / 2 Hex digits)')
            }else{
                return true
            }
            return false
        }
    }
}
</script>

<template>
<div class="blocks-unpacker">
    <div class="left-column">
        <span class="header">Output Directory</span>
        <FileInput v-model="outputDirectory" type="folder" :label="null" hideDetails />
        <span class="header">Input Blocks</span>
        <MultiFileInput :items="inputFiles" />
    </div>
    <div class="right-column">
        <span class="header">
            {{ isPacker ? 'Encryption' : 'Decryption' }} Config
        </span>
        <v-text-field label="AES Key" v-model="decryption.AesKey" dense />
        <v-text-field label="AES IV" v-model="decryption.AesIV" dense hide-details />
        <span class="header">Padding Removal</span>
        <v-radio-group v-model="padding.Type" label="Type" row hide-details >
            <v-radio label="Length Based Byte" :value="LENGTH_BASED_BYTE" />
            <v-radio label="Exact Byte" :value="EXACT_BYTE" />
        </v-radio-group>
        <v-text-field v-if="padding.Type === EXACT_BYTE" v-model="padding.ExactByte" label="Padding Byte (Hex)" />
        <span class="header">
            {{ isPacker ? 'Compression' : 'Decompression' }}
        </span>
        <v-radio-group v-model="decompression.Algorithm" row hide-details >
            <v-radio label="LZRB" value="lzrb" />
            <v-radio label="LZSS" value="lzss" />
        </v-radio-group>
        <br>
        <v-btn @click="unpackClick" :loading="loading">
            {{ isPacker ? 'Pack' : 'Unpack' }} Files
        </v-btn>
    </div>
</div>
</template>

<style lang="scss" scoped>
.blocks-unpacker{
    padding: 1rem;
    display: flex;
    flex-direction: row;
}
.left-column{
    width: 650px;
    padding-right: 1rem;
}
.right-column{
    flex: 1;
}
.header{
    display: inline-block;
    margin-bottom: 0.5rem;
    &:not(:first-child){
        margin-top: 1rem;
    }
}
.v-input--selection-controls{
    margin-top: 0 !important;
}
</style>