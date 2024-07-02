<template>
    <div class="seedkey-tool-panel">
        <div class="controls">
            <div class="file-input">
                <v-text-field v-model="seed" label="Seed" dense />
            </div>
            <div class="file-input" v-if="options.showSecurityAccessLevel">
                <v-text-field v-model.number="securityAccessLevel" label="Security Access Level" dense type="number" />
            </div>
            <div class="file-input">
                <v-text-field :value="resultKey || '---'" label="Generated Key (Result)" readonly dense />
            </div>
            <v-btn :loading="loading" @click="calculateKeyClick">Calculate Key</v-btn>
        </div>
        <div class="description">
            <div class="item" v-for="(item, index) in available_configs" :key="index">
                Level {{ item.level }} : Seed Length {{ item.seedLength }} => Output Key Length {{ item.keyLength }}
            </div>
        </div>
    </div>
</template>

<script>

export default {
    props: {
        options: {
            type: Object,
        }
    },
    data: () => ({
        loading: false,
        seed: '',
        securityAccessLevel: 0,
        resultKey: ''
    }),
    computed: {
        available_configs(){
            return this.options.available_configs || []
        }
    },
    methods: {
        async calculateKeyClick(){
            if(!this.validateInput()) return
            try {
                this.loading = true
                this.resultKey = ''
                const seed = this.seed.replace(/\s/g, '');
                const generatedKey = await this.options.generate(seed, this.securityAccessLevel)
                this.resultKey = generatedKey
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        validateInput(){
            if(this.seed.trim().length < 4){
                alert('Please enter a valid seed')
            }else{
                return true
            }
            return false
        }
    },
    activated(){
        this.seed = ''
        this.securityAccessLevel = 0
        this.resultKey = ''
    }
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
        color: #b5b5b5;
    }
}
</style>