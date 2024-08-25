<script>
import FrfDumperTool from './FrfDumperTool.vue'
import LZRBTool from './LZRBTool.vue'
import LZSSTool from './LZSSTool.vue'
import AESCBCTool from './AESCBCTool.vue'
import CPCCompressionTool from './CPCCompressionTool.vue'
import SA2Tool from './SA2Tool.vue'
import SeedKeyGenerationTool from './SeedKeyGenerationTool.vue'
import FileFixTool from './FileFixTool.vue'
import CRCPatcher from './CRCPatcher.vue'
import OBDLabsChecksumPatcher from './OBDLabsChecksumPatcher.vue'
import OBDLabsPatchFileTool from './OBDLabsPatchFileTool.vue'
import OBDLabsExtractMemoryBlocks from './OBDLabsExtractMemoryBlocks.vue'
import OBDLabsCalculateSignature from './OBDLabsCalculateSignature.vue'
import OBDLabsGetSecurityKey from './OBDLabsGetSecurityKey.vue'
import OBDLabsCalculateSwitchOver from './OBDLabsCalculateSwitchOver.vue'
import OBDLabsCompressFile from './OBDLabsCompressFile.vue'
import OBDLabsCompressFileV0 from './OBDLabsCompressFileV0.vue'
import OBDLabsPatchAndCompressFile from './OBDLabsPatchAndCompressFile.vue'
import OBDLabsVGS4NAG2Tools from './OBDLabsVGS4NAG2Tools.vue'
import FileCutTool from './FileCutTool.vue'
import NissanKeygen from './NissanKeygen.vue'
import BlocksUnpacker from './BlocksUnpacker.vue'
import { RemoteToolsService } from '../../services/tools/remoteTools'
import { SeedKeyAlgos } from '../../services/tools/seekKeyAlgos'
import CompressionTemplate from './templates/CompressionTemplate.vue'
import FileProcessingTemplate from './templates/FileProcessingTemplate.vue'
import { LZ4Service } from '../../services/tools/lz4'
import { LZMASerivce } from '../../services/tools/lzma'
import { LZJBService } from '../../services/tools/lzjb'
import { arrayToMap } from '../../utils'
import ExternalProgramsService, { EPActions } from '../../services/externalPrograms'
import IKVMConverterTool from './IKVMConverterTool.vue'
import DLLSeedKey from './DLLSeedKey.vue'
import CRCHack from './CRCHack.vue'

// TODO: Replace repeatitive componenets with shared templates (tempalate for compression already exist)

export default {
    props: {
        searchInput: {
            type: String
        }
    },
    data: () => ({
        dialogopen: false,
        currentlyOpenTool: {},
        categoriesDef: [
            { id: 'obd_labs_tools', title: 'OBD-Labs Tools' },
            { id: 'security_algos', title: 'Security Algorithms' },
            { id: 'compression', title: 'Compression' },
            { id: 'file_tools', title: 'File Tools' },
            { id: 'cryptography', title: 'Cryptography' },
            { id: 'other', title: 'Other' },
        ],
        tools: [
            {
                title: 'LZRB Compression',
                component: LZRBTool,
                category: 'compression'
            },
            {
                title: 'LZSS Compression',
                component: LZSSTool,
                category: 'compression'
            },
            {
                title: 'CPC/VGS Compression',
                component: CPCCompressionTool,
                category: 'compression'
            },
            {
                title: 'FRF Dumper',
                component: FrfDumperTool,
                category: 'other'
            },
            {
                title: 'AES CBC',
                component: AESCBCTool,
                category: 'cryptography'
            },
            {
                title: 'SA2',
                component: SA2Tool,
                category: 'security_algos'
            },
            {
                title: 'MG1 Algorithm',
                component: SeedKeyGenerationTool,
                options: {
                    generate: (seed) => RemoteToolsService.MG1CS002_GenerateKey(seed),
                    available_configs: [
                        { level: '--', seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'Powertrain Algorithm',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, sal) => RemoteToolsService.PowertrainAlgo_GenerateKey(seed, sal),
                    available_configs: [
                        { level: 11, seedLength: 4, keyLength: 4 },
                        { level: 17, seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'Daimler Standard Algorithm',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, sal) => RemoteToolsService.DaimlerStandardAlgo_GenerateKey(seed, sal),
                    available_configs: [
                        { level: 17, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'File Fix Tool',
                component: FileFixTool,
                category: 'file_tools'
            },
            {
                title: 'CRC File Patcher',
                component: CRCPatcher,
                category: 'file_tools'
            },
            {
                title: 'LZ4 Compression',
                component: CompressionTemplate,
                options: {
                    compressFile: (i,o) => LZ4Service.CompressFile(i,o),
                    decompressFile: (i,o) => LZ4Service.DecompressFile(i,o)
                },
                category: 'compression'
            },
            {
                title: 'Checksum Patcher',
                component: OBDLabsChecksumPatcher,
                category: 'obd_labs_tools'
            },
            {
                title: 'PatchFile',
                component: OBDLabsPatchFileTool,
                category: 'obd_labs_tools'
            },
            {
                title: 'Extract Blocks',
                component: OBDLabsExtractMemoryBlocks,
                category: 'obd_labs_tools'
            },
            {
                title: 'Calculate Signature',
                component: OBDLabsCalculateSignature,
                category: 'obd_labs_tools'
            },
            {
                title: 'Get Security Key',
                component: OBDLabsGetSecurityKey,
                category: 'obd_labs_tools'
            },
            {
                title: 'Calculate SwitchOver',
                component: OBDLabsCalculateSwitchOver,
                category: 'obd_labs_tools'
            },
            {
                title: 'CompressFile',
                component: OBDLabsCompressFile,
                category: 'obd_labs_tools'
            },
            {
                title: 'CompressFile V0',
                component: OBDLabsCompressFileV0,
                category: 'obd_labs_tools'
            },
            {
                title: 'Patch & Compress',
                component: OBDLabsPatchAndCompressFile,
                category: 'obd_labs_tools'
            },
            {
                title: 'File Cut',
                component: FileCutTool,
                category: 'file_tools'
            },
            {
                title: 'Nissan/Hitachi Keygen',
                component: NissanKeygen,
                category: 'security_algos'
            },
            {
                title: 'Denso Challenge',
                component: SeedKeyGenerationTool,
                options: {
                    generate: (seed) => SeedKeyAlgos.DensoChallenge(seed),
                    available_configs: [
                        { level: '--', seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'LZMA Compression',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => LZMASerivce.CompressFile(i, o),
                    decompressFile: (i, o) => LZMASerivce.DecompressFile(i, o)
                },
                category: 'compression'
            },
            {
                title: 'VGS4NAG2 Tools',
                component: OBDLabsVGS4NAG2Tools,
                category: 'obd_labs_tools'
            },
            {
                title: 'LZJB Compression',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => LZJBService.CompressFile(i, o),
                    decompressFile: (i, o) => LZJBService.DecompressFile(i, o)
                },
                category: 'compression'
            },
            {
                title: 'LZ77 Compression',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => ExternalProgramsService.lz77(EPActions.Compress, i, o),
                    decompressFile: (i, o) => ExternalProgramsService.lz77(EPActions.Decompress, i, o)
                },
                category: 'compression'
            },
            {
                title: 'GMF Tool',
                category: 'other',
                component: FileProcessingTemplate,
                options: {
                    actions: [
                        { name: 'encrypt', label: 'Encrypt' },
                        { name: 'decrypt', label: 'Decrypt' }
                    ],
                    onencrypt: (i, o) => ExternalProgramsService.GMFEncrypt(i, o),
                    ondecrypt: (i, o) => ExternalProgramsService.GMFDecrypt(i, o),
                }
            },
            {
                title: 'EC_EBL_2.1.0 LZSS',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => ExternalProgramsService.EBECL210_LZSS(EPActions.Compress, i, o),
                    decompressFile: (i, o) => ExternalProgramsService.EBECL210_LZSS(EPActions.Decompress, i, o)
                },
                category: 'compression'
            },
            {
                title: 'ZLIB_SMX',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => ExternalProgramsService.zlib_smx(15, i, o),
                },
                category: 'compression'
            },
            {
                title: 'lzf_smx',
                component: CompressionTemplate,
                options: {
                    compressFile: (i) => ExternalProgramsService.lzf_smx(i),
                    dynamicOutFile: true
                },
                category: 'compression'
            },
            {
                name: 'blocks-unpacker',
                title: 'Blocks Unpacker',
                component: BlocksUnpacker,
                category: 'file_tools'
            },
            // {
            //     title: 'UserLogs Viewer (encrypted file)',
            //     name: 'file_userlogs_viewer',
            //     category: 'other',
            //     component: FileUserLogsViewer,
            // },
            {
                title: 'MED1775_17_29_01_2017201707',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => SeedKeyAlgos.MED1775_17_29_01_2017201707(seed, secLevel),
                    available_configs: [
                        { level: 5, seedLength: 4, keyLength: 4 },
                        { level: 9, seedLength: 8, keyLength: 4 },
                        { level: 11, seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'MED1775AM',
                component: SeedKeyGenerationTool,
                options: {
                    generate: (seed) => RemoteToolsService.MED1775AM_GenerateKey(seed),
                    available_configs: [
                        { level: '--', seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'MED40_12_17_00_20181109051126',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.MED40_12_17_00_20181109051126_GenerateKey(seed, secLevel),
                    available_configs: [
                        { level: 5, seedLength: 4, keyLength: 4 },
                        { level: 11, seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'med177_multi_14_04_01_20193022103018',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.med177_multi_14_04_01_20193022103018_GenerateKey(seed, secLevel),
                    available_configs: [
                        { level: 1, seedLength: 8, keyLength: 4 },
                        { level: 5, seedLength: 8, keyLength: 4 },
                        { level: 9, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'ZLib1',
                component: CompressionTemplate,
                options: {
                    compressFile: (i, o) => ExternalProgramsService.zlib1('compress', i, o),
                    decompressFile: (i, o) => ExternalProgramsService.zlib1('decompress', i, o)
                },
                category: 'compression'
            },
            {
                title: 'infintiMed40_2749001500',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: false,
                    generate: (seed) => RemoteToolsService.infintiMed40_2749001500_GenerateKey(seed),
                    available_configs: [
                        { level: '--', seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'MED40_18_43_01_201802260802',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('MED40_18_43_01_201802260802', seed, secLevel),
                    available_configs: [
                        { level: 1, seedLength: 8, keyLength: 4 },
                        { level: 5, seedLength: 8, keyLength: 4 },
                        { level: 9, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'MRG1_16_18_11_2018442604441',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('MRG1_16_18_11_2018442604441', seed, secLevel),
                    available_configs: [
                        { level: 11, seedLength: 4, keyLength: 4 },
                        { level: 17, seedLength: 4, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'ME97_21_37_01_2021060709065',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('ME97_21_37_01_2021060709065', seed, secLevel),
                    available_configs: [
                        { level: 1, seedLength: 2, keyLength: 2 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'ME97_21_48_05_2021050301054',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('ME97_21_48_05_2021050301054', seed, secLevel),
                    available_configs: [
                        { level: 5, seedLength: 2, keyLength: 2 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'EZS213_18_13_02_20182930072',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('EZS213_18_13_02_20182930072', seed, secLevel),
                    available_configs: [
                        { level: 59, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'EZS167_18_13_01_20182626032',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('EZS167_18_13_01_20182626032', seed, secLevel),
                    available_configs: [
                        { level: 1, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'EZS167_18_19_59_20181830011',
                component: SeedKeyGenerationTool,
                options: {
                    showSecurityAccessLevel: true,
                    generate: (seed, secLevel) => RemoteToolsService.SecAlgo_GenerateKey('EZS167_18_19_59_20181830011', seed, secLevel),
                    available_configs: [
                        { level: 59, seedLength: 8, keyLength: 4 },
                    ]
                },
                category: 'security_algos'
            },
            {
                title: 'IKVM Converter',
                component: IKVMConverterTool,
                category: 'other'
            },
            {
                name: 'blocks-packer',
                title: 'Blocks Packer',
                component: BlocksUnpacker,
                options: {
                    isPacker: true
                },
                category: 'file_tools'
            },
            {
                title: 'DLL Seed-Key',
                component: DLLSeedKey,
                category: 'security_algos'
            },
            {
                title: 'CRC Hack',
                component: CRCHack,
                category: 'file_tools'
            },
        ]
    }),
    methods: {
        openTool(tool){
            this.currentlyOpenTool = tool
            this.dialogopen = true
        },
        buildCategoriesTree(tools){
            const categories = this.categoriesDef.map(c => Object.assign({ tools: [] }, c))
            const categoriesMap = arrayToMap(categories, c => c.id, c => c)
            const len = tools.length
            for(let i = 0; i < len; i++){
                const tool = tools[i]
                const category = categoriesMap[tool.category] || categoriesMap['other']
                category.tools.push(tool)
            }
            return categories
        }
    },
    computed: {
        toolModalTitle(){
            const { category: categoryId, title } = this.currentlyOpenTool
            const category = this.categoriesDef.find(c => c.id === categoryId) || this.categoriesDef.find(c => c.id === 'other')
            return `${category.title} > ${title}`
        },
        displayedTools(){
            if(this.searchInput){
                const s = this.searchInput.trim().toLowerCase()
                const filteredTools = []
                const tools = this.tools;
                const len = tools.length
                for(let i = 0; i < len; i++){
                    const t = tools[i]
                    const n = t.title.toLowerCase()
                    if(n.includes(s)){
                        filteredTools.push(t)
                    }
                }
                return filteredTools
            }else{
                return this.tools
            }
        },
        displayCategories(){
            return this.buildCategoriesTree(this.displayedTools)
        }
    },
    mounted(){
        const { devPage, devSubPage } = window
        if(devPage === 'tools' && typeof devSubPage === 'string'){
            const tool = this.tools.find(t => t.name === devSubPage)
            if(tool){
                this.openTool(tool)
            }
        }
    }
}
</script>

<template>
    <div class="tools-panel">
        <div class="tools-categories">
            <div v-for="category in displayCategories" :key="category.id" class="category">
                <h3>{{ category.title }}</h3>
                <div class="items">
                    <v-btn v-for="t in category.tools" :key="t.title"
                        @click="openTool(t)"
                        elevation="0"
                    >
                        {{ t.title }}
                    </v-btn>
                    <div v-if="category.tools.length == 0" class="nothing-found">
                        ---
                    </div>
                </div>
            </div>
        </div>
        <v-dialog
            v-model="dialogopen"
            fullscreen
            hide-overlay
        >
            <v-card>
                <v-toolbar dark color="primary">
                    <v-btn icon dark @click="dialogopen = false">
                        <v-icon>mdi-close</v-icon>
                    </v-btn>
                    <v-toolbar-title>{{ toolModalTitle }}</v-toolbar-title>
                </v-toolbar>
                <div class="tool-comp-wrapper">
                    <keep-alive>
                        <component v-if="dialogopen" :is="currentlyOpenTool.component" :options="currentlyOpenTool.options" />
                    </keep-alive>
                </div>
            </v-card>
        </v-dialog>
    </div>
</template>


<style lang="scss" scoped>
.tools-panel{
    .tools-categories{
        padding: 1.5rem;
        padding-top: 1rem;
        .category{
            margin-bottom: 1rem;
            h3{
                margin-bottom: 0.3rem;
            }
            .items{
                display: grid;
                grid-template-columns: repeat(2, calc((100% - 22px) / 2));
                grid-column-gap: 3px;
                grid-row-gap: 3px;
            }
            .nothing-found{
                grid-column: span 2;
                opacity: 0.5;
                font-style: italic;
                font-size: 13px;
            }
        }
    }
    .tool-comp-wrapper{
        padding: 1rem;
    }
}
</style>

<style lang="scss">
.tools-panel{
    .tools-categories{
        .v-btn__content{
            justify-content: left !important;
        }
    }
}
</style>