<script>
import UserLogsItemUdsData from './UserLogsItemUdsData.vue'
import UserLogsItemApiCallData from './UserLogsItemApiCallData.vue'
import UserLogsItemDataLogData from './UserLogsItemDataLogData.vue'
import { sleep } from '../../utils'

export default {
    components: {
        UserLogsItemUdsData,
        UserLogsItemApiCallData,
        UserLogsItemDataLogData
    },
    props: {
        source: {
            type: Object,
            required: true
        },
        index: {
            type: Number,
            required: true
        },
        store: {
            type: Object,
            required: true
        }
    },
    watch: {
        'store.seekAttentionItem': {
            immediate: true,
            handler(newVal, oldVal){
                if(newVal === this.item.uid && newVal !== oldVal){
                    this.seekAttention()
                }
            }
        },
        source: {
            immediate: true,
            handler(){
                this.loadItemData()
            }
        }
    },
    computed: {
        clickableTime() { return this.store.clickableTime }
    },
    filters: {
        itemTime(item){
            let date = new Date(item.time)
            if(isNaN(date.getTime())) date = new Date()
            return date.toLocaleString()
        }
    },
    data: () => ({
        item: {},
        attention: false
    }),
    methods: {
        loadItemData(){
            const { uid } = this.source
            if(uid == 'load-btn') return
            this.item = this.store.getItemData(uid)
        },
        timeLabelClick(){
            if(this.clickableTime){
                this.store.timeLabelClick(this.item, this.index)
            }
        },
        async seekAttention(){
            this.attention = true
            await sleep(300)
            this.attention = false
            await sleep(300)
            this.attention = true
            await sleep(300)
            this.attention = false
        }
    }
}
</script>

<template>
<div v-if="index === 0" class="userlogs-modal-control-item">
    <v-btn :loading="store.loading" @click="store.loadLogs()" elevation="0">
        {{ store.loadItemsButtonText || 'Load more items' }}
    </v-btn>
</div>
<div v-else class="logs-item" :class="item.classes + (attention ? ' attention' : '')">
    <span class="item-time" :class="{ clickable: clickableTime }" @click="timeLabelClick">[{{ item | itemTime }}]</span>
    <UserLogsItemUdsData v-if="item.IsUdsMessage" :item="item" :store="store" />
    <UserLogsItemApiCallData v-else-if="item.logType === 4" :item="item" :store="store" />
    <UserLogsItemDataLogData v-else-if="item.logType === 5" :item="item" :store="store" />
    <span v-else-if="item.logType === 6">Function Call: <b>{{ item.data.FullName }}()</b></span>
    <span v-else-if="item.logType === 7">Function Call End: <b>{{ item.data.FullName }}()</b></span>
    <span v-else-if="item.IsError" class="data" v-html="item.data" ></span>
    <span v-else class="data" >{{ item.data }}</span>
</div>
</template>

<style lang="scss" scoped>
.logs-item{
    font-family: monospace;
    color: #252525;
    user-select: text;
    transition: opacity 0.3s;
    &.exception{
        .data{
            white-space: pre-wrap;
            user-select: text;
            b{
                user-select: text;
            }
        }
    }
    &.attention{
        opacity: 0.3;
    }
    .item-time{
        text-decoration: underline;
        &.clickable{
            cursor: pointer;
        }
    }
    &.logtype-2, &.danger{
        color: rgb(233, 36, 15);
        background-color: #fcebe9;
    }
    &.logtype-3{
        font-weight: bold;
        background-color: #dcc7b5;
    }
    &.logtype-4{
        background-color: #c3d7ff;
    }
    &.logtype-5{
        background-color: #ddfffe;
    }
    &.logtype-6, &.logtype-7{
        background-color: #e3d1ff;
    }
    &.less-important{
        opacity: 0.5;
    }
    &.ui-console-log{
        background-color: #e2e2e2;
    }
    &.uds-message{
        &.rx{
            background-color: #e3f9e3;
        }
        &.tx{
            background-color: #d9f5fd;
        }
    }
    * {
        user-select: text;
    }
}
.userlogs-modal-control-item{
    display: flex;
    flex-direction: row;
    justify-content: center;
    padding: 15px;
}
</style>