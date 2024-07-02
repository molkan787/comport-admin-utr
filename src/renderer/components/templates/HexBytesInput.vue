<template>
    <v-text-field class="hex-bytes-input" v-bind="$props" v-model="hexvalue" ref="tf" />
</template>

<script>
const HEX_DIGITS = '0123456789ABCDEF'
export default {
    name: 'HexNumberInput',
    props: ['value', 'label', 'dense'],
    watch: {
        value: {
            immediate: true,
            handler(value){
                this.setDisplayValue(value || [])
            }
        }
    },
    methods: {
        parseHexBytes(textHex){
            textHex = textHex.trim().toUpperCase()
            const bytes = []
            let buffer = ''
            for(let i = 0; i < textHex.length; i++){
                var d = textHex[i]
                if(HEX_DIGITS.indexOf(d) == -1) continue;
                buffer += d
                if(buffer.length == 1 && i + 1 >= textHex.length)
                    buffer += '0'
                if(buffer.length == 2){
                    bytes.push(parseInt(buffer, 16))
                    buffer = ''
                }
            }
            return bytes
        },
        inputLostFocus(){
            const bytes = this.parseHexBytes(this.hexvalue)
            this.setDisplayValue(bytes)
            this.$emit('input', bytes)
        },
        setDisplayValue(bytesValue){
            this.hexvalue = bytesValue.map(b => b.toString(16).toUpperCase().padStart(2, '0')).join(' ')
        },
        getInputEl(){
            const tf = this.$refs['tf']
            return tf.$refs['input']
        }
    },
    data: () => ({
        hexvalue: '',
        blurEventListener: null
    }),
    mounted(){
        const el = this.getInputEl()
        this.blurEventListener = () => this.inputLostFocus()
        el.addEventListener('blur', this.blurEventListener)
    },
    beforeDestroy(){
        if(this.blurEventListener){
            const el = this.getInputEl()
            el.removeEventListener('blur', this.blurEventListener)
        }
    }
}
</script>

<style lang="scss">
.hex-bytes-input{
    input{
        font-family: monospace;
    }
}
</style>