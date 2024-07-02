<script>
import OBDLabsSettings  from './OBDLabsSettings.vue'

export default {
    components: {
        OBDLabsSettings
    }
}
</script>

<template>
    <div class="obdlabs-tool-panel">
        <div class="tool-form">
            <slot></slot>
        </div>
        <OBDLabsSettings />
    </div>
</template>


<style lang="scss" scoped>
.obdlabs-tool-panel{
    display: flex;
    flex-direction: row;
    height: calc(100vh - 64px);
    & > div{
        box-sizing: border-box;
        padding: 1rem;
    }
    .tool-form{
        flex: 1;
        border-left: 1px solid #e6e6e6;
    }
    .file-input{
        display: flex;
        flex-direction: row;
        &:not(.auto-size){
            width: 650px;
        }
    }
}
</style>