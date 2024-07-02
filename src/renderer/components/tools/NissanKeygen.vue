<template>
    <div class="sa2-tool-panel">
        <div class="file-input">
            <v-radio-group v-model="algo" row>
                <v-radio label="Gen 1" value="gen1" />
                <v-radio label="Gen 2" value="gen2" />
            </v-radio-group>
        </div>
        <div class="file-input">
            <v-text-field v-model="seed" label="Seed (4 Bytes in HEX)" dense />
        </div>
        <div class="file-input" v-if="algo == 'gen1'">
            <v-text-field v-model.number="scode" label="Scode" dense type="number" />
        </div>
        <div class="file-input">
            <v-text-field :value="resultKey || '---'" label="Generated Key (Result)" readonly dense />
        </div>
        <v-btn :loading="loading" @click="calculateKeyClick">Calculate Key</v-btn>
    </div>
</template>

<script>
import { RemoteToolsService } from '../../services/tools/remoteTools'

export default {
    data: () => ({
        loading: false,
        algo: 'gen1',
        seed: '',
        scode: 0,
        resultKey: ''
    }),
    methods: {
        async calculateKeyClick(){
            if(!this.validateInput()) return
            try {
                this.loading = true
                this.resultKey = ''
                const seed = this.seed.trim();
                const generatedKey = await RemoteToolsService.NissanKeygen(this.algo, seed, this.scode)
                this.resultKey = generatedKey
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        validateInput(){
            if(this.seed.trim().length < 8){
                alert('Please enter a valid seed')
            }else{
                return true
            }
            return false
        }
    },
    activated(){
        this.seed = ''
        this.resultKey = ''
        this.scode = ''
    }
}
</script>

<style lang="scss" scoped>
.sa2-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>