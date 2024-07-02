<script>
export default {
    props: {
        store: {
            type: Object,
            required: true
        },
        item: {
            type: Object,
            required: true
        }
    },
    computed: {
        expand: {
            get() { return this.store.expandedItems[this.item.uid] },
            set(value) { this.$set(this.store.expandedItems, this.item.uid, value) }
        },
        data(){
            return this.item.UdsMessageParts
        },
        isTooLong(){
            return this.data.bytes.length > 123
        },
        collapsed(){
            return !this.store.expandAll && !this.expand && this.isTooLong
        },
        bytesText(){
            const bd = this.data.bytes
            return this.collapsed ? bd.substring(0, 117) + '...' : bd
        }
    }
}
</script>

<template>
    <div class="userlogs-item-udsdata">
        <span class="time">{{ data.time }}</span>
        <span class="type">{{ data.type }}</span>
        <span class="bytes">{{ bytesText }}</span>
        <span class="expandBtn" v-if="collapsed" @click="expand = true">Expand</span>
    </div>
</template>

<style lang="scss" scoped>
.userlogs-item-udsdata{
    display: inline;
    .type{
        font-weight: bold;
    }
    .bytes{
        color: #7f6cff;
    }
    * {
        user-select: text;
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