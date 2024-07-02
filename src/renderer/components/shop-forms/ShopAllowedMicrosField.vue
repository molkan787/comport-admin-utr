<template>
    <div class="shop-allowed-micros-field">
        <label>Allowed Modules</label> <br> <br>
        <v-autocomplete
            label="ECUs"
            v-model="allowedMicros.ecus"
            :items="getSortedMicrosList('ecu')"
            multiple chips deletable-chips clearable dense />
        <v-autocomplete
            label="TCUs"
            v-model="allowedMicros.tcus"
            :items="getSortedMicrosList('tcu')"
            multiple chips deletable-chips clearable dense />
        <v-autocomplete
            label="CPCs"
            v-model="allowedMicros.cpcs"
            :items="getSortedMicrosList('cpc')"
            multiple chips deletable-chips clearable dense />
        <label>Allowed Vehicle</label> <br> <br>
        <v-autocomplete
            label="Vehicles"
            v-model="data.allowed_vehicle"
            :items="sortedVehicles"
            item-text="name" item-value="slug"
            multiple chips deletable-chips clearable dense />
    </div>
</template>

<script>
import { mapState } from 'vuex'
import { cloneArray } from '../../utils'

export default {
    computed: {
        ...mapState({
            micros: state => state.settings.micros,
            vehicles: state => state.settings.vehicles,
        }),
        allowedMicros(){
            return this.data.allowed_modules || {}
        },
        sortedVehicles(){
            return this.vehicles.sort((a, b) => a.name.localeCompare(b.name))
        }
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
            handler(){
                const am = this.data.allowed_modules
                if(typeof am !== 'object' || am === null){
                    this.data.allowed_modules = {
                        ecus: [],
                        tcus: [],
                        cpcs: [],
                    }
                }
            }
        }
    },
    methods: {
        getSortedMicrosList(microType){
            const micros = cloneArray(this.micros[microType])
            return micros.sort((a, b) => a.localeCompare(b))
        },
    }
}
</script>

<style lang="scss" scoped>
.shop-allowed-micros-field{
    margin-top: 1rem;
}
</style>