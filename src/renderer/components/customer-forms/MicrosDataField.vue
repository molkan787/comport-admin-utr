<script>
const { clipboard } = require('electron')
import Modal from '../templates/Modal.vue'
import DropdownButton from '../templates/DropdownButton.vue'
import { promptFile, promptSaveFile, readFile, writeFile } from '../../utils'
import { CustomerService } from '../../services/customer'

export default {
    components: {
        Modal,
        DropdownButton
    },
    props: {
        data: { type: Object, required: true },
        isNew: { type: Boolean, required: true },
    },
    data: () => ({
        mOpen: false,
        currentMicroType: null,
        mTitle: '',
        mData: [],
        copyDataTypesItems: [
            { text: 'Copy as JSON', value: 'json' },
            { text: 'Copy as CSV', value: 'csv' },
        ],
        exportingData: false,
        importingData: false,
    }),
    methods: {
        async exportDataClick(){
            this.exportingData = true
            try {
                const jsonData = JSON.stringify(this.getMicroData(this.currentMicroType))
                const filename = await promptSaveFile({ filters: [{ name: 'JSON Data', extensions: ['json'] }] })
                if(filename){
                    await writeFile(filename, jsonData)
                }
            } catch (error) {
                panic(error)
            }
            this.exportingData = false
        },
        async importDataClick(){
            this.importingData = true
            try {
                const filename = await promptFile({ filters: [{ name: 'JSON Data', extensions: ['json'] }] })
                if(filename){
                    const jsonData = await readFile(filename)
                    const data = JSON.parse(jsonData)
                    const dataProp = this.getMicroDataKey(this.currentMicroType)
                    await CustomerService.patchCustomer(this.data._id, { [dataProp]: data })
                    this.data[dataProp] = data
                    this.loadData()
                }
            } catch (error) {
                panic(error)
            }
            this.importingData = false
        },
        viewClick(microType){
            this.currentMicroType = microType
            if(microType === 'otherInfo'){
                this.mTitle = 'Other Data'
            }else{
                this.mTitle = microType.toUpperCase() + ' Identifiers Data'
            }
            this.loadData()
            this.mOpen = true
            
        },
        getMicroData(microType){
            return this.data[this.getMicroDataKey(microType)]
        },
        getMicroDataKey(microType){
            if(microType === 'otherInfo') return 'otherInfo'
            return microType + '_read_identifiers'
        },
        loadData(){
            this.mData = this.prepareData(this.getMicroData(this.currentMicroType))
        },
        prepareData(data){
            if(!data) return null
            const entries = Object.entries(data)
            return entries.map(([name, value]) => ({
                name,
                value: Array.isArray(value) ? value.map(b => (b & 0xFF).toString(16).padStart(2, '0')).join('') : (value || '').toString()
            }))
        },
        copyClick(format){
            const formated = format === 'json' ?
                            this.formatDataAsJSON(this.mData) :
                            this.formatDataAsCSV(this.mData)
            clipboard.writeText(formated)
        },
        formatDataAsCSV(items){
            let text = 'name,value'
            for(let item of items){
                text += `\n${item.name},${item.value}`
            }
            return text
        },
        formatDataAsJSON(items){
            const obj = items.reduce((m, item) => { m[item.name] = item.value; return m }, {})
            return JSON.stringify(obj)
        }
    }
}
</script>

<template>
    <div class="micros-data-field">
        <div class="wrapper" v-if="!isNew">
            <v-btn @click="viewClick('ecu')" elevation="0">ECU Data</v-btn>
            <v-btn @click="viewClick('tcu')" elevation="0">TCU Data</v-btn>
            <v-btn @click="viewClick('cpc')" elevation="0">CPC Data</v-btn>
            <v-btn @click="viewClick('otherInfo')" elevation="0">Other Data</v-btn>
        </div>
        <Modal :open="mOpen" :title="mTitle" @okClick="mOpen = false" okButtonText="Close" :cancelButtonText="null">
            <div class="wrapper">
                <DropdownButton
                    :items="copyDataTypesItems"
                    @itemClick="copyClick"
                    :disabled="!mData"
                    elevation="0"
                >
                    Copy All data
                </DropdownButton>
                <v-btn
                    @click="exportDataClick"
                    :loading="exportingData"
                    :disabled="!mData"
                    elevation="0"
                >
                    Export Data
                </v-btn>
                <v-btn
                    @click="importDataClick"
                    :loading="importingData"
                    elevation="0"
                >
                    Import Data
                </v-btn>
            </div>
            <br> <hr> <br>
            <template v-if="mData">
                <v-text-field v-for="item in mData" :key="item.name"
                    :label="item.name" :value="item.value"
                    readonly dense />
            </template>
            <template v-else>
                There are no data.
            </template>
        </Modal>
    </div>
</template>

<style lang="scss" scoped>
.micros-data-field{
    .wrapper{
        display: flex;
        flex-direction: row;
        justify-content: space-between;
        button{
            flex: 1;
            margin: 0 2px;
        }
    }
}
</style>