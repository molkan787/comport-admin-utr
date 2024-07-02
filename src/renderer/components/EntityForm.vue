<template>
    <div class="entity-form">
        <template v-for="field in template.fields" >
            <template v-if="isFieldVisible(field, data)">
                <div v-if="field.type == 'grid-group'" :key="field.name" :style="getGridStyle(field)" class="grid-group">
                    <EntityFormField v-for="fld in field.fields" :key="fld.name" :viewOnly="viewOnly"
                        :field="fld" :data="getGroupFieldData(field, data)" :isNew="isNew" :payload="payload"/>
                </div>
                <EntityFormField v-else :key="field.name" :viewOnly="viewOnly"
                    :field="field" :data="getGroupFieldData(field, data)" :isNew="isNew" :payload="payload"/>
            </template>
        </template>
    </div>
</template>

<script>
import EntityFormField from './EntityFormField.vue'

export default {
    components: {
        EntityFormField
    },
    props: {
        template: {
            type: Object,
            required: true
        },
        data: {
            type: Object,
            required: true
        },
        payload: {},
        isNew: {
            type: Boolean,
            default: false
        },
        viewOnly: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        getGroupFieldData(field, data){
            const { subdataProp } = field
            if(typeof subdataProp == 'string'){
                let subdata = data[subdataProp]
                if(typeof subdata == 'undefined' || subdata === null){
                    subdata = {}
                    this.$set(data, subdataProp, subdata)
                }
                return subdata
            }else{
                return data
            }
        },
        getGridStyle(field){
            const { cols: _cols, rows: _rows } = field.grid || {}
            const cols = _cols || 2;
            const rows = _rows || 2;
            const colPerc = (100 / cols).toFixed(2);
            return {
                'grid-template-columns': `repeat(${cols}, ${colPerc}%)`,
                // 'grid-template-rows': `repeat()`
            }
        },
        isFieldVisible(field, data){
            if(typeof field.condition == 'function'){
                return field.condition(data, field)
            }else{
                return true
            }
        }
    }
}
</script>

<style lang="scss" scoped>
.entity-form{
    & > div{
        margin-bottom: 8px;
    }
    .grid-group{
        display: grid;
        width: 100%;
        grid-column-gap: 5px;
    }
}
</style>
<style lang="scss">
.entity-form{
    hr{
        border: none;
        background-color: #cacaca;
        height: 2px;
        margin: 12px 0;
        border-radius: 6px;
    }
}
</style>

<style lang="scss">
.v-input--is-disabled .v-label {
    color: rgba(0, 0, 0, 0.54) !important;
}
.v-input--is-disabled {
    user-select: text !important;
    pointer-events: all !important;
}
.theme--light.v-input input {
    color: rgba(0, 0, 0, 0.74) !important;
}
</style>