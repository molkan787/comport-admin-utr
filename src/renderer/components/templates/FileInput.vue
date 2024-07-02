<template>
<div class="file-input">
    <v-text-field :value="value" :label="label" readonly dense :placeholder="placeholder" :hide-details="hideDetails" />
    <v-btn @click="selectClick" v-if="!legacy && !allowClearOnly" title="Select file" icon >
        <v-icon>mdi-dots-horizontal-circle</v-icon>
    </v-btn>
    <v-btn v-if="!legacy && value" @click="removeClick" title="Clear" icon>
        <v-icon>mdi-delete-circle</v-icon>
    </v-btn>
    <v-btn v-if="legacy" @click="selectClick">Select</v-btn>
    <slot name="append"></slot>
</div>
</template>

<script>
import { promptFile, promptSaveFile, promptDirectory } from '../../utils'
const prompts = {
    'open': promptFile,
    'save': promptSaveFile,
    'folder': promptDirectory
}

export default {
    props: {
        type: { // 'open' | 'save' | 'folder'
            type: String,
            default: 'open'
        },
        label: {
            type: String,
            default: 'Attachement'
        },
        value: {
            type: String,
            default: null
        },
        allowClearOnly: {
            type: Boolean,
            default: false
        },
        legacy: {
            type: Boolean,
            default: false
        },
        hideDetails: {
            type: Boolean,
            default: false
        }
    },
    computed: {
        placeholder(){
            return this.type == 'folder' ? 'no directory selected' : 'no file selected'
        }
    },
    methods: {
        async selectClick(){
            const promptFn = prompts[this.type]
            const filename = await promptFn()
            if(!filename) return
            this.$emit('input', filename)
        },
        removeClick(){
            this.$emit('input', null)
            this.$emit('cleared')
        }
    }
}
</script>

<style lang="scss">
.file-input{
    display: flex;
    flex-direction: row;
    .v-text-field{
        flex: 1;
        margin-right: 8px;
    }
}
</style>
