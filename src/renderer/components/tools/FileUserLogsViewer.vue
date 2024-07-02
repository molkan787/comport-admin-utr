<script>
import UserLogsService from '../../services/userlogs'
import { promptFile } from '../../utils'
import UserLogsViewerPanel from '../customer-forms/UserLogsViewerPanel.vue'

export default {
    components: {
        UserLogsViewerPanel
    },
    data: () => ({
        itemsLoaderWrapper: null
    }),
    methods: {
        async itemsLoader(){
            const filename = await promptFile({ filters: [{ name: 'User Logs', extensions: ['userlog'] }] })
            if(!filename) return null
            return await UserLogsService.LoadLogsFromFile(filename)
        }
    },
    created(){
        this.itemsLoaderWrapper = () => this.itemsLoader()
    },
    mounted(){
        this.$refs.viewer.resetState()
    }
}
</script>

<template>
    <UserLogsViewerPanel ref="viewer" :itemsLoader="itemsLoaderWrapper" loadItemsButtonText="Open User Logs File">

    </UserLogsViewerPanel>
</template>