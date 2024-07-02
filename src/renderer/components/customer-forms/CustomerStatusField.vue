<script>
export default {
    props: {
        data: {
            type: Object,
            required: true
        },
        isNew: {
            type: Boolean,
            required: true
        }
    },
    data: () =>({
        options: [
            { text: 'Pending', value: 'pending', color: 'blue', icon: 'clock-time-five-outline' },
            { text: 'Active', value: 'active', color: 'success', icon: 'check-circle-outline' },
            { text: 'Inactive', value: 'inactive', color: 'default', icon: 'circle-outline' },
            { text: 'Banned', value: 'banned', color: 'red', icon: 'cancel' },
        ]
    }),
    watch: {
        data: {
            deep: false,
            immediate: true,
            handler(d){
                if(this.isNew && (typeof d.status !== 'string' || d.status.length < 1)){
                    d.status = 'active'
                }
            }
        }
    }
}
</script>

<template>
    <v-select v-model="data.status" :items="options">
        <template #item="{ item }">
            <v-chip :color="item.color" outlined  >
                <v-icon left>mdi-{{ item.icon }}</v-icon>
                {{ item.text }}
            </v-chip>
        </template>
        <template #selection="{ item }">
            <v-chip :color="item.color" small outlined >
                <v-icon small left>mdi-{{ item.icon }}</v-icon>
                {{ item.text }}
            </v-chip>
        </template>
    </v-select>
</template>