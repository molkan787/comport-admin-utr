<template>
    <div class="login-page">
        <div class="card-wrapper">
            <v-card>
                <v-card-title>Login</v-card-title>
                <v-card-text>
                    <v-form>
                        <v-text-field :disabled="loading" @keypress="inputKeypress" v-model="username" label="Username" placeholder="username" outlined />
                        <v-text-field :disabled="loading" @keypress="inputKeypress" v-model="password" label="Password" placeholder="password" outlined type="password" />
                        <v-btn :loading="loading" @click="login" block color="blue" elevation="0">Login</v-btn>
                    </v-form>
                </v-card-text>
            </v-card>
        </div>
    </div>
</template>

<script>
import { AuthService } from '../services/auth'
import Shell from '../shell'

export default {
    data: () => ({
        loading: false,
        username: '',
        password: ''
    }),
    methods: {
        async login(){
            this.loading = true
            try {
                const result = await AuthService.login(this.username, this.password)
                if(typeof result == 'boolean' && result){
                    this.$emit('authenticated')
                }else{
                    alert(result, 'Login failed')
                }
            } catch (error) {
                console.error(error)
                alert('An error occured, Please try again.', 'Error')
            }
            this.loading = false
        },
        inputKeypress(e){
            if(e.keyCode === 13){
                this.login()
            }
        }
    },
    mounted(){
        if(window.DEV){
            this.username = 'admin'
            this.password = '123456'
            Shell.registerReadyCallback(() => this.login())
        }
    }
}
</script>

<style lang="scss" scoped>
.login-page{
    display: table;
    width: 100%;
    height: 100%;
    .card-wrapper{
        $sidePad: calc((100vw - 500px) / 2);
        padding-left: $sidePad;
        padding-right: $sidePad;
        display: table-cell;
        vertical-align: middle;
    }
}
</style>