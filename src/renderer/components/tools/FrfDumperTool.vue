<template>
    <div class="frfdumper-tool">
        <!-- <v-text-field label="FRF File" dense hide-details /> -->
        <div>
            <v-btn @click="loadFile" :loading="processing">Load FRF File</v-btn>
        </div>
        <div v-if="inputFile">
            Input Frf file: <strong>{{ inputFile }}</strong> <br>
            Output Odx file:
            <strong>
                {{ outputFile || "processing..." }}
                <a v-if="outputFile" @click="showOutputFile" href="#">Show File</a>
            </strong>
        </div>
        <div v-if="inputFile">
            <div style="margin-top: 8px">Output info:</div>
            <textarea :value="info" class="info-logs" readonly></textarea>
        </div>
    </div>
</template>

<script>
import { promptFile, showItemInFolder } from '../../utils'
import { FrfDumperService } from '../../services/tools/frfdumper'

export default {
    data: () => ({
        inputFile: null,
        outputFile: null,
        info: '',
        processing: false
    }),
    methods: {
        async loadFile(){
            this.processing = true
            try {
                const filename = await promptFile()
                if(filename){
                    this.outputFile = null
                    this.info = ''
                    this.inputFile = filename
                    const output = await FrfDumperService.DumpData(filename)
                    this.outputFile = output.OdxFilename
                    this.info = output.Info
                }
            } catch (error) {
                this.inputFile = null
                console.error(error)
                alert('An error occured.\n\n' + error.toString())
            }
            this.processing = false
        },
        showOutputFile(){
            showItemInFolder(this.outputFile)
        }
    }
}
</script>

<style lang="scss" scoped>
.frfdumper-tool{
    padding: 8px;
    .info-logs{
        background-color: #f7f7f7;
        border: 1px solid #cacaca;
        width: 100%;
        height: calc(100vh - 200px);
        resize: none;
        overflow: scroll;
        white-space: pre;
    }
}
</style>