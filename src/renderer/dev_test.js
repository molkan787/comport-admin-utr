import { UserlogsParser } from './modules/userlogs/UserlogsParser'
import { VirtualecuConfigGenerator } from './modules/virtualecu/VirtualecuConfigGenerator'
import { RemoteAxios } from './services/remoteAxios'
import Shell from './shell'

export function RunDevTest(){
    // Shell.registerReadyCallback(() => {
    //     console.clear()
    //     RunActuallTest()
    // })
}

async function RunActuallTest(){
    RemoteAxios.setProxy({
        host: '216.185.47.9',
        port: 49155,
        username: 'automasterno1',
        password: 'pnm6GYI3RE'
    })
    const result = await RemoteAxios.get('https://api.amrcomport.com:9086/get-my-ip')
    console.log('result', result)
}