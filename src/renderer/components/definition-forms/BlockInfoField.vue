<template>
  <div class="block-info-field">
    <div v-if="!isNew" data-v-fbe4b866="">
      <div
        data-v-fbe4b866=""
        class="
          v-input
          v-input--hide-details
          v-input--is-label-active
          v-input--is-dirty
          theme--light
          v-text-field v-text-field--is-booted
        "
      >
        <div class="v-input__control">
          <div class="v-input__slot">
            <div class="v-text-field__slot">
              <label
                class="v-label v-label--active theme--light"
                style="left: 0px; right: auto; position: absolute"
                >Block</label
              >
              <v-btn @click="editBlockInfoClick" :loading="loading" style="margin-top: 8px" elevation="0" small>Edit block info</v-btn>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { DefinitionsService } from '../../services/definitions'
import { deepClone } from '../../utils'

export default {
    props: {
        data: { type: Object, required: true },
        isNew: { type: Boolean, required: true },
    },
    watch: {
        data: {
            immediate: true,
            deep: false,
            handler(){
              if(this.isNew) return
              this.fetchBlockInfo()
            }
        }
    },
    data: () => ({
        loading: false,
        blockInfo: {},
        editBlockInfoForm: {
            fields: [
                { label: 'Block Address (Hex)', value: 'address' },
                { label: 'Block Length (Hex)', value: 'length' },
                { label: 'Writable bytes offset (Hex)', value: 'writableBytesOffset' },
                { label: 'Target checksum (Hex)', value: 'targetChecksum' },
            ]
        }
    }),
    methods: {
        editBlockInfoClick(){
          editEntity({
            template: this.editBlockInfoForm,
            data: this.blockInfo,
            name: 'Block Info',
            hideDelete: true,
            saveHandler: (data) => this.saveBlockInfo(data)
          })
        },
        async saveBlockInfo(data){
          const isNew = typeof data._id == 'undefined'
          const blockInfo = deepClone(data)
          // converting hex string values into number
          blockInfo.address = Number.parseInt(blockInfo.address, 16)
          blockInfo.length = Number.parseInt(blockInfo.length, 16)
          blockInfo.writableBytesOffset = Number.parseInt(blockInfo.writableBytesOffset, 16)
          const doc = await DefinitionsService.saveBlockDefinition(this.data.name, blockInfo, isNew)
          this.loadBlockInfo(doc)
        },
        async fetchBlockInfo(){
            this.loading = true
            try {
                const blocksInfo = await DefinitionsService.getBlocksDefinitions(this.data.name)
                this.loadBlockInfo(blocksInfo[0])
            } catch (error) {
                console.error(error)
                alert('An error occured when loading block info.', 'Error')
            }
            this.loading = false
        },
        loadBlockInfo(data){
          if(typeof data != 'undefined'){
            const blockInfo = deepClone(data)
            // converting decimal number to hex string, allowing user to edit them in hex
            blockInfo.address = blockInfo.address.toString(16).toUpperCase()
            blockInfo.length = blockInfo.length.toString(16).toUpperCase()
            blockInfo.writableBytesOffset = blockInfo.writableBytesOffset.toString(16).toUpperCase()
            this.blockInfo = blockInfo
          }else{
            this.blockInfo = {
              referenceNumber: this.data.name,
              name: 'data_block',
              targetChecksum: '',
              address: '',
              length: '',
              writableBytesOffset: '',
              checksumAlgorithm: 1,
            }
          }
        }
    }
}
</script>

<style scoped>
.v-input__slot::before{
    opacity: 0 !important;
}
</style>