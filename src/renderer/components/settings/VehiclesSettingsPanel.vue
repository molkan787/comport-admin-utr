<template>
    <div class="micro-models-list">
        <div class="items">
            <div class="item">
                <v-btn @click="editItem(null)" :loading="addingModel" color="primary" text style="padding: 0 5px;">
                    <v-icon>mdi-plus</v-icon>
                    Add Vehicle
                </v-btn>
            </div>
            <div class="item" v-for="item in vehicles" :key="item.slug">
                <!-- <v-btn @click="deleteClick(item)" title="Delete" icon>
                    <v-icon>mdi-delete-outline</v-icon>
                </v-btn> -->
                <v-btn @click="editItem(item)" title="Edit / View" icon>
                    <v-icon>mdi-pencil-outline</v-icon>
                </v-btn>
                {{ item.name }}
            </div>
        </div>
    </div>
</template>

<script>
import { VehiclesRespository } from '../../services/vehiclesRespository'
import { patchObject, cloneArray, slugify } from '../../utils'
import MicroModelsList from './MicroModelsList.vue'
import { mapState } from 'vuex'
import { SettingsService } from '../../services/settings'

export default {
    components: {
        MicroModelsList
    },
    computed: mapState({
        settings: state => state.settings,
        vehicles: state => state.settings.vehicles
    }),
    data(){
        return {
            tab: 0,
            addingModel: false,
            editItemFormTemplate: {
                fields: [
                    { value: 'name', label: 'Name' },
                    {
                        type: 'grid-group',
                        grid: { cols: 3 },
                        subdataProp: 'modules',
                        fields: [
                            { label: "ECU", value: "ecu", type: 'select', options: () => this.getSortedMicrosList('ecu'), clearable: true },
                            { label: "TCU", value: "tcu", type: 'select', options: () => this.getSortedMicrosList('tcu'), clearable: true },
                            { label: "CPC", value: "cpc", type: 'select', options: () => this.getSortedMicrosList('cpc'), clearable: true }
                        ]
                    },
                ]
            }
        }
    },
    methods: {
        getSortedMicrosList(microType){
            const micros = cloneArray(this.settings.micros[microType])
            return micros.sort((a, b) => a.localeCompare(b))
        },
        async load(){
            try {
                await SettingsService.LoadVehicleList()
            } catch (error) {
                panic(error)
            }
        },
        editItem(item){
            editEntity({
                template: this.editItemFormTemplate,
                name: "Vehicle",
                data: item,
                saveHandler: (data, isNew) => this.SaveItem(data, isNew),
                deleteHandler: (data) => this.DeleteItem(data),
            });
        },
        async SaveItem(data, isNew){
            try {
                if(isNew){
                    data.slug = slugify(data.name)
                }
                const result = await VehiclesRespository.SaveVehicle(data)
                if(isNew){
                    this.vehicles.unshift(result)
                }else{
                    const item = this.vehicles.find(item => item._id.toString() === result._id.toString())
                    patchObject(item, result)
                }
            } catch (error) {
                panic(error)
            }
        },
        async DeleteItem(item){
            try {
                await VehiclesRespository.DeleteVehicle(item._id)
                const index = this.vehicles.findIndex(i => i._id.toString() === item._id.toString())
                this.vehicles.splice(index, 1)
            } catch (error) {
                panic(error)
            }
        }
    },
    mounted(){
        this.load()
    }
}
</script>

<style lang="scss" scoped>
.micros-settings-panel{
    .heightSize{
        height: calc(100vh - 172px);
    }
}
</style>