<script>
export default {
    props: {
        items: {
            type: Array,
            required: true
        },
        elevation: {
            type: String,
            default: undefined
        },
        disabled: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        }
    },
    methods: {
        itemClick(item){
            this.$emit('itemClick', item.value)
        }
    }
}
</script>

<template>
<v-menu offset-y>
    <template v-slot:activator="{ on, attrs }">
    <v-btn
        v-bind="attrs"
        v-on="on"
        :elevation="elevation"
        :disabled="disabled"
        :loading="loading"
    >
        <slot></slot>
    </v-btn>
    </template>
    <v-list>
        <v-list-item
            v-for="(item, index) in items"
            :key="index"
            link
            @click="itemClick(item)"
        >
            {{ item.text }}
        </v-list-item>
    </v-list>
</v-menu>
</template>