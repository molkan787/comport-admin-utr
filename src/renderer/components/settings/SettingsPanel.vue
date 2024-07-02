<template>
    <div class="settings-panel">
        <v-tabs v-model="tab" color="cyan">
            <v-tabs-slider color="blue"></v-tabs-slider>
            <v-tab key="micros">Micros</v-tab>
            <v-tab key="vehicles">Vehicles</v-tab>
        </v-tabs>

        <v-tabs-items v-model="tab">
            <v-tab-item key="micros">
                <MicrosSettingsPanel />
            </v-tab-item>
            <v-tab-item key="vehicles">
                <VehiclesSettingsPanel />
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import MicrosSettingsPanel from './MicrosSettingsPanel.vue'
import VehiclesSettingsPanel from './VehiclesSettingsPanel.vue'
export default {
    components: {
        MicrosSettingsPanel,
        VehiclesSettingsPanel
    },
    data: () => ({
        tab: 0,
    }),
    methods: {
        async load(){
            try {
                
            } catch (error) {
                panic(error)
            }
        },
    },
    mounted(){
        this.$emit('mounted')
    }
}
</script>

<style lang="scss" scoped>
.settings-panel{
    
}
</style>