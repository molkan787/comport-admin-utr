<template>
    <div class="table-form">
        <v-tabs v-model="tab">
            <v-tabs-slider color="blue"></v-tabs-slider>
            <v-tab key="base">Base</v-tab>
            <v-tab key="xaxis">Columns</v-tab>
            <v-tab key="yaxis">Rows</v-tab>
            <v-tab key="elements">Elements</v-tab>
        </v-tabs>
        <br>
        <v-tabs-items v-model="tab">
            <v-tab-item key="base">
                <BaseForm :data="data" />
            </v-tab-item>
            <v-tab-item key="xaxis">
                <AxisForm :table="data" axisName="axisX" axisTitle="Columns" countProp="columnsCount" />
            </v-tab-item>
            <v-tab-item key="yaxis">
                <AxisForm :table="data" axisName="axisY" axisTitle="Rows" countProp="rowsCount" />
            </v-tab-item>
            <v-tab-item key="elements">
                <ElementsList :data="data" />
            </v-tab-item>
        </v-tabs-items>
    </div>
</template>

<script>
import BaseForm from './BaseForm.vue'
import AxisForm from './AxisForm.vue'
import ElementsList from './ElementsList.vue'

export default {
    components: {
        BaseForm,
        AxisForm,
        ElementsList
    },
    props: {
        data: {
            type: Object,
            required: true
        }
    },
    data: () => ({
        tab: 0
    }),
    created(){
        if(devFunc == 'table_form') // dev only
            this.tab = 3
    }
}
</script>

<style lang="scss">
.table-form{
    margin-top: -16px;
    .container{
        padding: 12px 0 0 0 !important;
    }
    .v-input--checkbox{
        margin-top: 0 !important;
    }
}
</style>