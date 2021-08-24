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
    let cookie = 'E7+elN4l2ZFCL47xKz2QcAnKPTn3GLoj8Mkdr/K0/Kheho05/H8WrlidZqmsXx6Utiv7SpKnOcLZ0k2nFub+1mdpemFxJFU6cF+rmaelQPH3UOEMRls0Gr8sWIbirUYRWoNP1RKjbt1evtMF+3tbegykRPpcS4GXkLXth6jxw1ccPiMc33qGSripCEzvuzLhiAR/jAqRW6bTGZ3Ohj2rG9ciuVeMYyzuZCYnpLMfpXUTzk10kIX+cVytGXp9/+E/L/Jc/eSmTbgHOMJYXd+axVxpZkaEUL0jbAb4nsCMvU4m7FTklLJEtQmm3GvWhI4htQiyw1K8iHpN6KfdNVZd+mb0ulh6/CJ6/kv5W1oLFqrTZscqh1c41EhbIbGPg8rc2fSoMQBgpHDz3mjWQBHTdvoB0UOH3DwIUyXXxNgBSCEcNEg4zGypccIbst9+QWyd79rbqaweLh93QtZcY3qXOKzKTOLnx3bcQRoFNQUQ5YPkOc8ISZwyDGcGF0+4nMRaJlD++iktRGzx3TOmtpg7sE0qeGrgE5ZK678smNVnBZk2LJcLRN1vxejfy2UpAHf6BRpqezrfJzUW+TmWF5XLDCg3rJtwkC8fJtPBwFotcopKQdJW4IhMQ5XxPjccmJQItv5L70MQm0DmGVXE6P7iW4DQ4PkCsQdLQyRATWi1dNFHHeYzwaUb0A635ccK8ScIX/kRvX5rZzyiTVSXszM/NggHu7Ts5Hlib6wta65DVfnM/bBsJ5HsR2w3Kigy1uNvEFF4s4ugo2rQrFX//9veiMk+DYfZN0YvKihcbWP1/7LcXYHZjEsJ1O2i2qCFjD0egQQw4s1ufG9PXUYVCicbvi4YG4UMWK3AtBRyQfkn4VMS3DHkUDVZ54t26SlFbystJqwFqgaKhKkizTrJ5mLIeMWo/y9xDbPxx9a/Ty0JSgYsfLrLTOpXOdtfgsEm57eE+Mk6g1ry4nlbUR8Bc4gQVEetRSOehrzrss1jCqcHTQBidUTCGOVz/cB61I4BCLGJBefBy0WSsjCF/Jw/WeKYyDWXoJkSPeyVVdHu13rejyuRvQG0WpjILB/2z4mh952HahrhG6Y2ZK4gs8rpCepDhlgvegRMPNindQRwyQ6E1mto8vMNP0duwJF8j8JkG1claB5HirVsrp37RhLqLc5RJ1+CZw3cpS4gIZnVJdVQrHVSY479Ls09jxTkG1w1uvQ4UgZ7pw+jh/yfioIKduq+FRmfEWjO7AirZNDwOw7uAZyXZkPRiDgqDf5jHWHc8+OvaDLuxzDRkHwpPhee//ZfYj76WnwTNELbLo8C7fMWI4slAN4p2Vh0NGQ2N94VPt3NTLh0A20v3SchXW7cIb8MHF+HH5CJfjI5nuDKX2P3qBUdrenvCX74JQ6/78y60t0ONvsw2DoJLgTrPJ194++TMhOukIf1QC5U1diu1yfZ4twegxjiwf6iAVDNKA8eeFJDGhJQkO8m166Rh7jeH9Xttc0/uqIgWRupUZooXGlDkG3kRegKRh0sNsRICqTwRtB/S7CQ+gXbr5rXFPKrnnKjP4EkAyvQzjzkZOltO9X3JevT4rmMBlePvj2oCjl1Z0c8o1U2fkPSa14Rt0vfBZGqG0kmwUTst7LQQhLjkBPFQnqQ7ExiGM09sW3LWKP2e1QKnIqELBDn1+3UVKccgdqOCVKSTCzr8gv3KVu6yNfycJ9Nmno5diKqeoQBxHVzzijoGjfYRF9YyryAvh1onBog4WlmALMoAGhYY53GJpdm1BgM8pmJFvqV4YsUvmwnFf6+TXrQuuR/ARrDhESnZu4m+Ad/3145Nqeb+On1MvNBGYrUYgwgRRGYSH67CW1t63ONMYXq2AZ6xfJQVBJ/2IqGwDx3agvNz/QQcvDN3dXbagkqAluv4Hqwgt7SXm4IaPAsFBvj47ljsLvgHOjCqF+BUV+dqeI+KMVxmegjzyMJHXJZM9wU+5omnTipkJ7waZllYr16CmJeLNlIooslRWaDzVe8+Di7+Hl2+m+l8nglV3XNOX661yAs3yVnSjeZzlj1H6jnvGJ8pKROsioh6JFUGH3UqR9yi1hLYetPWBC3yoonrSrcQYoqQ52xGTrAyse6DRCiX5qdCUmtHihpAYlVRFaTI9xdw7DEEJoAoY6TDWaLlrQDY7ybVPSw0dl1Ut48jeg7hbbsu67Dy1IS4NgAoV1L45BcWcM1lF+GR7sZ7Y5UJD6EW1JTRKjFdMIBvLAZqEANFGfPsjog/v0XWXOmeqy0zez6qi5MW3py76XPeCm4uD0TtVbDbJobesEDsLzVLYYphq0jh97c6rz2eG1gT5hOBro3Sf9lIqphzgLavCm33enoW2WESRxP2IWxeJiNxp00oMEmE58qLnhGl1n38gnAGdVOX+f/3s1evbeGBfX8D0QwL0t5NT5PKuOu7iYcG9x5tXrreMuotqi8lbKLpICgQuGikrd0gZ2abWC0C6QsEW/tmv4XO8rQegFvIKJJC9YgGLPNnZlD9aldiLWw6L0hLJZS9aZhPJTG5VlEKpaQtqYLNOl3dirB2g8LD0M+P4C/O5vaqcHkv2gBB/CSrGF/Sd0K9liZBVoP7VBrkwAyyEpInvmLZBW9bVieyq1D8knzlyEB4XjMqlS1nN0OnxRbhpcvSPrnluYbeLmoIdYxWUD0Ol+a8Kc0VtBtLylh/9IXW2azSPFCkpoTJ4e1DRLt0bgTO0KUv5zCOLhmW5wojw8W41IFRmymdKqjIFzNM6iyLnnxrr8Am+AmI+ip/Zk2fn2Noxc93TT4DsodJmL95ElQEexSPT8R4tgFMQHaWzOUa2GlV+KVaRx6NXeWEx6BJsWJa9X+uis1mcRujtTm3S+Pnq42AT2dIDQM7xFtRxtNs4pabnJQvDviNVhhej7T6/WHKSJJ3duzNTkMERkMEzItNBqRkXkJ6CM/gPPtxfiLwBxMLHdkbO7Yt5A+3YkniYAgXacE5i47uLBKKu4=';
    let user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/95.0.150 Chrome/89.0.4389.150 Safari/537.36';
    let spc_cds = '795452a9-4594-4398-b854-bd381d510f6b';
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
