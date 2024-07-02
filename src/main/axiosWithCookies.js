import axios from 'axios';
import cookie from 'cookie';
// import { wrapper } from 'axios-cookiejar-support';
// import { CookieJar } from 'tough-cookie';

// export const jar = new CookieJar();
// const client = wrapper(axios.create({ jar }));

// export default client

const cookiesStore = new Map();

function storeCookies(response){
    // console.log('response', response)
    const rawcookies = response.headers['set-cookie'] || [];
    for(let rawCookie of rawcookies){
        const entries = Object.entries(cookie.parse(rawCookie))
        for(let entry of entries){
            const [name, value] = entry
            if(name !== 'Path' && name !== 'Expires'){
                cookiesStore.set(name, value)
            }
        }
    }
}

function useCookies(config){
    const cookies = Array.from(cookiesStore.entries()).map(([name, value]) => `${name}=${value};`)
    config.headers.common['cookie'] = cookies
}

axios.interceptors.request.use((config) => {
    // console.log('config', config)
    // config.headers.post['Cookie'] = 'jwt=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJzdWIiOjk2OCwidXNlciI6eyJlbWFpbCI6InRoYWxsQGFtcnR1bmVkLmNvbSIsInJlc2VsbGVyX2lkIjoyNSwidHlwZSI6ImN1c3RvbWVyIn0sImlhdCI6MTY0Nzk1ODAzOTEyNywiZXhwIjoxNjQ3OTY1MjM5fQ.lghn-WhGtB_Lw-2ctIm_WF6_TY-a3KsR5300Cm1-w2E;'
    useCookies(config)
    // console.log('iconfig', config)
    return config
}, (error) => {
    return Promise.reject(error);
})

axios.interceptors.response.use((response) => {
    // console.log('response', response)
    storeCookies(response)
    return response;
}, (error) => {
    return Promise.reject(error);
});

axios.defaults.maxBodyLength = 1024 * 1024 * 32;

export default axios