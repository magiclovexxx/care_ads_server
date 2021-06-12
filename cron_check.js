var cron = require('node-cron');
const publicIp = require('public-ip');
require('dotenv').config();
var shopeeApi = require('./api/ads_shopee.js');
var fs = require('fs');
const axiosInstance = createAxios();
const exec = require('child_process').exec;
var moment = require('moment');
const { SSL_OP_EPHEMERAL_RSA } = require('constants');
const { v4: uuidv4 } = require('uuid');
const { json } = require('body-parser');

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

function api_put_shopee_campaigns(data) {
    const Url = api_url + '/shopee_campaigns';
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

        if (result == null) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại');
            return;
        }

        if (result.code != 0) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại');
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
                var spc_cds = shop.spc_cds;
                var proxy = JSON.parse(shop.proxy);
                var user_agent = shop.user_agent;
                var username = shop.username;
                var password = shop.password;
                var cookie = shop.cookie;
                var is_need_login = false;
                //Kiểm tra gia hạn token
                if (moment(shop.update_time).add(1, 'days') < moment()) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Bắt đầu gia hạn cookie');
                    result = await shopeeApi.api_get_login(spc_cds, proxy, user_agent, cookie);
                    if (result == null) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_get_login');
                        return;
                    }
                    if (result.status != 200) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Gia hạn cookie thất bại');
                        is_need_login = true;
                    }
                    else {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Gia hạn cookie thành công');
                        cookie = result.cookie;
                        result = await api_put_shopee_accounts({
                            id: shop.id,
                            cookie: cookie
                        });
                        if (result == null) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie thất bại');
                            return;
                        }

                        if (result.code != 0) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie thất bại');
                            return;
                        }
                    }

                }
                //Kiểm tra thông tin shop
                result = await shopeeApi.api_get_shop_info(spc_cds, proxy, user_agent, cookie);
                if (result == null) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_get_shop_info');
                    return;
                }
                if (result.code != 0) {
                    //Không lấy được thông tin. Kiểm tra lại đăng nhập
                    is_need_login = true;
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Không lấy được thông tin shop');
                }
                if (is_need_login) {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Tiến hành đăng nhập');
                    spc_cds = uuidv4();
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, username, password, null);
                    if (result == null) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_post_login');
                        return;
                    }
                    if (result.status != 200) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Đăng nhập thất bại <' + result.status + '>');
                        result = await api_put_shopee_accounts({
                            id: shop.id,
                            status: 0
                        });
                        return;
                    }
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Đăng nhập thành công');
                    cookie = result.cookie;
                    result = await api_put_shopee_accounts({
                        id: shop.id,
                        spc_cds: spc_cds,
                        cookie: cookie
                    });
                    if (result.code == null) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie thất bại');
                        return;
                    }
                    if (result.code != 0) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie thất bại');
                        return;
                    }
                }

                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Số lượng quảng cáo: ' + shop.campaigns.length);
                shop.campaigns.forEach(async (campaign) => {
                    /*try {
                        //Lấy thông tin chiến dịch
                        result = await shopeeApi.api_get_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign.campaignid);
                        if (result == null) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_marketing_campaign');
                            return;
                        }
                        if (result.code != 0) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Không lấy được thông tin chiến dịch');
                            return;
                        }
                        var campaign_ads_list = {
                            campaign_ads_list: [{
                                advertisements: result.data.advertisements,
                                campaign: result.data.campaign
                            }]
                        };
                        campaign_ads_list.ads_audit_event = 6;
                        if (campaign_ads_list.campaign_ads_list[0].campaign.status != 1 ||
                            campaign_ads_list.campaign_ads_list[0].campaign.start_time > moment().unix() ||
                            (campaign_ads_list.campaign_ads_list[0].campaign.end_time != 0 &&
                                campaign_ads_list.campaign_ads_list[0].campaign.end_time < moment().unix())) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động');
                            result = await api_put_shopee_campaigns({
                                id: campaign.id,
                                start_time: campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                end_time: campaign_ads_list.campaign_ads_list[0].campaign.end_time,
                                status: campaign_ads_list.campaign_ads_list[0].campaign.status,
                                care_status: 0
                            });
                            if (result.code == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật tắt care quảng cáo');
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật tắt care quảng cáo');
                            }
                            return;
                        }

                        if (campaign.campaign_type == 'keyword' || campaign.campaign_type == 'shop') {
                            var itemid = null;
                            var adsid = null;
                            var advertisement_auto = null;
                            var advertisement_keyword = null;
                            var placement_list = [];
                            var ads_keyword_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 4);
                            var ads_keyword_manual = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 0);
                            var ads_shop = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 3);
                            if (ads_shop.length > 0) {
                                //Ads Shop
                                advertisement_keyword = ads_shop[0];
                                itemid = null;
                                placement_list.push(3);
                                adsid = advertisement_keyword.adsid;
                            } else {
                                //Ads Keyword
                                if (ads_keyword_auto.length > 0) {
                                    advertisement_auto = ads_keyword_auto[0];
                                    if (advertisement_auto.status == 1) {
                                        //Là quảng cáo tự động => Tắt care
                                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động');
                                        result = await api_put_shopee_campaigns({
                                            id: campaign.id,
                                            care_status: 0
                                        });
                                        if (result.code == null) {
                                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật tắt care quảng cáo');
                                        }
                                        if (result.code != 0) {
                                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật tắt care quảng cáo');
                                        }
                                        return;
                                    }
                                }
                                if (ads_keyword_manual.length > 0) {
                                    advertisement_keyword = ads_keyword_manual[0];
                                }
                                itemid = advertisement_keyword != null ? advertisement_keyword.itemid : advertisement_auto.itemid;

                                if (advertisement_keyword != null)
                                    placement_list.push(0);
                                if (advertisement_auto != null)
                                    placement_list.push(4);
                            }
                            result = await shopeeApi.api_get_detail_report_by_time(spc_cds, proxy, user_agent, cookie,
                                campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                moment().unix(), placement_list, 1, itemid, adsid);

                            if (result == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_detail_report_by_time');
                                return;
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Không lấy được dữ liệu báo cáo chiến dịch');
                                return;
                            }
                            //chi phí quảng cáo
                            var total_cost = Math.round(result.data.reduce((a, { cost }) => a + cost, 0));
                            //doanh thu
                            var total_broad_gmv = Math.round(result.data.reduce((a, { broad_gmv }) => a + broad_gmv, 0));
                            //Số lượng sản phẩm
                            var total_broad_order_amount = Math.round(result.data.reduce((a, { broad_order_amount }) => a + broad_order_amount, 0));
                            if (campaign.campaign_type == 'shop')
                                total_broad_order_amount = 1;
                            //Lượt click
                            var total_click = Math.round(result.data.reduce((a, { click }) => a + click, 0));
                            var ros = total_broad_gmv - ((total_broad_gmv * campaign.fix_cost) / 100) - (total_broad_order_amount * campaign.product_cost);
                            if (total_cost <= ros * campaign.profit_num) {
                                //Quảng cáo lãi tăng giá thầu
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Quảng cáo lãi tăng giá thầu ' + total_click);

                            }
                            else {
                                //Quảng cáo lỗ giảm giá thầu
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Quảng cáo lỗ giảm giá thầu ' + total_click);

                            }
                        }
                        else {

                        }

                    }
                    catch (ex) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
                    }*/
                });
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
