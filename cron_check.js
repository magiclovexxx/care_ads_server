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
    var api_url = "http://careads.hotaso.vn/api_user"
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

function api_put_shopee_placements(data) {
    const Url = api_url + '/shopee_placements';
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

        var result = await api_get_shopee_accounts(slave);

        if (result == null) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại');
            return;
        }

        if (result.code != 0) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thất bại');
            return;
        }
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ thành công');

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
        //console.log(Buffer.from(JSON.stringify(data_shops)).toString('base64'))
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
                if (moment(shop.update_time).add(6, 'hours') < moment()) {
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
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie lên server thất bại');
                            return;
                        }

                        if (result.code != 0) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie lên server thất bại');
                            return;
                        }
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie lên server thành công');
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
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_get_shop_info');
                    console.log(result);
                }
                if (is_need_login) {
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
                    try {
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
                            result = await api_put_shopee_campaigns({
                                id: campaign.id,
                                start_time: campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                end_time: campaign_ads_list.campaign_ads_list[0].campaign.end_time,
                                status: campaign_ads_list.campaign_ads_list[0].campaign.status,
                                care_status: 0
                            });
                            if (result.code == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động thất bại');
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động thất bại');
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động thành công');

                            return;
                        }

                        var is_update_campaign = false;
                        var update_placements = [];

                        if (campaign.campaign_type == 'keyword' || campaign.campaign_type == 'shop') {
                            //Quảng cáo từ khóa
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
                                        result = await api_put_shopee_campaigns({
                                            id: campaign.id,
                                            care_status: 0
                                        });
                                        if (result.code == null) {
                                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thất bại');
                                        }
                                        if (result.code != 0) {
                                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thất bại');
                                        }

                                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thành công');
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
                            result = await shopeeApi.api_get_detail_report_by_keyword(spc_cds, proxy, user_agent, cookie,
                                campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                moment().unix(), placement_list, 1, 0, itemid, adsid);

                            if (result == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_detail_report_by_time');
                                return;
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Không lấy được dữ liệu báo cáo chiến dịch');
                                return;
                            }
                            var keyword_reports = result.data;
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Số lượng từ khóa đang care: ' + campaign.placements.length + '/' + advertisement_keyword.extinfo.keywords.length);
                            //Duyệt từ khóa kiểm tra lãi lỗ
                            advertisement_keyword.extinfo.keywords.forEach(async (keyword) => {
                                var filter_keyword_configs = campaign.placements.filter(x => x.keyword_base64 == keyword.keyword);
                                if (filter_keyword_configs.length > 0) {
                                    var care_keyword = filter_keyword_configs[0];
                                    var filter_keyword_reports = keyword_reports.filter(x => x.keyword == keyword.keyword);
                                    var cost = 0;
                                    var direct_gmv = 0;
                                    var direct_order_amount = 0;
                                    var click = 0;
                                    var last_click = parseInt(care_keyword.last_click);
                                    var max_price = parseFloat(care_keyword.max_price);
                                    var max_hour = parseInt(care_keyword.max_hour);
                                    var min_price = (campaign.campaign_type == 'keyword' ? (keyword.match_type == 0 ? 400 : 480) : (keyword.match_type == 0 ? 500 : 600));
                                    if (filter_keyword_reports.length > 0) {
                                        cost = filter_keyword_reports[0].cost;
                                        direct_gmv = filter_keyword_reports[0].direct_gmv;
                                        direct_order_amount = filter_keyword_reports[0].direct_order_amount;
                                        cost = filter_keyword_reports[0].cost;
                                        click = filter_keyword_reports[0].click;
                                    }
                                    var product_cost = 0;
                                    if (campaign.campaign_type == 'keyword') {
                                        product_cost = campaign.product_cost * direct_order_amount;
                                    } else {
                                        product_cost = (campaign.product_cost * direct_gmv) / 100;
                                    }

                                    var ros = direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost - cost;
                                    if (ros * campaign.profit_num >= 0) {
                                        //Quảng cáo lãi/hòa
                                        if (keyword.price < max_price) {
                                            if (click == last_click) {
                                                //Không có click
                                                keyword.price = Math.round(keyword.price * 1.1);
                                                if (keyword.price > max_price)
                                                    keyword.price = max_price;
                                                is_update_campaign = true;
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword + ') Tăng giá thầu: ', keyword.price);
                                                update_placements.push({
                                                    id: care_keyword.id,
                                                    price: keyword.price,
                                                    last_update_loss: null
                                                });
                                            } else {
                                                update_placements.push({
                                                    id: care_keyword.id,
                                                    last_click: click,
                                                    last_update_click: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                    last_update_loss: null
                                                });
                                            }
                                        }
                                    } else {
                                        //Từ khóa cáo lỗ
                                        var is_down_price = false;
                                        if (care_keyword.last_update_loss == null) {
                                            update_placements.push({
                                                id: care_keyword.id,
                                                last_update_loss: moment().format('YYYY-MM-DD HH:mm:ss')
                                            });
                                            is_down_price = true;
                                        } else {
                                            if (moment(care_keyword.last_update_loss).add(max_hour, 'hours') > moment()) {
                                                is_down_price = true;
                                            } else {
                                                //Tắt từ khóa không hiệu quả
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword + ') Tắt từ khóa không hiệu quả');
                                                keyword.status = 0;
                                                is_update_campaign = true;
                                                is_down_price = false;
                                                update_placements.push({
                                                    id: care_keyword.id,
                                                    status: 0,
                                                    care_status: 2
                                                });
                                            }
                                        }

                                        if (keyword.price > min_price && is_down_price) {
                                            if (last_click != click) {
                                                //Có click mới
                                                keyword.price = Math.round(keyword.price * 0.9);
                                                if (keyword.price < min_price)
                                                    keyword.price = min_price;
                                                is_update_campaign = true;
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword + ') Giảm giá thầu:', keyword.price);
                                                update_placements.push({
                                                    id: care_keyword.id,
                                                    last_click: click,
                                                    price: keyword.price,
                                                    last_update_click: moment().format('YYYY-MM-DD HH:mm:ss')
                                                });
                                            }
                                        }
                                    }
                                }
                            });

                        } else {
                            //Quảng cáo khám phá
                        }

                        if (update_placements.length > 0) {
                            result = await api_put_shopee_placements(update_placements);
                            if (result.code == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật dữ liệu quảng cáo');
                                return;
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật dữ liệu quảng cáo');
                                return;
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Cập nhật dữ liệu lên server thành công');
                        }

                        if (is_update_campaign) {
                            result = await shopeeApi.api_put_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign_ads_list);
                            if (result == null) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_put_marketing_campaign');
                                return;
                            }
                            if (result.code != 0) {
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_put_marketing_campaign');
                                return;
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Cập nhật dữ liệu lên shopee thành công');
                        }

                    } catch (ex) {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
                    }
                });
            } catch (ex) {
                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
            }
        });
    } catch (ex) {
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
    }
    finally {
        is_running = false;
    }
}

cron.schedule('*/3 * * * *', async () => {
    if (!is_running) {
        await check_all();
    }
});

(async () => {
    if (!is_running) {
        await check_all();
    }
})();
