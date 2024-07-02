<script>
export default {
    props: {
        active: {
            type: Boolean,
        },
        item: {
            type: Object,
            required: true
        }
    }
}
</script>

<template>
<v-list-item @click="$emit('click')" :class="active ? 'active' : ''" link dense >
    <v-list-item-icon>
        <v-icon>{{ item.icon }}</v-icon>
    </v-list-item-icon>
    <v-list-item-content>
        <v-list-item-title>{{ (item.title || item.key).toUpperCase() }}</v-list-item-title>
    </v-list-item-content>
</v-list-item>
</template>