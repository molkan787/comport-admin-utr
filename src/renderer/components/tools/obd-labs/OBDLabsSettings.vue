<script>
import { mapState } from 'vuex'

export default {
    computed: mapState({
        loginInfo: state => state.obdLabs.loginInfo,
        proxy: state => state.obdLabs.proxy,
    })
}
</script>
<template>
<div class="login-form">
    <p>OBD Labs Account</p>
    <div class="file-input auto-size">
        <v-text-field v-model.trim="loginInfo.username" label="Username" dense />
    </div>
    <div class="file-input auto-size">
        <v-text-field v-model="loginInfo.password" label="Password" dense />
    </div>
    <p>Proxy Settings</p>
    <div class="file-input auto-size">
        <v-text-field v-model.trim="proxy.host" label="Username" dense />
    </div>
    <div class="file-input auto-size">
        <v-text-field v-model.number="proxy.port" label="Password" dense />
    </div>
    <div class="file-input auto-size">
        <v-text-field v-model.trim="proxy.username" label="Username" dense />
    </div>
    <div class="file-input auto-size">
        <v-text-field v-model="proxy.password" label="Password" dense />
    </div>
</div>
</template>
