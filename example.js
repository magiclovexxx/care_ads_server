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
    let cookie = 'SC_DFP=xGxNsfV6bx9keff6catOD4vAO1IugPvl; _gcl_au=1.1.1031908319.1635143347; SPC_SI=mall.Zt2Sf3veiDfA1MW5jo4TjR2LEf12JOMk; SPC_IVS=827e09b01c964ec2a8cdbbf6fd28b5d9786e714b83474f339efe3d37d9b75aa3; SPC_R_T_ID=xZ/loqZhCXNsos7Czd+AKKuh5nIkyFLPfBhrbYuzrSys1N7/2iDpKoFrx/tdQphBo6B8Iom9yoIGa9JdraeXmCKVXvct4OBDFINXDvT8HaAVkeKLUr1R4xSExpETa4LibXSZsYFlEedVzgEmZ1IqN9Jl4Xy4K2tYoGfuyE2QvLI=; SPC_R_T_IV=YkhyS2syVmN4elNFbUZxTg==; SPC_T_ID=xZ/loqZhCXNsos7Czd+AKKuh5nIkyFLPfBhrbYuzrSys1N7/2iDpKoFrx/tdQphBo6B8Iom9yoIGa9JdraeXmCKVXvct4OBDFINXDvT8HaAVkeKLUr1R4xSExpETa4LibXSZsYFlEedVzgEmZ1IqN9Jl4Xy4K2tYoGfuyE2QvLI=; SPC_T_IV=YkhyS2syVmN4elNFbUZxTg==; SPC_SC_TK=9608bdc2833515be27fbe94003320f94; SPC_EC="6d0R+9bbgN3NYOZ3+1ROI/pWCXqp0h8Xvnb82gDj3G+bj7EsJ0mkf2gxsHSgws0ws+FTzVwHqzMKtvrVZQlu5TgGWu6m4NAenpTqQ1q1dQwQUDQiy2DJKLP8kslhwI8ssfkQZKru7HJ7uIwyDPuoi4HJBlUz3Ewf+rCAdnIDH7c="; SPC_ST=".M2VQNGN1MkU3V1JLek5mcCRnnhV1se9Z4t5gMqEgLGDf3l+gQZl/wddG3x339TaxQCnw6xfFCtHEVq2yItqf2+TmdxuNkL22BRhPeqUk9lGhZv5xLSeDY6EYwQOdfdGsPdsxEF4S5qsmWb65UZE7J9YcJNkv6R/byFGcrt93ieOTz4gkK37WtY48Rfb1JFFm2Vi113bS8rsikihRS98fSw=="; SPC_WST="6d0R+9bbgN3NYOZ3+1ROI/pWCXqp0h8Xvnb82gDj3G+bj7EsJ0mkf2gxsHSgws0ws+FTzVwHqzMKtvrVZQlu5TgGWu6m4NAenpTqQ1q1dQwQUDQiy2DJKLP8kslhwI8ssfkQZKru7HJ7uIwyDPuoi4HJBlUz3Ewf+rCAdnIDH7c="; SPC_SC_UD=480900958; SPC_U=480900958; SPC_STK="KuMfF3baHRdMnlPbXIXnwW6w2QsWeu1fEluMaRA54b5AFUV9i6EcqdE/7sOgMIAg7ujaq2f1bJN10nv+mvLpMTCgJ7Cdrq+X2KE0J8msaAwuuxMYInZtnT1G+K0dorTV8NlOIUAamvxvd19Eh2RRV1Pt8JhQfubj6JHRQw0onyc="; SPC_CDS=a6c4eaa9-5b25-485b-8662-1ba7ce72945f';

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
