<template>
    <div class="shop-logo-field">
        <GenericEntryAttachmentsInput
            label="Logo"
            :groupName="groupName"
            :singleAttachment="true"
            :entryData="data"
        />
    </div>
</template>

<script>
import { ShopService } from '../../services/shop'
import { deepClone } from '../../utils'
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
        groupName: deepClone(ShopService._groupName)
    })
}
</script>

<style lang="scss" scoped>
.shop-logo-field{
    margin-top: 1rem;
}
</style>