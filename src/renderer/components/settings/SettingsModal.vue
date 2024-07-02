<template>
    <Modal
    title="Settings" :open="isOpen" :cancelButtonText="null"
    okButtonText="Close" @okClick="isOpen = false"
    fullscreen >
        <SettingsPanel v-if="isOpen" @mounted="panelMounted" ref="panel" />
        <div class="spinner-wrapper" v-else>
            <v-progress-circular
                indeterminate
                color="primary"
            ></v-progress-circular>
        </div>
    </Modal>
</template>

<script>
import Modal from '../templates/Modal.vue'
import SettingsPanel from './SettingsPanel.vue'

export default {
    components: {
        Modal,
        SettingsPanel
    },
    data: () => ({
        isOpen: false,
    }),
    methods: {
        open(){
            this.isOpen = true
        },
        panelMounted(){
            this.$refs.panel.load()
        }
    },
    mounted(){
        // setTimeout(() => this.open(), 1000)
    },
    created(){
        window.openSettingsModal = () => this.open()
    }
}
</script>

<style lang="scss" scoped>
.spinner-wrapper{
    text-align: center;
    padding: 6rem;
}
</style>