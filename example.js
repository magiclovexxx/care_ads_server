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
    let arr = [
        {
            "id": 334361,
            "flag": 2,
            "description": "Giao hàng thành công",
            "ctime": 1631182505,
            "type": 0,
            "status": 0,
            "logistics_status": 8,
            "logid": 1,
            "system_time": 1631182866
        },
        {
            "id": 329607,
            "flag": 2,
            "description": "Đang giao hàng",
            "ctime": 1631164569,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631165331
        },
        {
            "id": 327226,
            "flag": 2,
            "description": "Đang giao hàng",
            "ctime": 1631151489,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631152387
        },
        {
            "id": 324080,
            "flag": 2,
            "description": "Lấy hàng thành công",
            "ctime": 1631094532,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631132205
        },
        {
            "id": 320357,
            "flag": 2,
            "description": "Lấy hàng thành công",
            "ctime": 1631089291,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631092001
        },
        {
            "id": 316522,
            "flag": 2,
            "description": "Lấy hàng thành công",
            "ctime": 1631020547,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631052524
        },
        {
            "id": 313643,
            "flag": 2,
            "description": "Lấy hàng thành công",
            "ctime": 1631012485,
            "type": 0,
            "status": 0,
            "logistics_status": 6,
            "logid": 1,
            "system_time": 1631012606
        },
        {
            "id": 313641,
            "flag": 2,
            "description": "Đang lấy hàng",
            "ctime": 1631012485,
            "type": 0,
            "status": 0,
            "logistics_status": 3,
            "logid": 1,
            "system_time": 1631012604
        },
        {
            "id": 310586,
            "flag": 2,
            "description": "Người gửi đang chuẩn bị hàng",
            "ctime": 1630986067,
            "type": 0,
            "status": 0,
            "logistics_status": 3,
            "logid": 1,
            "system_time": 1630986067
        }
    ];

    arr.sort((a, b) => { return b.ctime - a.ctime })
    arr.forEach((v) => { delete v.flag; delete v.type; delete v.status; delete v.logid; delete v.system_time; });
    console.log(arr);

})();
