const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
var moment = require('moment');
const NodeRSA = require('node-rsa');
function createAxios() {
    const axios = require('axios');
    return axios.create({ withCredentials: true, timeout: 60000 });
}
const axiosInstance = createAxios();

(async () => {
    let cookie = 'SPC_CDS=9bd112ce-7824-4e14-bf89-db1a97ced5be; UYOMAPJWEMDGJ=; SPC_SC_SA_TK=; SPC_SC_SA_UD=; SC_DFP=fngtSCNHk2wfwaIcEOpxNRBnEwZcQ3x7; SPC_IVS=6a14754e5dd74521a8333167095fa241c1fb5136022f43bd91631951ca5004b9; SPC_F=yTeg2FrPQkMVQZ890RnLwpvOU86aZQNe; _gcl_au=1.1.487058897.1635137771; SPC_SI=mall.ksFGHxDS0MncBqriSjPwmz6wNCcn1iMv; SPC_R_T_ID=9Ayjp8nO/6t3xHO+pHleNST2sm6bBqLSz8+qzuL17ercLy2PHUrTOGMAcF/sHA+u5rJ6hrOYhwUIXLpxytgDlSiIjR4ojxi6y6ufWsS5RyOVXfO4/IQTiqizXaScEWgdBfBCC/g1151KWCwAjrIwvqOPn+lTh37r0WFjO4hSJU0=; SPC_R_T_IV=c2Zmb0VkdHhKY3ZRSTU4Vg==; SPC_T_ID=9Ayjp8nO/6t3xHO+pHleNST2sm6bBqLSz8+qzuL17ercLy2PHUrTOGMAcF/sHA+u5rJ6hrOYhwUIXLpxytgDlSiIjR4ojxi6y6ufWsS5RyOVXfO4/IQTiqizXaScEWgdBfBCC/g1151KWCwAjrIwvqOPn+lTh37r0WFjO4hSJU0=; SPC_T_IV=c2Zmb0VkdHhKY3ZRSTU4Vg==; _fbp=fb.1.1635137771423.68399594; SC_SSO=-; SPC_SC_TK=4e86b93cb5186f77a39f7bbcecc2a85f; SPC_EC="2AiGAnDz6dZXZOVfYmikgR9b0a5OV/mPADFzdvQ8f+TWtn6OqxG/3RG9HBmoSCgyoxg6+nYaHbIDbua9f0RVVhgWkfCCtZrUKmTdYgo9acnN0Bn0qXKOjXrZDpgaQt/V6GtnuXfCp/FfpE8P5nwUvq0ysGS4B5M/CiyAB0obvAY="; SPC_WST="2AiGAnDz6dZXZOVfYmikgR9b0a5OV/mPADFzdvQ8f+TWtn6OqxG/3RG9HBmoSCgyoxg6+nYaHbIDbua9f0RVVhgWkfCCtZrUKmTdYgo9acnN0Bn0qXKOjXrZDpgaQt/V6GtnuXfCp/FfpE8P5nwUvq0ysGS4B5M/CiyAB0obvAY="; SC_SSO_U=-; SPC_SC_UD=480900958; SPC_U=480900958; SPC_STK="J7JFSDk5dvWjjjf0+p87nea/xurkS3zku3vPVEOgYhQsgYbCzXeHrfT3xz8BaXliCcU/Rx2IxF9QOpGDHWBEV1n6X8fY2/f/8fq+5fQNWSAJjYXKQW6EaKOaItAtwx/DpuQbUDLGq+0dHWgeHEleDzLfZYb9X8Vtm1EhnTNcewk="';

    const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
        'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
        '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
        'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
        '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
        'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
        'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
        '-----END RSA PRIVATE KEY-----');
    /*if (cookie != null) {
        cookie = RSA.decrypt(cookie, 'utf8');
    }
    */
    if (cookie != null) {
        cookie = RSA.encrypt(cookie, 'base64');
    }
    //console.log(cookie);
    let res = await shopeeApi.api_get_shop_info('9bd112ce-7824-4e14-bf89-db1a97ced5be', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/97.0.4676.0 Safari/537.36', cookie);
    console.log(res);
})();
