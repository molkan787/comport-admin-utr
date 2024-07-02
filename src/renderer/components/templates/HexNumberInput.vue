<template>
    <v-text-field class="hex-number-input" v-bind="$props" v-model="hexvalue" />
</template>

<script>
export default {
    name: 'HexNumberInput',
    props: ['value', 'label', 'dense'],
    watch: {
        value: {
            immediate: true,
            handler(value){
                this.hexvalue = typeof value == 'number' ? value.toString(16).toUpperCase() : ''
            }
        },
        hexvalue(value){
            const val = parseInt(value, 16)
            const hex = val.toString(16).toUpperCase()
            if(Number.isNaN(val)){
                this.hexvalue = '0'
            }else if(hex != this.hexvalue.toUpperCase()){
                this.hexvalue = hex
            }else{
                this.$emit('input', val)
            }
        }
    },
    data: () => ({
        hexvalue: ''
    })
}
</script>

<style lang="scss">
.hex-number-input{
    input{
        font-family: monospace;
    }
}
</style>