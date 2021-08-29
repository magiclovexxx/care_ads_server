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
    let cookie = 'PIPGG8M3uoi25mDaFUu5kyzlhodgSclHUfvfaxv/SwmvtfhXJWAotYIRbaCDBYh0cYi4fxsBxJ5KtQfFlwss1SCJa7B5aBmZdSeTMOUkiNkg6JaVUgHKukPWqlitON0GRj2N/lJ+zgVLW/ks6eJq313ZP2PXtmo0+1N7/RIOw9w3rGWYRMjcm16+DqIgiMH4ldvegQ0lDHbPNtMEI5ShubYH9vxYxIjCKdH9x/j7tG72+qbAklbY8X7JLi8wpDiOCk8mTJU1ZdAX6y03IAOLNMbP7z4XdLF8Y8HcL1P8snlFSeQ9AuflIx8DT5PTHUUjGwQBxhiMrV9WLsoow1pg/FFy6aUxV1GrjWMbyWYwQj4loLR4Yzocd6Hj2O9MM4XdWmZj7rPL5n8qyEqL/g3mVxXTjB5WwlPa83OICMkRoN8++/zw2mHkJh0ejyFHKEWpNKrODXv2pepC2DA2oYMj3O+EaMg0Zlq1l3aeRaSj6DcTBRhoATRFZ4UGF2hibycaFfH7/fIofbxnb8eJ5yhkkf8R2Yl4GlOdRkWuwi89H2GhKoSdgmC8p7uWCYQuEVHRyyaADRWWrb9EZnGkJt1N5TkdcHPGTfzP4Eup/5mzcHb4XJv93r8xO2xHMYBpyGLMzSdEd+Ky4r4cel+OUBuqYfqKYqm7qp5PnvaoB+0OfKFRpeTD+d01RJ6a0rGzwkw+KAPtCGKLuliaka0fDO49vuqFurS8xI55YItu3O6Atig1rXaWSfNmFKNh5MEgZQooWXR79W8XeR3Kb60sRyHKpWqxQwfs9UJyXDF6/PoloZ9BiUPT0e2uKCEWrxDYuLTOBpGWq4HHjftei57tZ3nn8BR6JcO4/+7Q7xu5eeMbGMHKHW5yHWs3wYC89Vi9JwVYJKjFclq0nwkYHayneILAmHCff0WIAuvTm/6scqA68u0UGiXwxBQu59++6gScaSts7hqVEUcjJuqTvEUipYegSBgtt2R/KECGICzotXdzLmEAjHCA9ReYgBwL7F7bCeEVVlcePvaV98JqSFeOqD/vmAspiYkwuGVQ4LEKslXYXWJuVqtnfEAhnU3rn/aZpE9qwR6+72Rd47fDNIxAynt5NSkwo6F4bEuK2CpNW8EJpObKAoyGherICu389Wjk9fmzxv8TNniJLqwGXNLvXuOcXdha+FqSgyWzW4R8hgC3cZRh+iWVZa2yGznXRKr6ED1M+DxmpIFxDJ3odBdGW4U/HRhOj+FkKW1/8x29lQm00uCU5xijRYBpgInugzZ1oNN6DD2Mm3jwqfi4QjoUtHuRR/xQyUOJngIkPzhH4kXnhziCivFTdOsEdaaFQVlGWSRfAJ8YIwkiFXDwUVtK4bLXkUUneHOI8TDn94PvXD4cHIiwSFBqaCW1fkbrFGUGnXIq1iEAUvvcIyjWtgZS9dqrwpYIzwPAidJiPefBGU9Z4lxXDGhDmVAVDAIJsGGhiySmkAUHpFK3lwJO13Y9XdyZU/znlxxDkduQpemMwqNNpdo21OMmhdyhKYHRSjpJF04pQKzTP/3/62QaWsTStWl4tP5PRWoO4bnmdLWgOqD2R5VhtaSFBWJxm7ARUA+2HVns48CUxQUyAR+5vDfAcRsyVg/RY7GcujifLnjxGjTl/M6d6WrnNvgAQFnWna7ijwNjsJPulQpYixhesQR6P/oXio+5SLtl8l16pxpfrej1TXA11xuTf93N6KVQ2vRl7JMH0KIzRwmWwNNCa9DF/TUbIXPBuGPqjI9yQTDcYlWmp9fcEHLCc601yVTFbkGsMXRKY5IpmqFdbU4PEk3JT0vqs0GSbJ3BcJVUdjMwXZhV05X7NTC2j8rE3IGDBB71514E58PCjViAn6geKKW1HZk/LVByb0h4dAG2bF4sDKvp/OX2tvtxqnqwetsDW4aZV9X2HfIGH9oEAgcOsfh/sDmqvbm+82SWpdUZIDtLT7RGMRAY3uqI6ACexDn3GwVTkt9j9CEOQ4+DokTKOUkT+JmctZiBjNScBvR3ErKuIWvxNyOF8XYUuo6ZF0ZEPKDKLKo6FK1w5wUqLIlADEJ9iLDxIFs8SvxrcDWEgyP656RWwd/mOx9FGTnFfwGIgfqILsJpr+5YzjpcOCsUy5lDqy70PR60MEdUAWJ//ufhIuryZDKkLSMAQvs/X/1snJyhM9pWZQObDF88vzn7JkdOlO8heXe+gj72/B+8f8HwdgsHxnpICmciAip7qzEkSYq7+dJcgxIWXh14Fg2pVTdbHfOpm+4HsyQVxAXp4/WyG+x0LikBI2A6ciO8mK6muK+3KnPbPKH1uXqQ5sf8YD/mDAHPQbbSiBXf8ojMjmOu2uDNr/VOsLd7EgN6utSInzC65QuoxoVXI8fOYahfo6wE5MZ/6i5K9mfFZVz5FrWJvcVcKXhqywmxiXUanbrut2J0U90AqaEdasEQmn2pV6/uC1iVeioWtchYrWK2eUXmHhzHFZRuGxBMfjcZVQt+iTw+vxa8/JV9zL5CIdJPOY0HqmkiZcWkTzm292ud9JHFBvth2eOiSiYfVZZuV6lO3H2tLJfZU7jvQ0I+TdpDdexccgYrCSFOI82jkI7zeYtCviFlvSHx42DXIt3cAnVyWKp+e+fxrXL5rh8EkUjjjvWZEqfT1kd2WQtFmnN6ZYklHgYvNE6wX8BMXhxKl2UcnbW5JN85HOFq6VyxIgnm02h+FTx0i/WNJsQVAOy76LsWDyhegsNelfXj2ZapAnZdCNGrFq+qi3eIldOyDZWV5nvS9Wwer/l6HHnKFECRh0gsWCwGpYFKTOwVY/huxf3IipHdj50VKcaeCwY/Z60/Y3LH9f78RHPjdgfXq0+M7lWj/R2gMorewZXbtrk4sL6YQCNeuGbR5kDU6gDP0BeYUSVfcW5YJBKvHMpVeMz9aItpkPGCEwwkNDntR47I9zUZymVY0ioAtfpct7ofxyziZlNtW9C1IYfOExwG0PjIQrlpAHMJOko=';
    let user_agent = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 11_1_0) AppleWebKit/537.36 (KHTML, like Gecko) coc_coc_browser/95.0.150 Chrome/89.0.4389.150 Safari/537.36';
    let spc_cds = '32582b2a-00dc-465e-894c-a169595549c0';
    let proxy = null;

    let last_cancel_time = 1629981607;
    let last_cancel_page = 0;
    
    let cancel_page = (last_cancel_page == 0 ? 1 : last_cancel_page);
    let count_cancel_page = 0;
    let first_cancel_time = 0;
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
                        if (last_cancel_page == 0 &&
                            cancel_time < last_cancel_time) {
                            last_cancel_time = first_cancel_time;
                            console.log('update ws last_cancel_time', last_cancel_time, cancel_page);
                            loop_status = 0;
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
                    if (last_cancel_page != 0) {
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
