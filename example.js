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
                result = await shopeeApi.api_get_one_order(SPC_CDS, proxy, UserAgent, cookie, order_id);
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
    let SPC_CDS = '892dfad1-f65b-4641-b370-02dd77d35840';
    let proxy = {
        host: '14.225.31.223',
        port: 3128,
        auth: {
            username: 'magic',
            password: 'Admin@123'
        }
    };

    let last_order_total = 0;
    let last_order_id = 0;
    let init_page_num = 2;

    let result = await shopeeApi.api_get_order_id_list(SPC_CDS, proxy, UserAgent, cookie, 1, 'cancelled_all', 40, 1, 0, false);
    if (result.code == 0 &&
        result.data.code == 0 &&
        result.data.data.orders.length > 0) {
        let first_order_id = result.data.data.orders[0].order_id;
        let is_continue_check = await check_order_list(SPC_CDS, proxy, UserAgent, cookie, result.data.data.orders, last_order_id, 1);
        if (is_continue_check) {
            let total = result.data.data.page_info.total;
            let need_check_page = Math.ceil((total - last_order_total) / 40);
            console.log(need_check_page);
            if (need_check_page > 1) {
                for (let i = (init_page_num != 1 ? init_page_num : 2); i <= need_check_page; i++) {
                    result = await shopeeApi.api_get_order_id_list(SPC_CDS, proxy, UserAgent, cookie, 1, 'cancelled_all', 40, i, 0, false);
                    if (result.code == 0 &&
                        result.data.code == 0 &&
                        result.data.data.orders.length > 0) {
                        is_continue_check = await check_order_list(SPC_CDS, proxy, UserAgent, cookie, result.data.data.orders, last_order_id, i);
                        if (init_page_num != 1) {
                            console.log('call api set init_page_num =', i);
                        }
                        if (is_continue_check) {
                            total = result.data.data.page_info.total;
                            need_check_page = Math.ceil((total - last_order_total) / 40);
                        } else {
                            break;
                        }
                    } else {
                        break;
                    }
                }
            }
            if (init_page_num != 1) {
                console.log('call api set init_page_num =', 1);
                console.log('call api set last_order_total =', total);
                console.log('call api set last_order_id =', first_order_id);
            }
        }
    }
})();
