<template>
    <div class="obdlabs-checksun-patcher-tool">
        <div class="tool-form">
            <div class="file-input">
                <v-text-field v-model.trim="seed" label="Seed (Hex)" dense />
            </div>
            <div class="file-input">
                <v-text-field v-model.number="level" label="Security Level" dense />
            </div>
            <div class="file-input">
                <v-text-field v-model.trim="deviceType" label="Device Type" dense />
            </div>
            <v-btn @click="performActionClick" :loading="loading">Get Key</v-btn>
            <div v-if="!loading && output" class="file-input" style="margin-top: 30px;">
                <v-text-field :value="output" label="Output (Key)" dense readonly />
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
        level: 1,
        seed: '',
        output: '',
    }),
    methods: {
        async performActionClick(){
            try {
                this.loading = true
                const key = await OBDLabsService.GetSecurityAccessKey({
                    deviceType: this.deviceType,
                    level: this.level,
                    seed: this.seed
                })
                this.output = key
                alert("Key successfully calculated", 'Success!')
            } catch (error) {
                panic(error)
            }
            this.loading = false
        }
    }
}
</script>

<style lang="scss" scoped>
.obdlabs-checksun-patcher-tool{
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