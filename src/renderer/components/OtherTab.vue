<template>
    <div class="other-tab">
        <div class="items-wrapper">
            <v-btn v-for="(item, index) in items" :key="index" @click="item.open()"
                :loading="item.id && loadings[item.id]"
                elevation="0">
                {{ item.title }}
            </v-btn>
        </div>
    </div>
</template>

<script>
import { KvsService } from '../services/kvs'
export default {
    data(){
        return {
            loadings: {},
            items: [
                {
                    title: 'SA2 Instruction Tapes',
                    open: () => editKvsGroupValues({
                        title: 'SA2 Instruction Tapes',
                        keyLabel: 'Micro Name',
                        valueLabel: 'SA2 Instruction Tape',
                        kvsGroup: 'sa2_instructions_tape',
                    })
                },
                {
                    title: 'SwitchOver Values',
                    open: () => editKvsGroupValues({
                        title: 'SwitchOver Values',
                        keyLabel: 'Micro & Serial Number',
                        valueLabel: 'SwitchOver',
                        kvsGroup: 'switchover',
                    })
                },
                // {
                //     id: 'mg1-aes-config',
                //     title: 'MG1 AES Config',
                //     open: () => this.openMG1AesConfig()
                // }
                {
                    title: 'MG1 AES Config',
                    open: () => editKvsGroupValues({
                        title: 'MG1 AES Config',
                        keyLabel: 'Software Number',
                        kvsGroup: 'mg1_aes_config',
                        valueSubProps: [
                            { label: 'Key', value: 'key' },
                            { label: 'IV', value: 'iv' },
                        ]
                    })
                },
                {
                    title: 'Micros Credit Cost',
                    open: () => editKvsGroupValues({
                        title: 'Micros Credit Cost',
                        keyLabel: 'Micro Name',
                        valueLabel: 'Cost',
                        kvsGroup: 'micros_credit_costs',
                    })
                },
            ]
        }
    },
    methods: {
        async openMG1AesConfig(){
            this.$set(this.loadings, 'mg1-aes-config', true)
            try {
                const config = await KvsService.GetValue('keys', 'mg1-aes')
                editEntity({
                    template: {
                        fields: [
                            { label: 'Key', value: 'Key' },
                            { label: 'IV', value: 'IV' },
                        ]
                    },
                    name: 'MG1 AES Config',
                    data: config || {},
                    saveHandler: data => KvsService.SetValue('keys', 'mg1-aes', data),
                    hideDelete: true
                })
            } catch (error) {
                panic(error)
            }
            this.$set(this.loadings, 'mg1-aes-config', false)
        }
    }
}
</script>

<style lang="scss" scoped>
.other-tab{
    padding: 1rem;
    .items-wrapper{
        display: grid;
        grid-template-columns: repeat(3, calc((100% - 12px) / 3));
        grid-column-gap: 6px;
        grid-row-gap: 6px;
    }
}
</style>