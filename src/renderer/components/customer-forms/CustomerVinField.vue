<script>
import { CustomerService } from '../../services/customer'
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    computed: {
        hasVinMismatch(){
            const d = this.data
            return !!(d && d.flags && d.flags[CustomerService.Flags.POSTFLASH_VIN_MISMATCH])
        }
    },
    methods: {
        async closeClick(){
            const confirmed = await confirm('Do you want to clear out VIN Mismatch flag for this customer?')
            if(!confirmed) return
            try {
                await CustomerService.SetFlag(
                    this.data._id,
                    CustomerService.Flags.POSTFLASH_VIN_MISMATCH,
                    false
                )
                this.data.flags[CustomerService.Flags.POSTFLASH_VIN_MISMATCH] = false
            } catch (error) {
                panic(error)
            }
        }
    }
}
</script>

<template>
    <div class="customer-vin-field">
        <v-text-field v-model="data.vin" label="VIN" placeholder="VIN" dense hide-details />
        <v-chip
            v-if="hasVinMismatch"
            title="Found different VIN after flashing car"
            color="red"
            text-color="white"
            close
            @click:close="closeClick"
        >
            VIN MISMATCH
        </v-chip>
    </div>
</template>

<style lang="scss" scoped>
.customer-vin-field{
    margin-top: 1rem;
    display: flex;
    flex-direction: row;
    .v-text-field{
        flex: 1;
    }
}
</style>