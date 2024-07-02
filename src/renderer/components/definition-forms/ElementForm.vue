<template>
    <div class="element-form">
        <v-select label="Type" v-model="data.type" :items="typeOptions" />
        <v-divider style="margin-top:-10px;margin-bottom:20px"></v-divider>

        <template v-if="data.type == 'dropdown'">
            <HexNumberInput v-model="data.offset" label="Offset (In-Table Address)" dense />
            <div style="text-align:left">
                Dropdown items
                <v-btn @click="addDropdownItem" style="float:right" elevation="0" small>Add item</v-btn>
            </div>
            <div class="dropdown-items-table-wrapper" ref="dropdown-items-table-wrapper">
                <table class="full-width-table">
                    <tbody>
                        <tr class="dropdown-item" v-for="(item, index) in data.dropdownItems" :key="index">
                            <td>
                                <v-text-field v-model="item.text" label="Text" dense />
                            </td>
                            <td>
                                <HexBytesInput v-model="item.value" label="Value (Hex)" dense />
                            </td>
                            <td>
                                <v-btn @click="removeDropdownItem(item)" title="Remove item" icon small> <v-icon>mdi-close</v-icon> </v-btn>
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>
        </template>

        <template v-else-if="data.type == 'fixed_address_button'">
            <table class="full-width-table">
                <tbody>
                    <tr>
                        <td>
                            <v-text-field v-model="data.stateText1" label="Initial Button Text" dense />
                        </td>
                        <td>
                            <v-text-field v-model="data.stateText2" label="Final Button Text" dense />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <HexNumberInput v-model="data.offset" label="Offset (In-Table Address)" dense />
                        </td>
                        <td>
                            <HexBytesInput v-model="data.replacementValue" label="Replacement Value" dense />
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>

        <template v-else-if="data.type == 'search_replace_button'">
            <table class="full-width-table">
                <tbody>
                    <tr>
                        <td>
                            <v-text-field v-model="data.stateText1" label="Initial Button Text" dense />
                        </td>
                        <td>
                            <HexBytesInput v-model="data.searchValue" label="Search Value" dense />
                        </td>
                    </tr>
                    <tr>
                        <td>
                            <v-text-field v-model="data.stateText2" label="Final Button Text" dense />
                        </td>
                        <td>
                            <HexBytesInput v-model="data.replacementValue" label="Replacement Value" dense />
                        </td>
                    </tr>
                </tbody>
            </table>
        </template>

    </div>
</template>

<script>
import HexNumberInput from '../templates/HexNumberInput.vue'
import HexBytesInput from '../templates/HexBytesInput.vue'

export default {
    components: {
        HexNumberInput,
        HexBytesInput
    },
    props: {
        data: {
            type: Object,
            required: true
        },
        isNew: {
            type: Boolean,
            required: true
        }
    },
    data: () => ({
        typeOptions: [
            { text: 'Dropdown', value: 'dropdown' },
            { text: 'Fixed Address Button', value: 'fixed_address_button' },
            { text: 'Search & Replace Button', value: 'search_replace_button' },
        ]
    }),
    methods: {
        addDropdownItem(){
            this.data.dropdownItems.push({ text: '', value: [] })
            const twEl = this.$refs['dropdown-items-table-wrapper']
            setTimeout(() => twEl.scrollTo({
                    top: twEl.scrollHeight,
                    left: 0,
                    behavior: 'smooth'
                }), 100)
        },
        removeDropdownItem(item){
            const items = this.data.dropdownItems
            const index = items.findIndex(i => i === item)
            items.splice(index, 1)
        }
    }
}
</script>

<style lang="scss" scoped>
.element-form{
    .dropdown-items-table-wrapper{
        width: 100%;
        height: 200px;
        overflow-x: hidden;
        overflow-y: scroll;
        padding-top: 5px;
    }
    .full-width-table{
        width: 100%;
    }
}
</style>