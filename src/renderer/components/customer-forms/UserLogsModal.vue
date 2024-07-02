<script>
import Modal from '../templates/Modal.vue'
import UserLogsService from '../../services/userlogs'
import { cloneArray, promptSaveFile, writeFile } from '../../utils'
import { VirtualecuConfigGenerator } from '../../modules/virtualecu/VirtualecuConfigGenerator'
import DropdownButton from '../templates/DropdownButton.vue'
import UserLogsViewerPanel from './UserLogsViewerPanel.vue'
import { userlogsCacher } from './userlogsCache'

export default {
    components: {
        Modal,
        DropdownButton,
        UserLogsViewerPanel
    },
    props: {
        open: {
            type: Boolean,
            required: true
        },
        customer: {
            required: true
        }
    },
    computed: {
        title(){
            const email = (this.customer || {}).email || '---'
            return `UserLogs (${email})`
        },
        genVeConfOptions(){
            const selectedDaysOpt = this.daysCountOptions.find(o => o.value === this.downloadLogsDaysCount)
            return [
                { text: 'From: Currently loaded logs', value: 'current' },
                { text: 'From: ' + selectedDaysOpt.text, value: 'selectedDays' }
            ]
        }
    },
    watch: {
        customer(){
            this.$nextTick(() => this.customerChanged())
        },
        open(isOpen){
            if(isOpen){
                this.searchText = ''
            }
        },

    },
    data: () => ({
        lastItemKey: null,
        downloading: false,
        downloadLogsDaysCount: 2,
        daysCountOptions: [
            { value: 2, text: 'Last 2 days' },
            { value: 4, text: 'Last 4 days' },
            { value: 7, text: 'Last 7 days' },
            { value: 14, text: 'Last 2 weeks' },
            { value: 21, text: 'Last 3 weeks' },
            { value: 28, text: 'Last 4 weeks' },
            { value: Infinity, text: 'All' },
        ],
        generatingVirtualEcuConfig: false,
        logsLoaderWrapper: null,
        clearing: false,
    }),
    methods: {
        async clearLogs(){
            try {
                if(!(await confirm('Clear permanently logs of this user?'))) return
                this.clearing = true
                await UserLogsService.ClearLogs(this.customer._id.toString())
                this.$emit('closeRequest')
            } catch (error) {
                panic(error)
            }
            this.clearing = false
        },
        async downloadLogs(){
            try {
                const filename = await promptSaveFile()
                if(!filename) return
                this.downloading = true
                let startDate = new Date()
                if(this.downloadLogsDaysCount === Infinity){
                    startDate = new Date('1990-01-01') // putting a very old date to grab all the logs
                }else{
                    startDate.setDate(startDate.getDate() - this.downloadLogsDaysCount)
                }
                await UserLogsService.DownloadLogsDateRange(this.customer._id, startDate, filename)
                alert('User logs successfully downloaded', 'Success!')
            } catch (error) {
                panic(error)
            }
            this.downloading = false
        },
        async logsLoader(){
            const data = await UserLogsService.GetRawLogs(this.customer._id, 2, this.lastItemKey || undefined)
            if(data.items && data.items.length > 0){
                this.lastItemKey = data.lastGroupKey
                return data.items.reverse()
            }
            return null
        },
        async customerChanged(){
            this.lastItemKey = null
            this.$refs.viewer.resetState()
            if(this.customer){
                await this.$refs.viewer.init()
                this.$refs.viewer.loadLogs()
            }
        },
        async generateVirtualecuConfig(source){
            this.generatingVirtualEcuConfig = true
            try {
                const filename = await promptSaveFile({ filters: [{ name: 'C#', extensions: '.cs' }] })
                if(!filename){
                    this.generatingVirtualEcuConfig = false
                    return
                }
                let items = []
                if(source === 'current'){
                    items = this.getUserlogsItems()
                }else if(source === 'selectedDays'){
                    const startDate = new Date()
                    startDate.setDate(startDate.getDate() - this.downloadLogsDaysCount)
                    const result = await UserLogsService.GetLogsDateRange(this.customer._id,  startDate)
                    items = result.items.reverse()
                }
                const strConfig = VirtualecuConfigGenerator.GenerateFromUserLogs(items)
                await writeFile(filename, strConfig)
            } catch (error) {
                panic(error)
            }
            this.generatingVirtualEcuConfig = false
        },
        getUserlogsItems(){
            const refs = this.$refs.viewer.logs
            const len = refs.length
            const items = new Array(len - 1)
            for(let i = 1; i < len; i++){
                items[i - 1] = userlogsCacher.GetItem(refs[i].uid)
            }
            return items
        }
    },
    created(){
        this.logsLoaderWrapper = () => this.logsLoader()
    }
}
</script>

<template>
    <div class="userlogs-modal">
        <Modal
            :open="open"
            @okClick="$emit('closeRequest')"
            :okButtonText="'Close'"
            :cancelButtonText="null"
            :title="title"
            :maxWidth="800"
            :fullscreen="true"
            >
            <UserLogsViewerPanel ref="viewer" :itemsLoader="logsLoaderWrapper">
                <template #controls>
                    <v-select v-model="downloadLogsDaysCount" :items="daysCountOptions" hide-details style="flex:0"/>
                    <v-btn :loading="downloading" @click="downloadLogs" elevation="0" >
                        Download logs
                    </v-btn>
                    <v-btn :loading="clearing" @click="clearLogs" elevation="0" >
                        Clear All logs
                    </v-btn>
                    <hr>
                    <DropdownButton
                        @itemClick="generateVirtualecuConfig"
                        :loading="generatingVirtualEcuConfig"
                        :items="genVeConfOptions"
                        elevation="0"
                        >
                            Generate VirtualEcu Config
                    </DropdownButton>
                </template>
            </UserLogsViewerPanel>
        </Modal>
    </div>
</template>

<style lang="scss" scoped>
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
