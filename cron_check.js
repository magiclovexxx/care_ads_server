var cron = require('node-cron');
const publicIp = require('public-ip');
require('dotenv').config();
var shopeeApi = require('./api/ads_shopee.js');
var fs = require('fs');
const axiosInstance = createAxios();
const exec = require('child_process').exec;
var moment = require('moment');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');

function createAxios() {
    const axios = require('axios');
    return axios.create({ timeout: 30000 });
}

mode = process.env.MODE
slave = process.env.SLAVE
var is_running = false;

if (mode == "DEV") {
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var api_url = "http://localhost/api_user"
} else {
    var api_url = "http://sacuco.com/api_user"
}

function api_get_shopee_accounts(slave) {
    const Url = api_url + '/shopee_accounts?slave=' + slave;
    return axiosInstance.get(Url).then(function (response) {
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
}

function api_put_shopee_accounts(data) {
    const Url = api_url + '/shopee_accounts';
    return axiosInstance.put(Url, data).then(function (response) {
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
}


check_all = async () => {
    is_running = true;
    try {
        if (!slave) {
            slave = await publicIp.v4();
        }
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ');
        var result = await api_get_shopee_accounts(slave);

        if (result.code == null) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại');
            return;
        }

        if (result.code == 0) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại <' + result.message + '>');
            return;
        }

        //check version từ server
        let version = result.data.version
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Phiên bản hiện tại: ' + version);

        //check version từ local
        var checkVersion = fs.readFileSync("version.txt", { flag: "as+" });

        //Kiểm tra version và tự động update nếu có version mới
        if (checkVersion != version) {
            console.log("-- Cập nhật phiên bản")
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

        //Dữ liệu của các shop
        let data_shops = result.data.shops;
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Số lượng shop: ' + data_shops.length);

        data_shops.forEach(async (shop) => {
            try {
                var spc_cds = shop.shop_info.spc_cds;
                var proxy = JSON.parse(shop.shop_info.proxy);
                var user_agent = shop.shop_info.user_agent;
                var cookie = shop.shop_info.cookie;
                var is_need_login = false;

                //Kiểm tra gia hạn token
                if (moment(shop.shop_info.update_time).add(1, 'days') < moment()) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Bắt đầu gia hạn cookie');
                    result = await shopeeApi.api_get_login(spc_cds, proxy, user_agent, cookie);
                    if (result == null) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Lỗi kết nối function api_get_login');
                        return;
                    }
                    if (result.status != 200) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Gia hạn cookie thất bại');
                        is_need_login = true;
                    }
                    else {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Gia hạn cookie thành công');
                        cookie = result.cookie;
                        var data = {
                            id: shop.shop_info.id,
                            cookie: cookie
                        };
                        result = await api_put_shopee_accounts(data);
                        if (result.code == null) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Cập nhật cookie thất bại');
                            return;
                        }

                        if (result.code == 0) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Cập nhật cookie thất bại <' + result.message + '>');
                            return;
                        }
                    }

                }

                //Kiểm tra thông tin shop
                result = await shopeeApi.api_get_shop_info(spc_cds, proxy, user_agent, cookie);
                if (result == null) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Lỗi kết nối function api_get_shop_info');
                    return;
                }

                if (result.code != 0) {
                    //Không lấy được thông tin. Kiểm tra lại đăng nhập
                    is_need_login = true;
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Không lấy được thông tin shop');
                }

                if (is_need_login) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.shop_info.name + ') Tiến hành đăng nhập');

                }


            }
            catch (ex) {
                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
            }
        });
    }
    catch (ex) {
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
    }
    finally {
        is_running = false;
    }
}

//cron.schedule('*/1 * * * *', async () => {
//    if (!is_running) {
//        await check_all();
//    }
//});

(async () => {
    if (!is_running) {
        await check_all();
    }
})();
