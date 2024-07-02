<template>
    <div class="micros-settings-panel">
        <v-tabs v-if="!!micros" v-model="tab" color="cyan">
            <v-tabs-slider color="blue"></v-tabs-slider>
            <v-tab v-for="type in types" :key="type">
                {{ type }}
            </v-tab>
        </v-tabs>

        <v-tabs-items v-if="!!micros" v-model="tab" class="heightSize">
            <v-tab-item v-for="type in types" :key="type" class="heightSize">
                <div class="settings-tab heightSize">
                    <MicroModelsList
                        :type="type"
                        :items="micros[type]"
                        @AddItemClick="AddItemClick"
                        :addBtnLoading="addingModel"
                        @DeleteItemClick="DeleteItemClick"
                    />
                </div>
            </v-tab-item>

        </v-tabs-items>
    </div>
</template>

<script>
import { SettingsService } from '../../services/settings'
import { cloneArray } from '../../utils'
import MicroModelsList from './MicroModelsList.vue'
export default {
    components: {
        MicroModelsList
    },
    data: () => ({
        tab: 0,
        addingModel: false,
        types: ['ecu','tcu','cpc'],
        /** @type {{[microType: string]:string[]}} */
        micros: null
    }),
    methods: {
        async load(){
            try {
                const micros = await SettingsService.GetMicrosModelsList()
                for(let type of this.types){
                    if(!Array.isArray(micros[type])){
                        micros[type] = []
                    }
                    micros[type] = cloneArray(micros[type]).sort((a, b) => a.localeCompare(b))
                }
                this.micros = micros
            } catch (error) {
                panic(error)
            }
        },
        async addModelClick(type){
            try {
                const modelName = await prompt({ title: 'Add ' + type.toUpperCase(), text: 'Model Name' })
                if(typeof modelName == 'string' && modelName.length > 0){

                }
            } catch (error) {
                panic(error)
            }
        },
        async AddItemClick(type){
            try {
                let modelName = await prompt({
                    title: 'Add ' + type.toUpperCase(),
                    text: 'Model Name'
                })
                if(typeof modelName !== 'string' || modelName.length < 1) return
                modelName = modelName.trim().toUpperCase()
                this.addingModel = true
                const models = this.micros[type] || (this.micros[type] = [])
                const exist = models.findIndex(item => item.trim().toUpperCase() === modelName) >= 0
                if(exist){
                    alert(`This model of ${type} already exists in the list.`, 'Model Exists')
                    return
                }
                await SettingsService.AddMicroModel(type, modelName)
                models.unshift(modelName)
                alert('Model successfully added', 'Success!');
            } catch (error) {
                panic(error)
            }
            this.addingModel = false
        },
        async DeleteItemClick(type, model){
            try {
                const confimed = await confirm(`Remove ${type.toUpperCase()} model "${model.toUpperCase()}"`)
                if(!confimed) return
                await SettingsService.RemoveMicroModel(type, model)
                const models = this.micros[type]
                if(models){
                    const index = models.findIndex(item => item === model)
                    models.splice(index, 1)
                }
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