<template>
    <div class="file-database-attachement-field">
        <GenericEntryAttachmentsInput :entryData="data" :groupName="groupName" :singleAttachment="true" label="File" />
    </div>
</template>

<script>
import GenericEntryAttachmentsInput from '../templates/GenericEntryAttachmentsInput.vue'
export default {
    components: {
        GenericEntryAttachmentsInput
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        groupName: {
            type: String,
            default: null
        },
    }
}
</script>

<style lang="scss">
.file-database-attachement-field{
    padding-top: 10px;
}
</style>