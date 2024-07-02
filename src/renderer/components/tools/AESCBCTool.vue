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
        <v-btn @click="encryptFileClick" :loading="aip == 'encrypt'" :disabled="!!aip && aip != 'encrypt'">Encrypt file</v-btn>
        <v-btn @click="decryptFileClick" :loading="aip == 'decrypt'" :disabled="!!aip && aip != 'decrypt'">Decrypt file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { AESEncryptionService } from '../../services/tools/aes'

export default {
    data: () => ({
        aip: null,
        inFile: '',
        outFile: '',
        aesKey: '',
        aesIv: ''
    }),
    methods: {
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async encryptFileClick(){
            if(!this.validateForm()) return
            this.aip = 'encrypt'
            try {
                await AESEncryptionService.EncryptFileCBC({
                    key: this.aesKey.trim(),
                    iv: this.aesIv.trim(),
                    inFilename: this.inFile,
                    outFilename: this.outFile
                })
                alert('Encryption completed!')
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.aip = null
        },
        async decryptFileClick(){
            if(!this.validateForm()) return
            this.aip = 'decrypt'
            try {
                await AESEncryptionService.DecryptFileCBC({
                    key: this.aesKey.trim(),
                    iv: this.aesIv.trim(),
                    inFilename: this.inFile,
                    outFilename: this.outFile
                })
                alert('Decryption completed!')
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