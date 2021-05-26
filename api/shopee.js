const md5 = require('md5');
const crypto = require('crypto');
const publicIp = require('public-ip');
var shopeeApi = require('../api/ads_shopee.js');

function createAxios() {
    const axios = require('axios');
    return axios.create({ withCredentials: true });
}

function cookieParse(cookie) {
    var result = [];
    for (var i = 0; i < cookie.length; i++)
        result.push(cookie[i].split(';')[0]);
    return result.join('; ');
}

const axiosInstance = createAxios();

//Api shopee


const shopee_cron_check = async(SPC_CDS, UserAgent, cookie) => { 
    console.log(await publicIp.v4());
	// Lấy thông tin tài khoản shopee thuộc sv


}

const shopee_check_ads = async(SPC_CDS, UserAgent, cookie) => {
   
    const Url = 'https://banhang.shopee.vn/api/v2/login/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    cookie = cookie.split('; ')
    for (var i = 0; i < cookie.length; i++) {
        if (cookie[i].indexOf('SPC_EC=') != -1) {
            cookie = cookie[i];
            break;
        }
    }
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {
        response.data.cookie = cookieParse(response.headers['set-cookie']) + '; ' + cookie;
        response.data.status = response.status;
        return response.data;
    }).catch(function(error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            return null;
        }
    });
    return result;
}


module.exports = {
    shopee_check_ads, //check ads,
    shopee_cron_check // cron

}