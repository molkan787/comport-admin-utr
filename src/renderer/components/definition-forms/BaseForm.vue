<template>
    <v-form>
        <v-container>
            <v-row dense>
                <v-col cols="12" sm="6">
                    <HexNumberInput label="Base Address" v-model="data.address" dense />
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
            
            <v-row dense>
                <v-col cols="12" sm="6">
                    <v-text-field label="Low range" v-model.number="data.lowRange" type="number" dense />
                </v-col>
                <v-col cols="12" sm="6">
                    <v-text-field label="High range" v-model.number="data.highRange" type="number" dense />
                </v-col>
            </v-row>

            <v-row dense>
                <v-col cols="12" sm="6">
                    <v-select label="Major order" v-model="data.majorOrder" :items="majorOrderOptions" dense />
                </v-col>
                <v-col cols="12" sm="6">
                    <v-text-field label="Base Unit" v-model="data.unit" dense />
                </v-col>
            </v-row>

        </v-container>
    </v-form>
</template>

<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        dataSizeOptions: [
            { text: '1 Byte', value: 1 },
            { text: '2 Bytes', value: 2 },
            { text: '4 Bytes', value: 4 },
        ],
        majorOrderOptions: [
            { text: 'Rows', value: 1 },
            { text: 'Columns', value: 0 }
        ]
    })
}
</script>