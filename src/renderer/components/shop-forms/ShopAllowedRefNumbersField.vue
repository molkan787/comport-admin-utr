<template>
    <v-text-field v-model="itemsString" label="Allowed Ref Numbers" placeholder="comma separated ref numbers (ex: 200100,300200)" />
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true,
        }
    },
    data: () => ({
        itemsString: '',
    }),
    watch: {
        'data.allowed_reference_numbers': {
            immediate: true,
            deep: true,
            handler(val){
                if(Array.isArray(val)){
                    this.itemsString = val.join(',')
                }else{
                    this.itemsString = ''
                }
            }
        },
        itemsString: {
            immediate: false,
            deep: false,
            handler(val){
                const items = val.split(',').map(i => i.trim()).filter(i => i.length > 0)
                this.data.allowed_reference_numbers = items
            }
        }
    }
    
}
</script>