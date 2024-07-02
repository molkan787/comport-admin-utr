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
        }
    }
}
</script>

<template>
    <div class="userlogs-item-apicall-data">
        <span class="method">{{ d.Method }}</span>
        <span class="url">{{ d.Url }}</span>
        <a class="show-more-btn" @click="showMore = !showMore">{{ expanded ? 'Show less' : 'Show more' }}</a>
        <div class="request-data" v-if="expanded">
            <h5>Request</h5>
            <json-viewer :value="d.RequestBody" :expand-depth=1 copyable sort />
            <hr>
            <h5>Response</h5>
            <json-viewer :value="d.ResponseBody" :expand-depth=1 copyable sort />
        </div>
    </div>
</template>

<style lang="scss" scoped>
.userlogs-item-apicall-data{
    display: inline;
    .method{
        font-weight: bold;
    }
    .url{
        text-decoration: underline;
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
    .request-data{
        padding: 6px;
    }
}
</style>

<style lang="scss">
.userlogs-item-apicall-data{
    .jv-container{
        background-color: transparent !important;
        .jv-code{
            padding: 3px !important;
        }
    }
}
</style>