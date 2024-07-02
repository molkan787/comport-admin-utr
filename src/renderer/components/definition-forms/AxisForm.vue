<template>
    <div class="axis-form">
        <v-form>
            <v-row dense>
                <v-col cols="12" sm="6">
                    <v-checkbox :label="`Enabled ${axisTitle}`" v-model="useAxis" />
                </v-col>
                <v-col cols="12" sm="6">
                    <v-text-field v-if="useAxis" label="Axis Name" v-model="data.name" dense />
                </v-col>
            </v-row>
            <v-container v-if="useAxis">
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <v-text-field :label="`Number of ${axisTitle}`" v-model.number="count" dense />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field label="Axis Unit" v-model="data.unit" dense />
                    </v-col>
                </v-row>
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <HexNumberInput label="Address" v-model="data.address" dense />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-select label="Data size" v-model="data.dataSize" :items="dataSizeOptions" dense />
                    </v-col>
                </v-row>
                
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <v-checkbox label="LSB First" v-model="data.lsbFirst" />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-checkbox label="Signed" v-model="data.signed" />
                    </v-col>
                </v-row>
                
                <v-row dense>
                    <v-col cols="12" sm="6">
                        <v-text-field label="Formula (Math expression)" v-model="data.formula" dense />
                    </v-col>
                    <v-col cols="12" sm="6">
                        <v-text-field label="Decimal places" v-model.number="data.decimalPlaces" type="number" min="0" max="12" dense />
                    </v-col>
                </v-row>
            </v-container>
        </v-form>
    </div>
</template>

<script>
import { deepClone } from '../../utils'

export default {
    props: {
        table: {
            type: Object,
            required: true
        },
        axisName: {
            type: String,
            required: true
        },
        axisTitle: {
            type: String,
            required: true
        },
        countProp: {
            type: String,
            required: true
        }
    },
    watch: {
        table: {
            immediate: true,
            deep: false,
            handler(table){
                const axisData = table[this.axisName]
                this.useAxis = !!axisData
                this.data = axisData ? axisData : {}
                this.count = axisData ? table[this.countProp] : 1
            }
        },
        useAxis(useIt){
            this.table[this.axisName] = useIt ? this.data : null
            this.updateCountValue()
        },
        count(){
            this.updateCountValue()
        }
    },
    data: () => ({
        useAxis: false,
        data: {},
        count: 0,
        dataSizeOptions: [
            { text: '1 Byte', value: 1 },
            { text: '2 Bytes', value: 2 },
            { text: '4 Bytes', value: 4 },
        ],
    }),
    methods: {
        updateCountValue(){
            this.table[this.countProp] = this.useAxis ? this.count : 1
        }
    }
}
</script>