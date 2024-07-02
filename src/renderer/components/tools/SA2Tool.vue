<template>
    <div class="sa2-tool-panel">
        <div class="file-input">
            <v-text-field v-model="instructionTape" label="Instruction Tape" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model="seed" label="Seed" dense />
        </div>
        <div class="file-input">
            <v-text-field :value="resultKey || '---'" label="Generated Key (Result)" readonly dense />
        </div>
        <v-btn :loading="loading" @click="calculateKeyClick">Calculate Key</v-btn>
    </div>
</template>

<script>
import { SA2Service } from '../../services/tools/sa2'

export default {
    data: () => ({
        loading: false,
        instructionTape: '',
        seed: '',
        resultKey: ''
    }),
    methods: {
        async calculateKeyClick(){
            if(!this.validateInput()) return
            try {
                this.loading = true
                this.resultKey = ''
                const instructionTape = this.instructionTape.trim()
                const seed = this.seed.trim();
                const generaedKey = await SA2Service.GenerateKey(instructionTape, seed)
                this.resultKey = generaedKey
            } catch (error) {
                console.error(error)
                alert(error.toString(), 'An error occured')
            }
            this.loading = false
        },
        validateInput(){
            if(this.instructionTape.trim().length < 2){
                alert('Please enter a valid instruction tape')
            }else if(this.seed.trim().length < 8){
                alert('Please enter a valid seed')
            }else{
                return true
            }
            return false
        }
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