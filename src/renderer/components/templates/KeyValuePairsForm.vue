<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        },
        addRowText: {
            type: String,
            default: 'Add Row'
        }
    },
    watch: {
        data: {
            immediate: true,
            deep: false,
            handler(v, ov){
                if(v !== ov){
                    const pairs = Object.entries(v)
                    this.pairs = pairs.length > 0 ? pairs : [['', '']]
                }
            }
        },
        pairs: {
            immediate: false,
            deep: true,
            handler(v){
                const ek = Object.keys(this.data)
                const m = new Map()
                for(let i = 0; i < v.length; i++){
                    let [key, value] = v[i]
                    key = key.trim()
                    if(key.length === 0) continue
                    m.set(key, true)
                    this.$set(this.data, key, value)
                }
                for(let i = 0; i < ek.length; i++){
                    const key = ek[i]
                    if(!m.get(key)){
                        this.$delete(this.data, key)
                    }
                }
            }
        }
    },
    data: () => ({
        pairs: []
    })
}
</script>

<template>
<div class="key-value-pairs-form">
    <div class="header row">
        <span>Name</span>
        <span>Value</span>
    </div>
    <div class="row" v-for="(p, index) in pairs" :key="index">
        <v-text-field v-model="p[0]" dense hide-details outlined />
        <v-text-field v-model="p[1]" dense hide-details outlined />
    </div>
    <div class="row">
        <div>
            <v-btn @click="pairs.push(['', ''])" color="primary" elevation="0" text>
                <v-icon>mdi-plus</v-icon>
                {{ addRowText }}
            </v-btn>
        </div>
    </div>
</div>    
</template>

<style lang="scss" scoped>
.key-value-pairs-form{
    .row{
        width: 100%;
        display: flex;
        flex-direction: row;
        margin: 0;
        & > *{
            flex: 1;
        }
    }
}
</style>