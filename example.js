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
async function check_order_list(SPC_CDS, proxy, UserAgent, cookie, orders, last_order_id, page_number) {
    for (let j = 0; j < orders.length; j++) {
        let order_id = orders[j].order_id;
        if (order_id == last_order_id) {
            return false;
        } else {
            let result = await shopeeApi.api_get_package(SPC_CDS, proxy, UserAgent, cookie, order_id);
            if (result.code == 0 && result.data.code == 0 &&
                result.data.data.order_info.package_list.length > 0 &&
                result.data.data.order_info.package_list[0].tracking_info.length > 0 &&
                result.data.data.order_info.package_list[0].tracking_info[0].logistics_status == 201) {
                let ctime = result.data.data.order_info.package_list[0].tracking_info[0].ctime;
                console.log('Đơn hàng hoàn:', order_id, 'Trang:', page_number, 'Thời gian:', moment.unix(ctime).format('MM/DD/YYYY HH:mm:ss'));
            } else { 
                console.log('Đơn hàng hủy:', order_id, 'Trang:', page_number);
            }
        }
    }
    return true;
}

(async () => {
    let cookie = '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';
    let UserAgent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/95.0.150 Chrome/89.0.4389.150 Safari/537.36';
    let SPC_CDS = '89c1f631-61f0-4ccf-9e3f-ed30edf31fc5';
    let proxy = {
        host: '14.225.31.223',
        port: 3128,
        auth: {
            username: 'magic',
            password: 'Admin@123'
        }
    };

    let last_total = 0;
    let last_order_id = 0;

    let result = await shopeeApi.api_get_order_id_list(SPC_CDS, proxy, UserAgent, cookie, 1, 'cancelled_all', 40, 1, 0, false);
    if (result.code == 0 &&
        result.data.code == 0 &&
        result.data.data.orders.length > 0) {
        let first_order_id = result.data.data.orders[0].order_id;
        let is_continue_check = await check_order_list(SPC_CDS, proxy, UserAgent, cookie, result.data.data.orders, last_order_id, 1);
        if (is_continue_check) {
            let need_check_page = Math.ceil((result.data.data.page_info.total - last_total) / 40);
            if (need_check_page > 1) {
                for (let i = 2; i <= need_check_page; i++) {
                    result = await shopeeApi.api_get_order_id_list(SPC_CDS, proxy, UserAgent, cookie, 1, 'cancelled_all', 40, i, 0, false);
                    if (result.code == 0 &&
                        result.data.code == 0 &&
                        result.data.data.orders.length > 0) {
                        is_continue_check = await check_order_list(SPC_CDS, proxy, UserAgent, cookie, result.data.data.orders, last_order_id, i);
                        if (!is_continue_check) {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
        }
    }
})();
