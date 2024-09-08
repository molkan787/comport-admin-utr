<template>
  <v-row justify="center">
    <v-dialog v-model="open" persistent max-width="420">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>
            <div class="text-wrapper" :class="{ allowSelection }">{{ text }}</div>
            <a @click="copyClick" class="copy-a-button" href="#">Copy</a>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="blue darken-1" text @click="cancelClick" v-if="cancelButtonText">{{ cancelButtonText }}</v-btn>
          <v-btn color="blue darken-1" text @click="okClick">{{ okButtonText }}</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-row>
</template>

<script>
export default { 
    data:() => ({
        open: false,
        title: '',
        text: '',
        okButtonText: 'OK',
        cancelButtonText: 'Cancel',
        allowSelection: false,
        showCopyButton: false,
    }),

    methods: {
        okClick(){
            this.open = false;
            this.resolve(true)
        },
        cancelClick(){
            this.open = false;
            this.resolve(false)
        },
        copyClick(){
            electron.clipboard.writeText(this.text)
        },

        handleRequest(title, text, type, options){
            const o = options || {};
            this.title = title;
            this.text = text;
            this.allowSelection = !!o.allowSelection
            this.showCopyButton = !!o.showCopyButton
            if(type == 'confirm'){
                this.okButtonText = o.okButtonText || 'YES';
                this.cancelButtonText = o.cancelButtonText || 'NO';
            }else{
                this.okButtonText = 'OK';
                this.cancelButtonText = '';
            }
            this.open = true;
        },

        alert(text, title, options){
            return new Promise(resolve => {
                this.resolve = resolve;
                this.handleRequest(title || 'Info', text, 'alert', options);
            });
        },
        confirm(text, title, options){
            return new Promise(resolve => {
                this.resolve = resolve;
                this.handleRequest(title || 'Confirm', text, 'confirm', options);
            });
        }
    },

    created(){
        window.alert = (text, title, options) => this.alert(text, title, options);
        window.confirm = (text, title, options) => this.confirm(text, title, options);
    }
}
</script>

<style lang="scss" scoped>
.text-wrapper{
    white-space: pre-wrap;
    &.allowSelection{
        user-select: text;
        cursor: text;
    }
}
a.copy-a-button{
    transition: background 0.1s;
    &:active{
        background-color: #91bdff;
    }
}
</style>