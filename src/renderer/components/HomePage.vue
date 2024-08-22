<script>
import CustomersTable from './datatables/CustomersTable.vue'
import ShopsTable from './datatables/ShopsTable.vue'
import TunerUsersTable from './datatables/TunerUsersTable.vue'
import FoldersTable from './datatables/FoldersTable.vue'
import DefinitionsTable from './datatables/DefinitionsTable.vue'
import ToolsPanel from './tools/ToolsPanel.vue'
import OtherTab from './OtherTab.vue'
import FileDatabaseTable from './datatables/FileDatabaseTable.vue'
import DynoDatabaseTable from './datatables/DynoDatabaseTable.vue'
import DynoShopsTable from './datatables/DynoShopsTable.vue'
import ExceptionsTable from './datatables/ExceptionsTable.vue'
import RemoteObdSnifferTable from './remote-obd-sniffer/RemoteObdSnifferTable.vue'
import MenuItem from './divert/MenuItem.vue'
import { mapState } from 'vuex'

export default {
    components: {
        MenuItem
    },
    data: () => ({
        currentKey: 'customers',
        items: [
            { key: 'customers', component: CustomersTable, icon: 'mdi-account-circle' },
            { key: 'databases', component: FoldersTable, title: 'Flash Database', icon: 'mdi-database' },
            { key: 'shops', component: ShopsTable, icon: 'mdi-store' },
            { key: 'tuners', component: TunerUsersTable, icon: 'mdi-account-box' },
            { key: 'definitions', component: DefinitionsTable, icon: 'mdi-map' },
            { key: 'filedatabase', component: FileDatabaseTable, title: 'File Database', icon: 'mdi-text-box' },
            {
                key: 'dynodb',
                title: 'Dyno Database',
                icon: 'mdi-speedometer',
                childs: [
                    { key: 'dynodb-cars', title: 'Cars', component: DynoDatabaseTable, icon: 'mdi-car' },
                    { key: 'dynodb-shops', title: 'Shops', component: DynoShopsTable, icon: 'mdi-store' },
                ]
            },
            { key: 'tools', component: ToolsPanel, icon: 'mdi-gavel' },
            { key: 'other', component: OtherTab, icon: 'mdi-view-dashboard' },
            { key: 'exceptions', component: ExceptionsTable, icon: 'mdi-alert-circle-outline' },
            { key: 'obd-recordings', title: 'OBD Recordings', component: RemoteObdSnifferTable, icon: 'mdi-cable-data' },
        ],
        allItems: [],
        mappedItems: {},
        searchInput: ''
    }),
    computed: {
        ...mapState(['ui']),
        currentPageVM(){
            const ref = this.$refs[this.currentKey];
            return (Array.isArray(ref) ? ref[0] : ref) || null;
        },
        currentRefreshHandler(){
            const vm = this.currentPageVM;
            return (vm && vm.refresh) || null
        },
        tab(){
            return this.allItems.findIndex(item => item.key === this.currentKey)
        }
    },
    watch: {
        tab(){
            this.tabChange()
            setTimeout(() => {
                this.updateRefreshButton()
                this.refreshCurrentTab()
            }, 10)
        }
    },
    methods: {
        tabChange(){
            this.searchInput = ''
        },
        onNavigateRequest(key, searchInput){
            if(typeof key == 'number'){
                key = this.allItems[tab].key
            }
            this.currentKey = key
            if(searchInput){
                this.$nextTick(() => this.searchInput = searchInput)
            }
        },
        async refreshCurrentTab(){
            const refresh = this.currentRefreshHandler
            if(typeof refresh === 'function'){
                await refresh();
            }
        },
        updateRefreshButton(){
            this.ui.showRefreshButton = !!this.currentRefreshHandler
        }
    },
    mounted(){
        const getItems = (item) => {
            if(Array.isArray(item.childs)){
                return [].concat.apply([], item.childs.map(c => getItems(c)))
            }else{
                return [item]
            }
        }
        const allItems = [].concat.apply([], this.items.map(getItems))
        const map = this.mappedItems
        allItems.forEach(item => map[item.key] = item)
        this.allItems = allItems
        setTimeout(() => this.updateRefreshButton(), 200)
        
        // ---- dev only ----
        if(typeof window.navigateTo == 'string'){
            this.onNavigateRequest(window.navigateTo);
        }else if(typeof window.devPage === 'string'){
            const page = this.allItems.find(item => item.key === window.devPage)
            if(page){
                this.onNavigateRequest(window.devPage)
                return
            }
        }

        const { devFunc } = window
        if(typeof devFunc === 'string'){
            if(window.devFunc === 'ros')
                this.onNavigateRequest('obd-recordings')
            else if(window.devFunc === 'exception')
                this.onNavigateRequest('exceptions')
        }
        // ------------------
    }
};
</script>

<template>
  <v-card class="elevation-0">

    <div class="layout">
        <div class="navigation-wrapper">
            <v-navigation-drawer class="dark-gray" dark permanent >
                <template v-slot:prepend>
                    <div class="pa-2">
                        <v-text-field
                            v-model="searchInput"
                            clearable
                            dense outlined hide-details
                            style="margin: 0;width:100%"
                            placeholder="Search current tab"
                        />
                    </div>
                </template>
                <v-list>
                    <template v-for="item in items">
                        <v-list-group v-if="item.childs" :value="false" :prepend-icon="item.icon" :key="item.key">
                            <template v-slot:activator>
                                <v-list-item-title>{{ (item.title || item.key).toUpperCase() }}</v-list-item-title>
                            </template>
                            <MenuItem
                                v-for="child in item.childs"
                                :key="child.key"
                                :active="child.key === currentKey"
                                :item="child"
                                @click="currentKey = child.key" 
                            />
                        </v-list-group>
                        <MenuItem
                            v-else
                            :key="item.key" 
                            :active="item.key === currentKey"
                            :item="item"
                            @click="currentKey = item.key" 
                        />
                    </template>
                </v-list>
            </v-navigation-drawer>
        </div>
        <div class="content-wrapper">
            <v-tabs-items :value="tab" vertical>
                <v-tab-item v-for="(item) in allItems" :key="item.key">
                    <div class="tab-page">
                        <component :is="item.component" :ref="item.key" :activePage="item.key === currentKey" @navigateRequest="onNavigateRequest" :searchInput="searchInput" />
                    </div>
                </v-tab-item>
            </v-tabs-items>
        </div>
    </div>
    
  </v-card>
</template>

<style lang="scss" scoped>
.layout{
    display: flex;
    flex-direction: row;
    height: calc(100vh - 48px);
    .content-wrapper{
        flex: 1;
    }
}

.tab-page{
    height: calc(100vh - 48px);
    overflow-y: scroll;
}
</style>

<style lang="scss">
.navigation-wrapper .v-navigation-drawer{
    width: 220px !important;
}
.v-list-item--link {
    &.active{
        background: #ffffff1a;
        div, i{
            color: #419bff !important;
        }
    }
    * {
        cursor: pointer !important;
    }
    .v-list-item__icon {
        margin-right: 12px !important;
    }
}
.v-list-group {
    .v-list-item__title{
        font-size: .8125rem;
        font-weight: 500;
        line-height: 1rem;
    }
    .v-list-item__icon{
        margin-top: 8px;
        margin-bottom: 8px;
        margin-right: 12px !important;
    }
    .v-list-group__header .v-list-item__icon.v-list-group__header__append-icon{
        min-width: 20px !important;
    }
    .v-list-item {
        min-height: 40px;
        height: 40px;
    }
    .v-list-group__items{
        .v-list-item {
            padding-left: 3rem;
        }
    }
}
</style>