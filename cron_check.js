var cron = require('node-cron');
const publicIp = require('public-ip');
require('dotenv').config();
var shopee = require('./api/shopee.js');

function createAxios() {
    const axios = require('axios');
    return axios.create({ withCredentials: true });
}

mode = process.env.MODE
if(mode == "DEV"){
    var api_url = "http://careads.hotaso.vn/api_user"
}else{
    var api_url = "http://sacuco.com/api_user"
}

slave = process.env.SLAVE
if(!slave){
    slave =  await publicIp.v4()
    console.log("slave : "+ slave);
}

check_all = async () => {
    console.log("------- Start cron check all -------")

    // Lấy dữ diệu các shopee thuôc slave
  
        const Url = api_url+'/getdatashops';
        const result = await axiosInstance.get(Url, {
            headers: {
                cookie: cookie,
                'User-Agent': UserAgent
            },
            proxy: proxy
        }).then(function (response) {
            response.data.status = response.status;
            return response.data;
        }).catch(function (error) {
            if (error.response) {
                error.response.data.status = error.response.status;
                return error.response.data;
            } else {
                return null;
            }
        });
        
    
    // lấy dữ liệu chiến dịch quảng cáo hiện tại

     
   }
   

(async () => {
	await check_all()
})();

// cron 5p/ lần
//cron.schedule('*/5 * * * *', async () => {
//    await check_all()
//  })
