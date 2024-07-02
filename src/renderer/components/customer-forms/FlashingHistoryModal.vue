<template>
    <Modal :open="isOpen" @okClick="isOpen = false" :maxWidth="1000" okButtonText="Close" :cancelButtonText="null" title="Flashing History">
        <div class="flashinghistory-modal-items">
            <v-data-table
                :headers="headers"
                :items-per-page="5"
                :sort-desc="true"
                :sort-by="'date'"
                :loading="loading"
                :items="historyItems"
            >
                <template v-slot:[`item.date`]="{ item }">
                    {{ item.date | date }}
                </template>
                <template v-slot:[`item.tune_name`]="{ item }">
                    <input type="text" :value="item.tune_name" readonly>
                </template>
                <template v-slot:[`item.flags`]="{ item }">
                    <v-chip
                        v-if="hasVinMismatch(item)" 
                        title="Found different VIN after flashing car"
                        color="red"
                        text-color="white"
                        x-small
                    >
                        VIN MISMATCH
                    </v-chip>
                </template>
            </v-data-table>
        </div>
    </Modal>
</template>

<script>
import Modal from '../templates/Modal.vue'
import { FlashingHistoryService } from '../../services/flashingHistory'
import { CustomerService } from '../../services/customer'

export default {
    components: {
        Modal
    },
    data: () => ({
        isOpen: false,
        historyItems: [],
        loading: false,
        headers: [
            { text: 'Date', value: 'date' },
            { text: 'Module', value: 'micro_type' },
            { text: 'Result', value: 'result_status' },
            { text: 'Flash Name', value: 'tune_name' },
            { text: '', value: 'flags' },
        ]
    }),
    methods: {
        async loadItems(customerId){
            this.loading = true
            try {
                const items = await FlashingHistoryService.GetCustomerHistory(customerId)
                this.historyItems = items
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        hasVinMismatch(data){
            return !!(data.flags && data.flags[CustomerService.Flags.POSTFLASH_VIN_MISMATCH])
        },
        open(options){
            this.historyItems = []
            this.isOpen = true
            this.loadItems(options.customerId)
        }
    },
    filters: {
        date(d){
            if(!(d instanceof Date)) d = new Date(d)
            return d.toLocaleString()
        }
    },
    mounted(){
        window.openCustomerFlashingHistory = options => this.open(options)
        // setTimeout(() => openCustomerFlashingHistory({ customerId: '61fcfa7ebf940f30e5e5ff74' }), 5000)
    }
}
</script>

<style lang="scss" scoped>
.flashinghistory-modal-items{
    height: fit-content;
    min-height: calc(100vh - 250px);;
    overflow-y: visible;
    background-color: #fbfbfb;
    border: 1px solid #ececec;
    input{
        width: 100%;
    }
}
</style>