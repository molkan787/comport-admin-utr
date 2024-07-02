<template>
  <v-row justify="center">
    <v-dialog
      v-model="open"
      persistent
      :max-width="maxWidth"
      :fullscreen="fullscreen"
    >
      <v-card>
        <v-toolbar v-if="fullscreen" dark color="primary" elevation="0">
          <v-toolbar-title>{{ title }}</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <slot name="additionalButtons"></slot>
            <slot v-if="!contentLoading" name="leftButtons"></slot>
            <v-btn text dark @click="cancelClick" v-if="cancelButtonText" :disabled="loading">{{ cancelButtonText }}</v-btn>
            <v-btn text dark @click="okClick" v-if="okButtonText && !contentLoading" :loading="loading">{{ okButtonText }}</v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-title v-else class="headline">{{ title }}</v-card-title>
        <v-card-text class="modal-content" :class="{ fullscreen, plainBlock }">
          <slot></slot>
          <v-overlay :value="contentLoading" absolute :z-index="0">
            <v-progress-circular
              indeterminate
              size="48"
            ></v-progress-circular>
          </v-overlay>
        </v-card-text>
        <v-card-actions v-if="!fullscreen">
          <slot v-if="!contentLoading" name="leftButtons"></slot>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelClick" v-if="cancelButtonText" :disabled="loading">{{ cancelButtonText }}</v-btn>
          <v-btn color="blue darken-1" text @click="okClick" v-if="okButtonText && !contentLoading" :loading="loading">{{ okButtonText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default {
    props: {
        open: { type: Boolean, default: false },
        title: { type: String, default: 'Modal' },
        okButtonText: { type: String, default: 'OK' },
        cancelButtonText: { type: String, default: 'Cancel' },
        loading: { type: Boolean, default: false },
        contentLoading: { type: Boolean, default: false },
        maxWidth: { type: Number, default: 600 },
        fullscreen: { type: Boolean, default: false },
        plainBlock: { type: Boolean, default: false },
    },

    methods: {
        okClick(){
            this.$emit('okClick')
        },
        cancelClick(){
            this.$emit('cancelClick')
        }
    }
}
</script>

<style lang="scss" scoped>
.modal-content{
  max-height: calc(100vh - 190px);
  overflow-x: hidden;
  overflow-y: scroll;
  &.fullscreen{
    height: calc(100vh - 65px);
    max-height: none;
    padding: 4px !important;
  }
  &.plainBlock{
    overflow-x: hidden;
    overflow-y: hidden;
    padding: 0 !important;
  }
}
</style>