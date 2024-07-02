<template>
<div class="multi-file-input">
    <FileInput
        v-for="(f, i) in items"
        :key="i" v-model="items[i]"
        :label="label ? `${label} ${i + 1}` : null"
    />
</div>
</template>

<script>
import FileInput from './FileInput.vue'

export default {
    components: {
        FileInput
    },
    props: {
        items: {
            type: Array,
            required: true
        },
        type: { // 'open' | 'save' | 'folder'
            type: String,
            default: 'open'
        },
        label: {
            type: String,
            default: null
        },
        allowClearOnly: {
            type: Boolean,
            default: false
        },
        legacy: {
            type: Boolean,
            default: false
        }
    },
    watch: {
        items: {
            immediate: true,
            deep: true,
            handler(){
                for(let i = 0; i < this.items.length - 1; i++){
                    if((this.items[i] || '').trim().length === 0){
                        this.items.splice(i, 1)
                        break
                    }
                }
                const last = this.items[this.items.length - 1] || ''
                if(last.trim().length > 0 || this.items.length === 0){
                    this.items.push('')
                }
            }
        }
    }
}
</script>

.<style lang="scss" scoped>
.multi-file-input{
    width: 100%;
}
</style>