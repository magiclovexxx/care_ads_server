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

async function check_order_list(spc_cds, proxy, user_agent, cookie, orders, last_order_id, page_number) {
    for (let j = 0; j < orders.length; j++) {
        let order_id = orders[j].order_id;
        if (order_id == last_order_id) {
            return 2;
        }
        let result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
        if (result.code == 0 && result.data.code == 0) {
            if (result.data.data.order_info.package_list.length > 0 &&
                result.data.data.order_info.package_list[0].tracking_info.length > 0 &&
                result.data.data.order_info.package_list[0].tracking_info[0].logistics_status == 201) {
                let ctime = result.data.data.order_info.package_list[0].tracking_info[0].ctime;
                if (moment.unix(ctime).add(7, 'days') >= moment()) {
                    result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                    if (result.code == 0 && result.data.code == 0) {
                        console.log('Đơn hàng hoàn:', order_id, 'Trang:', page_number, 'Thời gian:', moment.unix(ctime).format('MM/DD/YYYY HH:mm:ss'));
                    } else {
                        console.log('Lỗi api_get_one_order');
                        return 1;
                    }
                } else {
                    return 2;
                }
            } else {
                console.log('Đơn hàng hủy:', order_id, 'Trang:', page_number);
            }
        } else {
            console.log('Lỗi api_get_package');
            return 1;
        }
    }
    return 0;
}

(async () => {
    let cookie = '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';
    let user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/95.0.150 Chrome/89.0.4389.150 Safari/537.36';
    let spc_cds = 'e8436d35-5622-4a75-8676-96083baad4fd';
    let proxy = null;

    let last_order_total = 0;
    let last_order_id = 0;

    let result = await shopeeApi.api_get_order_id_list(spc_cds, proxy, user_agent, cookie, 1, 'cancelled_all', 40, 1, 0, false);
    if (result.code == 0 && result.data.code == 0) {
        if (result.data.data.orders.length > 0) {
            let total = result.data.data.page_info.total;
            let first_order_id = result.data.data.orders[0].order_id;
            let continue_check = await check_order_list(spc_cds, proxy, user_agent, cookie, result.data.data.orders, last_order_id, 1);
            let is_error = false;
            if (continue_check == 0) {
                let need_check_page = Math.ceil((total - last_order_total) / 40);
                if (need_check_page > 1) {
                    for (let i = 2; i <= need_check_page; i++) {
                        result = await shopeeApi.api_get_order_id_list(spc_cds, proxy, user_agent, cookie, 1, 'cancelled_all', 40, i, 0, false);
                        if (result.code == 0 && result.data.code == 0) {
                            if (result.data.data.orders.length > 0) {
                                continue_check = await check_order_list(spc_cds, proxy, user_agent, cookie, result.data.data.orders, last_order_id, i);
                                if (continue_check != 0) {
                                    if (continue_check == 1) {
                                        console.log('Lỗi check_order_list');
                                        is_error = true;
                                    }
                                    break;
                                }
                            } else {
                                break;
                            }
                        } else {
                            console.log('Lỗi api_get_order_id_list');
                            is_error = true;
                            break;
                        }
                    }
                }
            } else {
                if (continue_check == 1)
                    is_error = true;
            }
            if (!is_error) {
                console.log('call api set last_order_total =', total);
                console.log('call api set last_order_id =', first_order_id);
            }
        }
    }
})();
