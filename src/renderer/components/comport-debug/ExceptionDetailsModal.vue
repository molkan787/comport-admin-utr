<script>
import { ComportDebugSerivce } from '../../services/comportDebug'
import Modal from '../templates/Modal.vue'
export default {
    components: {
        Modal
    },
    computed: {
        FullStackTrace(){
            const { FullStackTrace } = this.data
            return Array.isArray(FullStackTrace) ? FullStackTrace.map(i => '- ' + i).join('\n\n') : ''
        }
    },
    data: () => ({
        srcData: null,
        data: {},
        modalOpen: false,
        archiving: false,
        loadingUserId: null
    }),
    methods: {
        async open(execption, options){
            const { reload } = options || {}
            let data = execption
            if(reload){
                this.srcData = data
                data = await ComportDebugSerivce.GetExceptionFullData('flasher', execption._id)
            }
            this.data = data
            this.modalOpen = true
        },
        async archiveClick(){
            this.archiving = true
            try {
                if(await confirm("Archive this exception?")){
                    await ComportDebugSerivce.ArchiveException('flasher', this.data._id)
                    this.$set(this.data, 'Archived', true)
                    if(this.srcData) this.$set(this.srcData, 'Archived', true)
                }
            } catch (error) {
                panic(error)
            }
            this.archiving = false
        },
        async userDetailsClick(item){
            try {
                const customerId = item.UserDetails.Id
                this.loadingUserId = customerId
                await window.editCustomerEntry(customerId)
            } catch (error) {
                panic(error)
            }
            this.loadingUserId = null
        }
    },
    created(){
        window.openExceptionDetails = (ex, opt) => this.open(ex, opt)
    }
}
</script>

<template>
<Modal :open="modalOpen" title="Exception Details" cancelButtonText="Close" @cancelClick="modalOpen = false" :okButtonText="null" plainBlock fullscreen>
    <div class="exception-details-modal">
        <div class="even row">
            <div class="column">
                <v-text-field label="Exception Header" :value="data.ExceptionHeader" filled hide-details readonly />
                <v-text-field label="Exception Hash" :value="data.ExceptionHash" filled hide-details readonly />
                <v-text-field label="Exception Type" :value="data.ExceptionType" filled hide-details readonly />
                <v-textarea label="Full StackTrace" :value="FullStackTrace" filled hide-details readonly no-resize class="fullStackTrace" />
            </div>
            <div class="exceptionsList">
                <div class="column">
                    <div v-for="(item, index) in data.ExceptionsList" :key="index">
                        <template v-if="item.UserDetails">
                            <span>
                                Customer:
                                <a @click="userDetailsClick(item)">{{ item.UserDetails.Email }}</a>
                                <v-progress-circular
                                    v-if="loadingUserId === item.UserDetails.Id"
                                    indeterminate color="primary" :size="14" :width="2"
                                />
                            </span>
                            <hr>
                        </template>
                        {{ item.ExceptionString }}
                    </div>
                </div>
            </div>
        </div>
    </div>
    <template #additionalButtons>
        <v-btn color="green" text dark @click="archiveClick" :loading="archiving" :disabled="data.Archived">
            <v-icon v-if="data.Archived">mdi-check-circle-outline</v-icon>
            {{ data.Archived ? 'Archived' : 'Archive' }}
        </v-btn>
    </template>
</Modal>
</template>

<style lang="scss" scoped>
.exception-details-modal{
    height: 100%;
    .column > *{
        flex: 0;
        &.fullStackTrace{
            flex: 1;
        }
    }
    .exceptionsList{
        height: 100%;
        overflow-x: hidden;
        overflow-y: scroll;
        .column > div {
            background-color: rgba(0,0,0,.06);
            border-bottom: 1px solid rgba(0,0,0,.42);
            padding: 12px;
            user-select: text;
            cursor: text;
            transition: background-color 0.2s;
            &:first-child{
                border-top-left-radius: 4px;
                border-top-right-radius: 4px;
            }
            &:hover{
                background-color: rgba(0,0,0,.12);
            }
        }
    }
}
.column{
    display: flex;
    flex-direction: column;
    padding: 4px;
}
.row{
    display: flex;
    flex-direction: row;
    width: 100%;
    height: 100%;
    margin: 0;
    &.even > *{
        flex: 1;
    }
}
a{
    text-decoration: underline;
    cursor: pointer;
    color: rgb(19, 19, 252);
    &:active{
        color: rgb(114, 0, 236);
    }
}
</style>

<style lang="scss">
.exception-details-modal{
    .fullStackTrace{
        .v-input__control{
            &, & > .v-input__slot{
                height: 100%;
            }
        }
    }
}
</style>