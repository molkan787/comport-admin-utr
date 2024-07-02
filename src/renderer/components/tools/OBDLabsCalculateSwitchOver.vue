<template>
    <div class="obdlabs-calculate-switchover-tool">
        <div class="tool-form">
            <div class="file-input">
                <v-text-field v-model.trim="deviceType" label="Device Type" dense />
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="serialNumber" label="Serial Number" dense />
            </div>
            <v-btn @click="performActionClick" :loading="loading">Get Key</v-btn>
            <div v-if="!loading && output" class="file-input" style="margin-top: 30px;">
                <v-text-field :value="output" label="Output (Switch Over)" dense readonly />
            </div>
        </div>
        <OBDLabsSettings />
    </div>
</template>

<script>
import { OBDLabsService } from '../../services/tools/obdlabs'
import HexNumberInput from '../templates/HexNumberInput.vue'
import OBDLabsSettings  from './obd-labs/OBDLabsSettings.vue'

export default {
    components: {
        HexNumberInput,
        OBDLabsSettings
    },
    data: () => ({
        loading: false,
        deviceType: '',
        serialNumber: '',
        output: '',
    }),
    methods: {
        async performActionClick(){
            try {
                this.loading = true
                const key = await OBDLabsService.CalculateSwitchOver({
                    deviceType: this.deviceType,
                    serialNumber: this.serialNumber
                })
                this.output = key
            } catch (error) {
                panic(error)
            }
            this.loading = false
        }
    }
}
</script>

<style lang="scss" scoped>
.obdlabs-calculate-switchover-tool{
    display: flex;
    flex-direction: row;
    & > div{
        box-sizing: border-box;
        padding: 1rem;
    }
    .file-input{
        display: flex;
        flex-direction: row;
        &:not(.auto-size){
            width: 650px;
        }
    }
}
</style>