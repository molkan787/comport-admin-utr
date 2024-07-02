<script>
import { RemoteObdSnifferService } from '../../services/remoteObdSnifferService'
import Modal from '../templates/Modal.vue'
import VirtualList from 'vue-virtual-scroll-list'
import ObdRecordingItem from './ObdRecordingItem.vue'
import { promptSaveFile, writeFile } from '../../utils'
import { VirtualecuConfigGenerator } from '../../modules/virtualecu/VirtualecuConfigGenerator'

export default {
    components: {
        Modal,
        VirtualList
    },
    data: () => ({
        modalOpen: false,
        loading: false,
        data: {},
        items: [],
        ObdRecordingItem,
        generatingVirtualEcuConfig: false,
        deleting: false,
    }),
    methods: {
        open(data){
            this.data = data
            this.modalOpen = true
            this.loadItems()
        },
        copyInviteTokenClick(){
            require('electron').clipboard.writeText(this.data.uid)
        },
        async loadItems(){
            this.loading = true
            try {
                const items = await RemoteObdSnifferService.GetRecordingItems(this.data.uid)
                if(window.devFunc === 'ros'){
                    console.log(items)
                }
                this.items = items
            } catch (error) {
                panic(error)
            }
            this.loading = false
        },
        closeClick(){
            this.modalOpen = false
            setTimeout(() => this.items = [], 200)
        },
        async generateVirtualecuConfig(){
            this.generatingVirtualEcuConfig = true
            try {
                const filename = await promptSaveFile({ filters: [{ name: 'C#', extensions: '.cs' }] })
                if(!filename){
                    this.generatingVirtualEcuConfig = false
                    return
                }
                const strConfig = VirtualecuConfigGenerator.GenerateFromObdRecording(this.items)
                await writeFile(filename, strConfig)
            } catch (error) {
                panic(error)
            }
            this.generatingVirtualEcuConfig = false
        },
        async deleteClick(){
            try {
                const confirmed = await confirm('Delete Recording?')
                if(!confirmed) return
                await RemoteObdSnifferService.DeleteRecording(this.data.uid)
                this.modalOpen = false
            } catch (error) {
                panic(error)
            }
        }
    },
    filters: {
        date(d){
            return d instanceof Date ? d.toLocaleString() : '--'
        }
    },
    created(){
        window.openObdRecordingDetails = (data) => this.open(data)
    }
}
</script>

<template>
    <div class="userlogs-modal">
        <Modal
            :open="modalOpen"
            @okClick="closeClick()"
            :okButtonText="'Close'"
            :cancelButtonText="null"
            title="OBD Recording"
            :maxWidth="800"
            :fullscreen="true"
            >
            <div class="cols-parent">
                <div class="content-col">
                    <div class="placeholder" v-if="loading || (!items || items.length === 0)">
                        <v-progress-circular v-if="loading" indeterminate color="primary" />
                        <span v-else>This recording is empty.</span>
                    </div>
                    <virtual-list v-if="items && items.length" style="height: 100%; overflow-y: auto;"
                        :data-key="'time'"
                        :data-sources="items"
                        :data-component="ObdRecordingItem"
                        :keeps="100"
                        :estimate-size="21"
                    />
                </div>
                <div class="controls-col">
                    <v-text-field label="Name" :value="data.Name" readonly hide-details />
                    <v-text-field label="Created At" :value="data.CreatedAt | date" readonly hide-details />
                    <v-text-field label="Updated At" :value="data.UpdatedAt | date" readonly hide-details />
                    <v-text-field label="Invite Token" :value="data.uid" readonly hide-details />
                    <v-btn @click="copyInviteTokenClick" elevation="0">Copy Invite Token</v-btn>
                    <hr>
                    <v-btn
                        @click="generateVirtualecuConfig"
                        :loading="generatingVirtualEcuConfig"
                        elevation="0">
                            Generate VirtualEcu Config
                    </v-btn>
                </div>
            </div>
            <template #additionalButtons>
                <v-btn
                    @click="deleteClick"
                    :loading="deleting"
                    text
                    color="red darken-1"
                    elevation="0">
                        Delete
                </v-btn>
            </template>
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
        font-family: 'Courier New', Courier, monospace;
        .userlogs-modal-logs{
            flex: 1;
        }
    }
    .controls-col{
        display: flex;
        flex-direction: column;
        padding: 4px;
        width: 320px;
        & > *{
            margin-bottom: 4px;
            &.v-input{
                flex: 0;
            }
        }
    }
}
.logs-container{
    display: flex;
    flex-direction: column;
    height: calc(100vh - 330px);
    min-height: 50px;
    overflow-y: scroll;
    background-color: #fbfbfb;
    border: 1px solid #ececec;
    font-family: monospace;
    color: #252525;
    flex: 1;
    
}
hr{
    border-bottom: none;
    background: #d6d6d6;
}
.placeholder{
    display: flex;
    width: 100%;
    height: 100%;
    align-items: center;
    justify-content: center;
    span{
        font-style: italic;
        opacity: 0.6;
    }
}
</style>
