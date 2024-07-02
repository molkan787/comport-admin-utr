<script>
import VirtualList from 'vue-virtual-scroll-list'
import DropdownButton from '../templates/DropdownButton.vue'
import UserLogsItem from './UserLogsItem.vue'
import { userlogsCacher } from './userlogsCache'
import { sleep } from '../../utils'


export default {
    components: {
        DropdownButton,
        VirtualList
    },
    props: {
        itemsLoader: {
            type: Function,
            required: true
        },
        loadItemsButtonText: {
            type: String,
            default: null
        }
    },
    computed: {
        displayItems(){
            const query = (this.searchText || '').toLowerCase().trim()
            if(query.length == 0) return this.logs
            const logs = this.logs
            const len = logs.length
            const result = [this.logs[0]]
            for(let i = 1; i < len; i++){
                const item = logs[i]
                let strData = userlogsCacher.GetItemStrContent(item.uid)
                if(typeof strData != 'string') strData = ''
                const d = strData.toLowerCase()
                if(d.includes(query)){
                    result.push(item)
                }
            }
            return result
        },
        inSearchMode(){
            return !!this.searchText
        }
    },
    watch: {
        customer(){
            this.customerChanged()
        },
        searchText(value){
            this.searchTextChanged(value)
        },
        loadItemsButtonText(val){
            this.store.loadItemsButtonText = val
        }
    },
    data: () => ({
        UserLogsItem,
        logs: [],
        searchText: '',
        loadOnScrollLock: false,
        expandAll: false,
        store: {},
        loadingAll: false
    }),
    methods: {
        async init(){
            await userlogsCacher.Init()
            console.log('Userlogs Viewer Panel Initilized')
        },
        async searchTextChanged(){
            this.$refs.itemsList.reset()
            if(!!this.searchText){
                this.$refs.itemsList.scrollToBottom()
            }
            this.store.clickableTime = this.inSearchMode
        },
        async loadAllLogs(){
            this.loadingAll = true
            try {
                while(true){
                    const loadedItems = await this.loadLogs()
                    if(!loadedItems) break
                    await sleep(30)
                }
            } catch (error) {
                panic(error)
            }
            this.loadingAll = false
        },
        async loadLogs(){
            let result = false
            this.store.loading = true
            try {
                const newItems = await this.itemsLoader()
                const firstLoad = this.logs.length === 1
                if(newItems && newItems.length > 0){
                    result = true
                    console.log(`Loaded ${newItems.length} new items, Total: ${this.logs.length + newItems.length}`)
                    const preparedItems = userlogsCacher.CacheItems(newItems).map(uid => ({ uid }))
                    const loadBtnItem = this.logs.shift()
                    this.logs = [loadBtnItem].concat(preparedItems, this.logs)
                    if(firstLoad){
                        this.$refs.itemsList.scrollToBottom()
                    }else{
                        this.$refs.itemsList.reset()
                        this.$refs.itemsList.scrollToIndex(preparedItems.length - 4)
                    }
                }else{
                    console.log(`No new items loaded, Total: ${this.logs.length + ((newItems && newItems.length) || 0)}`)
                    if(this.logs.length === 1){
                        alert('No userlogs found.')
                    }
                }
            } catch (error) {
                console.error(error)
                alert('An error occured while loading userlogs.\n\n' + error.toString())
            }
            this.store.loading = false
            return result
        },
        resetState(){
            this.logs = [{ uid: 'load-btn' }]
            this.createNewStore()
            this.$refs.itemsList && this.$refs.itemsList.reset()
        },
        scrolledToTop(){
            if(this.loadOnScrollLock) return
            this.loadOnScrollLock = true
            this.loadLogs().then(() => setTimeout(() => this.loadOnScrollLock = false, 100))
        },
        timeLabelClick(item){
            this.searchText = ''
            setTimeout(() => {
                const index = this.displayItems.findIndex(it => it.uid === item.uid)
                this.$refs.itemsList.scrollToIndex(index)
                this.store.seekAttentionItem = item.uid
            }, 100)
        },
        createNewStore(){
            this.store = {
                loading: false,
                expandedItems: {},
                expandAll: false,
                seekAttentionItem: null,
                clickableTime: false,
                timeLabelClick: (item, index) => this.timeLabelClick(item, index),
                loadLogs: () => this.loadLogs(),
                loadItemsButtonText: this.loadItemsButtonText,
                getItemData: uid => userlogsCacher.GetItem(uid)
            }
        }
    }
}
</script>

<template>
    <div class="userlogs-viewer-panel">
        <div class="cols-parent">
            <div class="content-col">
                <virtual-list v-if="displayItems && displayItems.length" style="height: 100%; overflow-y: auto;" tabindex="1"
                    ref="itemsList"
                    :data-key="'uid'"
                    :data-sources="displayItems"
                    :data-component="UserLogsItem"
                    :keeps="100"
                    :estimate-size="22"
                    :extra-props="{ store }"
                    @totop="scrolledToTop"
                />
            </div>
            <div class="controls-col">
                <v-text-field v-model="searchText" clearable label="Search logs" placeholder="search" hide-details style="flex:0" />
                <v-checkbox v-model="store.expandAll" label="Expand All Items" hide-details />
                <!-- <v-btn @click="loadAllLogs" :loading="loadingAll" elevation="0">Load all</v-btn> -->
                <hr>
                <slot name="controls" />
            </div>
        </div>
    </div>
</template>

<style lang="scss" scoped>
.userlogs-viewer-panel{
    height: 100%;
}
.cols-parent{
    display: flex;
    flex-direction: row;
    height: 100%;
    .content-col{
        flex: 1;
        display: flex;
        flex-direction: column;
        max-width: calc(100vw - 320px);
    }
    .controls-col{
        display: flex;
        flex-direction: column;
        padding: 4px;
        & > *{
            margin-bottom: 4px;
        }
    }
}
hr{
    border-bottom: none;
    background: #d6d6d6;
}
</style>
