<template>
    <div class="bytes-return-tool-panel">
        <div class="file-input">
            <v-text-field v-model="folderName" label="Folder Name" placeholder="Folder Name" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model="fileName" label="File Name" placeholder="File Name" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model="offset" label="Offset" placeholder="(Decimal ### or Hex 0x###)" dense />
        </div>
        <div class="file-input">
            <v-text-field v-model="length" label="Length" placeholder="(Decimal ### or Hex 0x###)" dense />
        </div>
        <v-btn :loading="loading" @click="calculateKeyClick">Get Bytes</v-btn>
    </div>
</template>

<script>
import { RemoteToolsService } from '../../services/tools/remoteTools'
import { promptSaveFile, writeFile } from '../../utils'

export default {
    data: () => ({
        loading: false,
        folderName: '',
        fileName: '',
        offset: '',
        length: '',
    }),
    methods: {
        async calculateKeyClick(){
            if(!this.validateInput()) return
            try {
                this.loading = true
                const data = await RemoteToolsService.BytesReturn({
                    folderName: this.folderName,
                    fileName: this.fileName,
                    offset: this.offset,
                    length: this.length,
                })
                const dataBuffer = Buffer.from(data)
                const strHexData = dataBuffer.toString('hex')
                const save = await confirm(strHexData, 'Response Data', {
                    allowSelection: true,
                    showCopyButton: true,
                    okButtonText: 'Save to file',
                    cancelButtonText: 'Close'
                })
                if(save){
                    const filename = await promptSaveFile({
                        filters: [
                            { name: 'Binary File', extensions: ['bin'] },
                            { name: 'Other Files', extensions: ['*'] }
                        ]
                    })
                    if(filename){
                        await writeFile(filename, dataBuffer)
                    }
                }
            } catch (error) {
                console.error(error)
                if(error.response && error.response.status === 404){
                    alert('Filename or Folder name does not exist in the database.', 'File not found')
                }else{
                    alert(error.toString(), 'An error occured')
                }
            }
            this.loading = false
        },
        validateInput(){
            if(this.folderName.trim().length < 1){
                alert('Please enter a valid folderName')
            }else if(this.fileName.trim().length < 1){
                alert('Please enter a valid fileName')
            }else if(this.fileName.trim().length < 1){
                alert('Please enter a valid offset')
            }else if(this.fileName.trim().length < 1){
                alert('Please enter a valid length')
            }else{
                return true
            }
            return false
        }
    }
}
</script>

<style lang="scss" scoped>
.bytes-return-tool-panel{
    padding: 1rem;
    .file-input{
        width: 650px;
        display: flex;
        flex-direction: row;
    }
}
</style>