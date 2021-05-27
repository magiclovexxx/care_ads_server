var cron = require('node-cron');
const publicIp = require('public-ip');
require('dotenv').config();
var shopee = require('./api/shopee.js');
var fs = require('fs');
const axiosInstance = createAxios();
const exec = require('child_process').exec;

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


check_all = async () => {
    console.log("------- Start cron check all -------")

    // Lấy dữ diệu các shopee thuôc slave
    if(!slave){
        slave =  await publicIp.v4()
        console.log("slave : "+ slave);
    }
        const Url = api_url+'/getdatashops?slave='+slave;
        const data = await axiosInstance.get(Url, {
           
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
        
        // Dữ liệu của các shop
        let data_shops = data.shops

        // check version từ server
        let version = data.version

        // check version từ local
        var checkVersion = fs.readFileSync("version.txt", { flag: "as+" });

        // Kiểm tra version và tự động update nếu có version mới
        if(checkVersion != version) {
            console.log("---------- Cập nhật phiên bản ----------")
            if (mode !== "DEV") {
                const myShellScript = exec('update.sh /');
                myShellScript.stdout.on('data', (data) => {
                    // do whatever you want here with data
                });
                myShellScript.stderr.on('data', (data) => {
                    console.error(data);
                });
            }
        }
        
        data_shops.forEach(shop => {
            console.log(shop)
            // lấy dữ liệu chiến dịch quảng cáo hiện tại
            
            // So sánh dữ liệu chiến dịch và điều chỉnh giá thầu


            // Cập nhật chiến dịch

        })
    
    

     
   }
   

(async () => {
	await check_all()
})();

// cron 5p/ lần
//cron.schedule('*/5 * * * *', async () => {
//    await check_all()
//  })
