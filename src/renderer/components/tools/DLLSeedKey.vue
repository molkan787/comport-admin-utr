<template>
    <div class="seedkey-tool-panel">
        <div class="controls">
            <div class="file-input">
                <v-text-field :value="dllFilename" label="DLL File" readonly dense />
                <v-btn @click="selectFileClick('in')">Select</v-btn>
            </div>
            <div class="file-input">
                <v-text-field v-model="seed" label="Seed" dense />
            </div>
            <div class="file-input">
                <v-text-field v-model.number="securityAccessLevel" label="Security Access Level" dense type="number" />
            </div>
            <div class="file-input">
                <v-text-field :value="resultKey || '---'" label="Generated Key (Result)" readonly dense />
            </div>
            <v-btn :loading="loading" @click="calculateKeyClick">Generate Key</v-btn>
        </div>
        <div class="description" :class="{ progress: testing }">{{ testOutput }}</div>
    </div>
</template>

<script>
import { promptFile } from '../../utils'
import { DLLSeedKey } from '../../services/tools/dll-seedkey'

export default {
    props: {
        options: {
            type: Object,
        }
    },
    data: () => ({
        loading: false,
        dllFilename: '',
        seed: '',
        securityAccessLevel: 0,
        resultKey: '',
        testOutput: '',
        testing: false,
    }),
    methods: {
        async calculateKeyClick(){
            if(!this.validateInput()) return
            try {
                this.loading = true
                this.resultKey = ''
                const seed = this.seed.replace(/\s/g, '');
                const generatedKey = await DLLSeedKey.GenerateKey(this.dllFilename, seed, this.securityAccessLevel)
                this.resultKey = generatedKey
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        validateInput(){
            if(this.dllFilename.length < 4){
                alert('Please select a DLL file')
            }else if(this.seed.trim().length < 4){
                alert('Please enter a valid seed')
            }else{
                return true
            }
            return false
        },
        async selectFileClick(){
            const filename = await promptFile()
            if(!filename) return
            this.dllFilename = filename
            this.testOutput = 'Loading Information...'
            this.testing = true
            try {
                const output = await DLLSeedKey.TestDLL(this.dllFilename)
                this.testOutput = output.trim()
            } catch (error) {
                this.testOutput = 'Error occured while testing the DLL.'
            }
            this.testing = false
        },
    },
}
</script>

<style lang="scss" scoped>
.seedkey-tool-panel{
    display: flex;
    flex-direction: row;
    padding: 1rem;
    width: 100%;
    .controls{
        flex: 1;
        max-width: 650px;
        display: flex;
        flex-direction: column;
        .file-input{
            width: 100%;
        }
    }
    .description{
        padding-left: 1rem;
        color: #535353;
        white-space: pre-wrap;
        text-align: left;
        &.progress {
            font-style: italic;
        }
    }
}
</style>