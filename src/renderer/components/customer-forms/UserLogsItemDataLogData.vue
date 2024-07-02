<script>
import JsonViewer from 'vue-json-viewer'

export default {
    components: {
        JsonViewer
    },
    props: {
        item: {
            type: Object,
            required: true
        },
        store: {
            type: Object,
            required: true
        },
    },
    computed: {
        d(){
            return this.item.data
        },
        showMore: {
            get() { return this.store.expandedItems[this.item.uid] },
            set(value) { this.$set(this.store.expandedItems, this.item.uid, value) }
        },
        expanded(){
            return this.store.expandAll || this.showMore
        },
        dataEntries(){
            return Object.entries(this.item.data.Data)
        }
    },
    filters: {
        dataName(n){
            if(n === 'system-info') return 'System Info'
            else return n
        }
    }
}
</script>

<template>
    <div class="userlogs-item-datalog-data">
        <span class="data-name">{{ d.DataName | dataName }}</span>
        <span class="data-overview" v-if="d.DataName === 'system-info'">(AppVersion: {{d.Data.AppVersion}})</span>
        <a class="show-more-btn" @click="showMore = !showMore">{{ expanded ? 'Show less' : 'Show more' }}</a>
        <div class="data-value" v-if="expanded">
            <json-viewer :value="d.Data" :expand-depth=1 copyable sort />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.userlogs-item-datalog-data{
    display: inline;
    .data-name{
        font-weight: bold;
    }
    .show-more-btn{
        user-select: none;
        text-decoration: underline;
        cursor: pointer;
        color: rgb(19, 19, 252);
        &:active{
            color: rgb(114, 0, 236);
        }
    }
    .data-value{
        &:not(.inline){
            padding: 6px;
        }
        &.inline{
            display: inline;
        }
    }
}
</style>

<style lang="scss">
.userlogs-item-datalog-data{
    .jv-container{
        background-color: transparent !important;
        .jv-code{
            padding: 3px !important;
        }
    }
}
</style>