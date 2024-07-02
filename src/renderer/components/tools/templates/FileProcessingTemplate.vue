<script>
import { promptFile, promptSaveFile } from '../../../utils'

export default {
    props: {
        options: {
            type: Object
        }
    },
    data: () => ({
        aip: null,
        inFile: '',
        outFile: '',
        extraData: {}
    }),
    computed: {
        actions(){
            return this.options.actions
        }
    },
    methods: {
        async selectFileClick(dir){
            const fln = await (dir == 'in' ? promptFile : promptSaveFile)()
            if(!fln) return
            this[dir == 'in' ? 'inFile' : 'outFile'] = fln
        },
        async processClick(action){
            if(!this.validateForm()) return
            this.aip = action.name
            try {
                const handler = this.options[`on${action.name}`]
                await handler(this.inFile, this.outFile, this.extraData)
                alert(action.successMessage || `${action.label} completed!`)
            } catch (error) {
                console.error(error)
                alert('An error occurred,\n\n' + error.toString())
            }
            this.aip = null
        },
        validateForm(){
            // TODO: Add validate for extraFields values
            if(this.inFile.length == 0)
                alert('Please select an input file')
            else if(this.outFile.length == 0)
                alert('Please select an output file')
            else
                return true
            return false
        }
    }
}
</script>

<template>
    <div class="compression-template-tool-panel">
        <div class="file-input">
            <v-text-field :value="inFile" label="Input File" readonly dense />
            <v-btn @click="selectFileClick('in')">Select</v-btn>
        </div>
        <div class="file-input">
            <v-text-field :value="outFile" label="Output File" readonly dense />
            <v-btn @click="selectFileClick('out')">Select</v-btn>
        </div>
        <template v-if="options.extraFields">
            <div v-for="field in options.extraFields" :key="field.value" class="file-input">
                <v-text-field
                    v-model="extraData[field.value]"
                    :label="field.label"
                    :type="field.type || 'text'"
                    dense
                />
            </div>
        </template>
        <v-btn
            v-for="action in actions" :key="action.name"
            @click="processClick(action)"
            :loading="aip == action.name"
            :disabled="!!aip && aip != action.name"
        >
            {{ action.label }}
        </v-btn>
    </div>
</template>

<style lang="scss" scoped>
.compression-template-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>