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
        <div class="split-input">
            <v-text-field v-model.trim="options.targetChecksum" label="Target Checksum (Hex)" placeholder="target checksum in hex format" dense />
            <v-text-field v-model.trim="options.position" label="Position (Decimal)" placeholder="byte.bit position of mutable input bits" dense />
        </div>
        <div class="split-input">
            <v-text-field v-model.trim="options.backwardPosition" label="Backword Position (Decimal)" placeholder="position offset from the end of the input" dense />
            <v-text-field v-model.trim="options.bits" label="bits" placeholder="specify bits at positions l..r with step s" dense />
        </div>
        <div class="split-input">
            <v-text-field v-model.trim="options.polynomial" label="Polynomial (Hex)" placeholder="generator polynomial" dense />
            <v-text-field v-model.trim="options.initialRegister" label="Initial Register (Hex)" placeholder="initial register value" dense />
        </div>
        <div class="split-input">
            <v-text-field v-model.trim="options.registerSize" label="Register size" placeholder="register size in bits" dense />
            <v-text-field v-model.trim="options.xorMask" label="XOR Mask" placeholder="final register XOR mask" dense />
        </div>
        <div class="split-input checkboxes-row">
            <v-checkbox v-model="options.reverseInput" label="Reverse input bytes?" hide-details />
            <v-checkbox v-model="options.reverseFinal" label="Reverse final register?" hide-details />
        </div>
        <v-btn @click="patchClick" :loading="loading">Patch file</v-btn>
    </div>
</template>

<script>
import { promptFile, promptSaveFile } from '../../utils'
import { RemoteToolsService } from '../../services/tools/remoteTools'

export default {
    data: () => ({
        loading: false,
        input: '',
        output: '',
        options: {
            targetChecksum: '',
            position: '',
            backwardPosition: '',
            bits: '',
            polynomial: '',
            initialRegister: '',
            registerSize: '',
            xorMask: '',
            reverseInput: false,
            reverseFinal: false,
        }
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
                await RemoteToolsService.CRCHack(
                    this.input,
                    this.output,
                    this.options
                )
                alert('File successfully patched!', 'Success!')
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
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
    .split-input{
        width: 650px;
        display: flex;
        flex-direction: row;
        & > *{
            flex: 1;
        }
    }
    .checkboxes-row{
        margin-bottom: 1rem;
        & > .v-input{
            margin-top: 0 !important;
        }
    }
}
</style>