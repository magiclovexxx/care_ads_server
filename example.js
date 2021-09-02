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
    console.log(moment().startOf('day').subtract(7, 'days').format('YYYY-MM-DD HH:mm:ss'));
    return;
    let cookie = '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';
    let user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/95.0.150 Chrome/89.0.4389.150 Safari/537.36';
    let spc_cds = '5f6690fe-3e8d-4627-b022-38fe2913a095';
    let proxy = null;

    let last_cancel_time = 1630256668;
    let last_cancel_page = 14;

    let cancel_page = 1;
    let count_cancel_page = 0;
    let first_cancel_time = 0;
    let disable_check_time = false;
    while (true) {
        let result = await shopeeApi.api_get_order_id_list(spc_cds, proxy, user_agent, cookie, 1, 'cancelled_all', 40, cancel_page, 0, false);
        if (result.code == 0 && result.data.code == 0) {
            if (result.data.data.orders.length > 0) {
                let loop_status = 1;
                let orders = result.data.data.orders;
                for (let i = 0; i < orders.length; i++) {
                    let order_id = orders[i].order_id;
                    result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                    if (result.code == 0 && result.data.code == 0) {
                        let get_one_order = result.data.data;
                        let cancel_time = get_one_order.cancel_time;
                        if (first_cancel_time == 0) {
                            first_cancel_time = cancel_time;
                        }
                        if (!disable_check_time &&
                            cancel_time < last_cancel_time) {
                            disable_check_time = true;
                            last_cancel_time = first_cancel_time;
                            console.log('update ws last_cancel_time = first_cancel_time', last_cancel_time, cancel_page);
                            if (last_cancel_page == 0) {
                                loop_status = 0;
                            } else {
                                count_cancel_page = 0;
                                cancel_page = last_cancel_page;
                                loop_status = 3;
                            }
                            break;
                        }

                        if (last_cancel_time == 0) {
                            last_cancel_time = cancel_time;
                            console.log('update ws last_cancel_time', last_cancel_time, cancel_page);
                        }

                        let cancel_reason_ext = get_one_order.cancel_reason_ext;
                        if (cancel_reason_ext == 202 || cancel_reason_ext == 5) {
                            let order_sn = get_one_order.order_sn;
                            let status = get_one_order.status;
                            for (let n = 0; n < get_one_order.order_items.length; n++) {
                                get_one_order.order_items[n].product.description = null;
                            }
                            let new_cancel_time = moment.unix(cancel_time).format('YYYY-MM-DD HH:mm:ss');
                            result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
                            if (result.code == 0 && result.data.code == 0) {
                                let get_package = result.data.data;
                                if (cancel_reason_ext == 202) {
                                    if (get_package.order_info.package_list.length > 0 &&
                                        get_package.order_info.package_list[0].tracking_info.length > 0 &&
                                        get_package.order_info.package_list[0].tracking_info[0].logistics_status == 201) {
                                        new_cancel_time = moment.unix(get_package.order_info.package_list[0].tracking_info[0].ctime).format('YYYY-MM-DD HH:mm:ss');
                                    } else {
                                        console.log(order_id, 'Hàng hoàn chưa hoàn tất', cancel_page);
                                        continue;
                                    }
                                }
                                console.log(order_id, 'OK', cancel_reason_ext, cancel_page);


                            } else {
                                console.log('error');
                                loop_status = 0;
                                break;
                            }
                        } else {
                            console.log(order_id, 'SKIP', cancel_page, cancel_time);
                        }

                    } else {
                        console.log('error');
                        loop_status = 0;
                        break;
                    }
                }

                if (loop_status != 0) {
                    if (last_cancel_page != 0 && cancel_page > last_cancel_page) {
                        last_cancel_page = cancel_page;
                        console.log('update ws last_cancel_page', last_cancel_page);
                    }
                } else {
                    break;
                }
            } else {
                if (last_cancel_page != 0) {
                    last_cancel_page = 0;
                    console.log('update ws last_cancel_page', last_cancel_page);
                }
                break;
            }
        } else {
            console.log('error');
            break;
        }
        cancel_page++;
        count_cancel_page++;
        if (last_cancel_page != 0 && count_cancel_page >= 3)
            break;
    }

})();
