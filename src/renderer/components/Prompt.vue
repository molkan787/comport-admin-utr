<template>
  <v-row justify="center">
    <v-dialog v-model="open" persistent max-width="360">
      <v-card>
        <v-card-title class="headline">{{ title }}</v-card-title>
        <v-card-text>
            <v-text-field
                :label="text"
                v-model="value"
             />
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
        value: '',
        okButtonText: 'OK',
        cancelButtonText: 'Cancel'
    }),

    methods: {
        okClick(){
            this.open = false;
            this.resolve(this.value)
        },
        cancelClick(){
            this.open = false;
            this.resolve(false)
        },

        handleRequest(payload){
            const { value, title, text, okButtonText, cancelButtonText } = payload;
            this.value = value || '';
            this.title = title || 'Prompt';
            this.text = text || 'Input';
            this.okButtonText = okButtonText || 'Ok';
            this.cancelButtonText = cancelButtonText || 'Cancel';
            this.open = true;
        },

        prompt(payload){
            return new Promise(resolve => {
                this.resolve = resolve;
                this.handleRequest(payload);
            });
        }
    },

    created(){
        window.prompt = (payload) => this.prompt(payload);
    }
}
</script>