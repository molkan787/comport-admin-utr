<template>
    <div class="aes-cbc-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input File" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output File" readonly dense />
            <v-btn @click="selectFileClick('out')">Select</v-btn>
        </div>
        <div class="input-field">
            <v-text-field v-model="aesKey" label="AES Key (as hex string)" dense />
        </div>
        <div class="input-field">
            <v-text-field v-model="aesIv" label="AES IV (as hex string)" dense />
        </div>
        <div class="input-field">
            <span>Decompression Algorithm</span>
            <v-radio-group v-model="compressionAlgo">
                <v-radio value="lzma" label="LZMA" />
                <v-radio value="lzss" label="LZSS" />
            </v-radio-group>
        </div>
        <!-- <v-btn @click="encodeFileClick" :loading="aip == 'encode'" :disabled="!!aip && aip != 'encode'">Encode file</v-btn> -->
        <v-btn @click="decodeFileClick" :loading="aip == 'decode'" :disabled="!!aip && aip != 'decode'">Decode file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { FileCodecService } from '../../services/tools/fileCodec'

export default {
    data: () => ({
        aip: null,
        // inFile: '',
        // outFile: '',
        // aesKey: '',
        // aesIv: '',
        compressionAlgo: 'lzma',
        inFile: 'C:\\Users\\worw7\\Documents\\Comport\\Tmp Files\\block1',
        outFile: 'C:\\Users\\worw7\\Documents\\Comport\\Tmp Files\\block1.decoded',
        aesKey: '8341C1ED72CDC25F9BAF7AEA946177EF',
        aesIv: '000102030405060708090A0B0C0D0E0F',
    }),
    watch: {
        aesKey(v){
            this.aesKey = v.replace(/\s/g, '')
        },
        aesIv(v){
            this.aesIv = v.replace(/\s/g, '')
        }
    },
    methods: {
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async encodeFileClick(){
            if(!this.validateForm()) return
            this.aip = 'encode'
            try {
                // encode here...
                alert('Encoding completed!')
            } catch (error) {
                panic(error)
            }
            this.aip = null
        },
        async decodeFileClick(){
            if(!this.validateForm()) return
            this.aip = 'decode'
            try {
                await FileCodecService.Decode({
                    inputFile: this.inFile,
                    outputFile: this.outFile,
                    aesConfig: {
                        key: this.aesKey,
                        iv: this.aesIv
                    },
                    compressionAlgo: this.compressionAlgo
                })
                alert('Decoding completed!')
            } catch (error) {
                panic(error)
            }
            this.aip = null
        },
        validateForm(){
            if(this.inFile.length == 0)
                alert('Please select an input file')
            else if(this.outFile.length == 0)
                alert('Please select an output file')
            else if(this.aesKey.trim().length == 0)
                alert('Please enter AES Key')
            else if(this.aesIv.trim().length == 0)
                alert('Please enter AES IV')
            else
                return true
            return false
        }
    }
}
</script>

<style lang="scss" scoped>
.aes-cbc-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
    .input-field{
        width: 554px;
    }
}
</style>