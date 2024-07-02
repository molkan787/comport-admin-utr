<script>
import KeyValuePairsForm from '../templates/KeyValuePairsForm.vue'

export default {
    components: {
        KeyValuePairsForm
    },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    watch: {
        data: {
            immediate: true,
            deep: false,
            handler(v){
                if(typeof v.metadata !== 'object'){
                    this.$set(v, 'metadata', {})
                }
                if(typeof v.metadata.attributes !== 'object'){
                    this.$set(v.metadata, 'attributes', {})
                }
            }
        }
    },
}
</script>

<template>
<div class="flash-file-attributes-form">
    <KeyValuePairsForm :data="data.metadata.attributes" :addRowText="'Add Attribute'" />
</div>    
</template>
