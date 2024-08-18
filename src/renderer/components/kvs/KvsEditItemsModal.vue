<template>
  <v-row justify="center">
    <v-dialog v-model="open" persistent max-width="800">
      <v-card>
        <v-card-title class="headline">
            {{ title }}
            <div style="text-align: right; flex: 1;">
                <div style="width: 200px;display: inline-block;">
                    <v-text-field v-model="searchText" outlined dense hide-details placeholder="Search" />
                </div>
            </div>
        </v-card-title>
        <v-card-text>
            {{ text }}
            <div v-if="loading" class="loading-container">
                <v-progress-circular indeterminate color="primary" ></v-progress-circular>
            </div>
            <div v-else class="items" ref="items">
                <div class="header">
                    <div>{{ keyLabel }}</div>
                    <template v-if="valueSubProps">
                        <div v-for="subProp in valueSubProps" :key="subProp.value">{{ subProp.label }}</div>
                    </template>
                    <div v-else>{{ valueLabel }}</div>
                    <v-btn style="opacity:0;pointer-events:none" title="Remove item" icon elevation="0" small>
                        <v-icon>mdi-trash-can</v-icon>
                    </v-btn>
                </div>
                <template v-if="sortedItems && sortedItems.length > 0">
                    <div class="item" v-for="(item, index) in sortedItems" :key="index">
                        <v-text-field v-model.trim="item.key" outlined dense hide-details :placeholder="keyLabel" />
                        <template v-if="valueSubProps">
                            <v-text-field
                                v-for="subProp in valueSubProps" :key="subProp.value"
                                v-model.trim="item.value[subProp.value]"
                                outlined dense hide-details
                                :placeholder="subProp.label"
                            />
                        </template>
                        <v-text-field v-else v-model.trim="item.value" outlined dense hide-details :placeholder="valueLabel" />
                        <v-btn @click="removeItem(index)" title="Remove item" icon elevation="0" small>
                            <v-icon>mdi-trash-can</v-icon>
                        </v-btn>
                    </div>
                </template>
                <div class="placeholder" v-else>This list is empty!</div>
            </div>
        </v-card-text>
        <v-card-actions>
          <v-btn @click="addItemClick" :disabled="inSearch" color="blue darken-1" text>
              <v-icon>mdi-plus</v-icon> Add Item
          </v-btn>
          <v-spacer></v-spacer>
          <v-btn color="grey" text @click="cancelClick">Cancel / Close</v-btn>
          <v-btn :loading="saving" :disabled="inSearch" color="blue darken-1" text @click="okClick">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
import { KvsService } from '../../services/kvs'

export default { 
    data:() => ({
        open: false,
        loading: false,
        saving: false,
        title: '',
        text: '',
        keyLabel: '',
        valueLabel: '',
        kvsGroup: '',
        valueSubProps: null,
        items: [],
        sort: '',
        searchText: '',
    }),
    computed: {
        sortedItems(){
            const items = this.displayedItems
            if(this.sort === 'key'){
                return items.sort((a, b) => a.key.localeCompare(b.key))
            }else{
                return items
            }
        },
        inSearch(){
            return  this.searchText.trim().length > 0
        },
        displayedItems(){
            const s = this.searchText.trim().toLowerCase()
            if(s.length > 0){
                const result = []
                for(let i = 0; i < this.items.length; i++){
                    const item = this.items[i]
                    const kTxt = item.key.toString().toLowerCase()
                    let vTxt = item.value
                    if(typeof vTxt === 'object') vTxt = JSON.stringify(vTxt)
                    vTxt = vTxt.toString().toLowerCase()
                    if(kTxt.includes(s) || vTxt.includes(s)){
                        result.push(item)
                    }
                }
                console.log(result)
                return result
            }else{
                return this.items
            }
        }
    },
    methods: {
        async okClick(){
            this.saving = true
            try {
                await this.saveItems()
                this.saving = false
                await alert('Values successfully saved.', 'Success!')
                this.open = false;
            } catch (error) {
                panic(error)
            }
            this.saving = false
        },
        cancelClick(){
            this.open = false;
        },
        removeItem(index){
            this.items.splice(index, 1)
        },
        addItemClick(){
            this.items.push({
                key: '',
                value: Array.isArray(this.valueSubProps) ? {} : ''
            })
            this.$nextTick(() => {
                const el = this.$refs.items
                el.scrollBy({
                    left: 0,
                    top: el.scrollHeight,
                    behavior: 'smooth'
                })
            })
        },
        handleRequest(options){
            if(typeof options != 'object' || typeof options.kvsGroup != 'string')
                throw new Error('Invalid options input')

            const o = options
            this.title = o.title || 'KVS'
            this.text = o.text || ''
            this.keyLabel = o.keyLabel || 'Key'
            this.valueLabel = o.valueLabel || 'Value'
            this.kvsGroup = o.kvsGroup
            this.valueSubProps = o.valueSubProps || null
            this.loading = true
            this.open = true
            this.sort = o.sort
            this.loadItems().then(() => this.loading = false)
        },
        async loadItems(){
            const items = await KvsService.GetAllGroupValues(this.kvsGroup)
            this.items = items
        },
        async saveItems(){
            const items = this.items.filter(item => (!!item.key && !!item.value))
            await KvsService.PutGroupValues(this.kvsGroup, items)
        }
    },

    created(){
        window.editKvsGroupValues = (options) => this.handleRequest(options);
        // if(window.DEV){
        //     setTimeout(() => this.handleRequest({ kvsGroup: 'sa2_instructions_tape' }), 4000)
        // }
    }
}
</script>

<style lang="scss" scoped>
.loading-container{
    height: calc(100vh - 300px);
    padding: 60px;
    text-align: center;
}
.items{
    height: calc(100vh - 300px);
    min-height: 50px;
    overflow-y: scroll;
    .item, .header{
        display: flex;
        flex-direction: row;
        div:first-child{
            flex: 2;
        }
        div:not(:first-child){
            flex: 3;
        }
        .v-btn{
            margin-top: 4px;
        }
    }
    .placeholder{
        padding: 2rem;
        text-align: center;
        font-style: italic;
        opacity: 0.6;
    }
}
</style>