<template>
    <div class="entity-form-field" :class="field.attributes || null">
        <template v-if="field.type === 'separator'">
            <hr>
        </template>
        <template v-else-if="field.type === 'display'">
            <v-text-field
                :value="getDisplayValue(field)"
                :label="field.label"
                hide-details
                disabled
            ></v-text-field>
        </template>
        <template v-else-if="field.type === 'component'">
            <component :is="field.component" :data="data" :isNew="isNew" :payload="payload" :viewOnly="viewOnly" v-bind="field.props || {}" />
        </template>
        <template v-else-if="field.type === 'select'">
            <v-autocomplete
                v-model="data[field.value]"
                :label="field.label"
                :items="getFieldOptions(field)"
                :readonly="viewOnly"
                :item-text="field.textProp || undefined"
                :item-value="field.valueProp || undefined"
                :clearable="field.clearable"
                hide-details
            ></v-autocomplete>
        </template>
        <template v-else-if="field.type === 'checkbox'">
            <v-checkbox
                v-model="data[field.value]"
                :label="field.label"
                :true-value="field.trueValue"
                :false-value="field.falseValue"
                :readonly="viewOnly"
                hide-details
            ></v-checkbox>
        </template>
        <template v-else-if="field.type === 'textarea'">
            <v-textarea
                :label="field.label"
                v-model="data[field.value]"
                :type="field.type"
                :readonly="viewOnly"
                rows="1"
            />
        </template>
        <template v-else-if="field.type === 'button'">
            <v-btn @click="field.onClick(data, isNew, field)" elevation="0">
                {{ field.label }}
            </v-btn>
        </template>
        <template v-else-if="field.type === 'number'">
            <v-text-field
                v-model.number="data[field.value]"
                @input="valueChange"
                :label="field.label"
                :readonly="field.readonly || viewOnly"
                :loading="field.loading || false"
                hide-details
                :append-icon="field.appendButton ? field.appendButton.icon : undefined"
                @click:append="field.appendButton ? field.appendButton.onClick(data, isNew, field) : undefined"
            ></v-text-field>
        </template>
        <template v-else>
            <v-text-field
                v-model.trim="data[field.value]"
                @input="valueChange"
                :label="field.label"
                :readonly="field.readonly || viewOnly"
                :loading="field.loading || false"
                hide-details
                :append-icon="field.appendButton ? field.appendButton.icon : undefined"
                @click:append="field.appendButton ? field.appendButton.onClick(data, isNew, field) : undefined"
            ></v-text-field>
        </template>
    </div>
</template>

<script>
export default {
    props: {
        field: {
            type: Object,
            required: true
        },
        data: {
            type: Object,
            required: true
        },
        isNew: {
            type: Boolean,
            required: true
        },
        payload: {
            type: Object,
            required: false
        },
        viewOnly: {
            type: Boolean,
            required: true
        }
    },
    methods: {
        valueChange(){
            const { valuePipe } = this.field
            if(typeof valuePipe == 'function'){
                const current = this.data[this.field.value]
                this.data[this.field.value] = valuePipe({
                    field: this.field,
                    data: this.data,
                    isNew: this.isNew,
                    payload: this.payload,
                    currentValue: current
                })
            }
        },
        getDisplayValue(field){
            const rawValue = this.data[field.value]
            if(field.filter)
                return this.$options.filters[field.filter](rawValue) || '--'
            else
                return rawValue || '--'
        },
        getFieldOptions(field){
            const options = this.getFieldOptionsGeneral(field)
            const rawValue = this.data[field.value]
            if(!!rawValue){
                const containsCurrent = options.findIndex(item => item === rawValue) >= 0
                if(!containsCurrent){
                    options.push(rawValue)
                }
            }
            return options
        },
        getFieldOptionsGeneral(field){
            const { options } = field
            if(Array.isArray(options)){
                return options
            }else if(typeof options === 'function'){
                return options(field, this.data, this.isNew, this.payload)
            }else{
                return []
            }
        }
    }
}
</script>

<style lang="scss">
.entity-form-field{
    &.uppercase {
        input, textarea{
            text-transform: uppercase;
        }
    }
}
</style>