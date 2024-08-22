<template>
  <v-app id="vapp">
    <v-app-bar app color="primary" dark elevation="1" dense>
      COMPORT ADMIN
      <v-spacer></v-spacer>
      <template v-if="loggedIn">
        <div id="header-extra-buttons"></div>
        <v-btn v-if="showRefreshButton" :loading="refreshing" @click="refreshBtnClick" title="Refresh current tab" icon>
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
        <v-btn @click="settingsBtnClick" title="Settings" icon>
          <v-icon>mdi-cog</v-icon>
        </v-btn>
      </template>
    </v-app-bar>
    <v-content style="height:100vh">
      <v-card class="content" elevation="0">
        <LoginPage v-if="!isAuthenticated" @authenticated="isAuthenticated = true" />
        <HomePage ref="homePage" v-else-if="ready && isAuthenticated" />
      </v-card>
    </v-content>
    <EditEntityModal ref="editEntityModals" v-for="idx in editEntityModalPool" :key="idx" />
    <KvsEditItemsModal />
    <SettingsModal />
    <FlashingHistoryModal />
    <Prompt />
    <Dialog />
  </v-app>
</template>

<script>
import { mapState } from 'vuex'
import Shell from './shell'
import HomePage from "./components/HomePage";
import LoginPage from './components/LoginPage.vue'
import Dialog from "./components/Dialog";
import Prompt from "./components/Prompt.vue";
import EditEntityModal from './components/EditEntityModal.vue'
import KvsEditItemsModal from './components/kvs/KvsEditItemsModal.vue'
import SettingsModal from './components/settings/SettingsModal.vue'
import FlashingHistoryModal from './components/customer-forms/FlashingHistoryModal.vue'


export default {
  name: "App",
  computed: mapState({
    loggedIn: state => state.loggedIn,
    showRefreshButton: state => state.ui.showRefreshButton
  }),
  components: {
    HomePage,
    LoginPage,
    Dialog,
    Prompt,
    EditEntityModal,
    KvsEditItemsModal,
    SettingsModal,
    FlashingHistoryModal
  },
  data: () => ({
    ready: false,
    isAuthenticated: window.isAuthenticated,
    editEntityModalPool: [1, 2, 3, 4, 5],
    refreshing: false,
  }),
  methods: {
    settingsBtnClick(){
      openSettingsModal()
    },
    async refreshBtnClick(){
      this.refreshing = true;
      try {
        await this.$refs.homePage.refreshCurrentTab();
      } catch (error) {
        panic(error);
      }
      this.refreshing = false;
    }
  },
  created(){
    Shell.onReady = () => this.ready = true
  },
  mounted(){
    const getFreeEditEntityModal = () => {
      for(let i = 0; i < this.editEntityModalPool.length; i++){
        const m = this.$refs.editEntityModals[i]
        if(!m.open) return m
      }
    }
    window.editEntity = options => getFreeEditEntityModal().editEntity(options)
  }
};
</script>

<style scoped>
.content {
  padding: 0;
  height: 100%;
}
</style>

<style lang="scss">

html, body {
  overflow: hidden !important;
  background-color: white;
}
*:not(input) {
  user-select: none;
}
h1, h2, h3, h4, h5, h6, div, p, span:not(.v-btn__content), label {
  cursor: default;
}
</style>