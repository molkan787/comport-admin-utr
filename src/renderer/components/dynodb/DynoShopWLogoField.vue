<template>
    <div class="dyno-shop-wlogo-field">
        <GenericEntryAttachmentsInput
            label="Watermark Logo"
            :groupName="groupName"
            :singleAttachment="true"
            :entryData="data"
        />
    </div>
</template>

<script>
import { DynoDbService } from '../../services/dynodb'
import GenericEntryAttachmentsInput from '../templates/GenericEntryAttachmentsInput.vue'

export default {
    components: {
        GenericEntryAttachmentsInput
    },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        groupName: DynoDbService.ShopsListGroupName
    })
}
</script>

<style lang="scss" scoped>
.dyno-shop-wlogo-field{
    margin-top: 1rem;
}
</style>