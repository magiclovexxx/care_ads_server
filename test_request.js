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

function request_sacuco(Url) {
    return axiosInstance.get(Url).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }).catch(function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            return { code: 1000, message: error.code + ' ' + error.message };
        }
    });
}

(async () => {
    const { url } = await prompt.get(['url']);
    const { forcount } = await prompt.get(['forcount']);
    for (let i = 0; i < forcount; i++) {
        let start_unix = moment().unix();
        let result = await request_sacuco(url);
        let end_unix = moment().unix();
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Kết quả truy vấn:', i, (end_unix - start_unix) + 's');
    }
})();
