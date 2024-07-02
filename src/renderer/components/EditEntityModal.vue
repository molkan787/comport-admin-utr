<template>
  <Modal
    :open="open" :loading="saving" @okClick="saveClick" @cancelClick="closeClick" :maxWidth="modalWidth"
    :title="title" :okButtonText="okButtonText" :contentLoading="contentLoading" cancelButtonText="Close"
    :fullscreen="fullscreen"
    >
    <EntityForm v-if="open" :template="template" :data="data" :isNew="isNew" :payload="payload" :viewOnly="viewOnly" />
    <template #leftButtons>
        <template v-if="fullscreen">
            <v-btn v-if="!isNew && !hideDelete" color="red darken-1" text
                @click="deleteClick" :loading="deleting" :disabled="saving">
                {{ deleteButtonText || 'Delete' }}
            </v-btn>
        </template>
        <div v-else style="display: inline-block;padding-left:12px">
            <v-btn v-if="!isNew && !hideDelete" color="red darken-1" text
                @click="deleteClick" :loading="deleting" :disabled="saving">
                {{ deleteButtonText || 'Delete' }}
            </v-btn>
        </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "./templates/Modal.vue";
import EntityForm from "./EntityForm.vue";
import { deepClone } from '../utils';

export default {
    name: 'EditEntityModal',
    components: {
        Modal,
        EntityForm,
    },
    computed: {
        title(){
        const action = this.viewOnly ? 'View ' : 'Edit '
        return (this.isNew ? 'Create new ' : action) + this.entityName
        },
        okButtonText(){
        if(this.viewOnly)
            return null
        else if(typeof this.saveButtonText == 'string')
            return this.saveButtonText
        else if(this.isNew)
            return 'Create'
        else
            return 'Save changes'
        }
    },
    data: () => ({
        open: false,
        options: {},
        data: {},
        template: {},
        payload: null,
        isNew: false,
        saveHandler: null,
        deleteHandler: null,
        entityName: '',
        viewOnly: false,
        hideDelete: false,
        saveButtonText: null,
        deleteButtonText: null,
        saving: false,
        deleting: false,
        contentLoading: false,
        modalWidth: undefined,
        fullscreen: false,
    }),
    methods: {
        async saveClick(){
            this.saving = true
            try {
                await this.saveHandler(this.data, this.isNew)
                this.open = false
            } catch (error) {
            console.error(error)
            if(error.IsUserError) {
                alert(error.message, 'An error occured')
            }else{
                alert('Am error occured, Please try again.', 'An error occured')
            }
            }
            this.saving = false
        },
        closeClick(){
            this.open = false
        },
        async deleteClick(){
            if(!(await confirm(`${this.deleteButtonText || 'Delete'} this ${this.entityName}?`)))
            return
            this.deleting = true
            try {
            await this.deleteHandler(this.data)
            this.open = false
            } catch (error) {
            console.error(error)
            if(error.IsUserError) {
                alert(error.message, 'An error occured')
            }else{
                alert('Am error occured, Please try again.', 'An error occured')
            }
            }
            this.deleting = false
        },

        async editEntity(options) {
                const {
                    template, data, name, saveHandler, deleteHandler, loadHandler,
                    viewOnly, hideDelete, saveButtonText, deleteButtonText, payload,
                    modalWidth, fullscreen, defaultValues
                } = options
                this.options = options
                this.isNew = !data
                this.data = (data && deepClone(data)) || defaultValues || {}
                this.entityName = name
                this.template = template
                this.payload = payload
                this.saveHandler = saveHandler
                this.deleteHandler = deleteHandler
                this.viewOnly = viewOnly
                this.hideDelete = typeof hideDelete == 'boolean' ? hideDelete : false
                this.saveButtonText = typeof saveButtonText == 'string' ? saveButtonText : null
                this.deleteButtonText = typeof deleteButtonText == 'string' ? deleteButtonText : null
                this.modalWidth = modalWidth || undefined
                this.fullscreen = fullscreen
                this.open = true
                if(typeof loadHandler == 'function'){
                    try {
                    this.contentLoading = true
                    await loadHandler(this.data, this.isNew)
                    } catch (error) {
                    this.open = false
                    panic(error)
                    }
                }
                this.contentLoading = false
        }
    },
    created() {
        // setTimeout(() => (this.open = true), 1000);
        // window.editEntity = options => this.editEntity(options)
    }
};
</script>