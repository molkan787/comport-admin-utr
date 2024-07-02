<script>
const MAX_FULL_DISPLAY = 20
export default {
    props: {
        source: {
            type: Object
        }
    },
    data: () => ({
        expand: false
    }),
    computed: {
        buffer(){
            return this.source.bytes.buffer
        },
        isTooLong(){
            return this.buffer.length > MAX_FULL_DISPLAY
        },
        collapsed(){
            return !this.expand && this.isTooLong
        },
        bytesAsHexStr(){
            return this.buffer.toJSON().data.map(b => b.toString(16).padStart(2, '0')).join(' ')
        },
        bytesText(){
            const bd = this.bytesAsHexStr
            return this.collapsed ? bd.substring(0, MAX_FULL_DISPLAY * 3 - 2) + '...' : bd
        },
        dir(){
            return this.source.dir === 'w' ? 'TX' : 'RX'
        }
    }
}
</script>

<template>
    <div class="obd-recording-item" :class="dir">
        <span class="time">[{{ source.time }}]</span>
        <span class="dir">{{ dir }}</span>:
        <span class="data">{{ bytesText }}</span>
        <span class="expandBtn" v-if="isTooLong" @click="expand = !expand">
            {{ expand ? 'Collapse' : 'Expand' }}
        </span>
    </div>
</template>

<style lang="scss" scoped>
.obd-recording-item{
    transition: background-color 0.2s;
    &, & > span:not(.expandBtn){
        user-select: text;
        cursor: text;
    }
    &.TX{
        background-color: #d9f5fd;
    }
    &.RX{
        background-color: #e3f9e3;
    }
    .data{
        color: #7f6cff;
    }
    .dir{
        font-weight: bold;
    }
    .expandBtn{
        user-select: none;
        text-decoration: underline;
        cursor: pointer;
        color: rgb(19, 19, 252);
        &:active{
            color: rgb(114, 0, 236);
        }
    }
}
</style>