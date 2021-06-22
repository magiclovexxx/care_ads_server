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
    return axios.create({ timeout: 60000 });
}

var mode = process.env.MODE;
var port = process.env.PORT;
var is_running = false;

if (mode == "DEV") {
    //process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
    var api_url = "http://careads.hotaso.vn/api_user"
} else {
    var api_url = "http://sacuco.com/api_user"
}

function api_get_shopee_accounts(slave_ip, slave_port) {
    const Url = api_url + '/shopee_accounts?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
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
        var slave_ip = await publicIp.v4();
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Thông tin máy chủ JS', slave_ip, port);
        var result = await api_get_shopee_accounts(slave_ip, port);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ PHP thất bại', result);
            return;
        }
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Kết nối máy chủ PHP thành công', api_url);

        //check version từ server
        let version = result.data.version
        //check version từ local
        var checkVersion = fs.readFileSync("version.txt", { flag: "as+" });
        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Phiên bản hiện tại:', checkVersion.toString());

        //Kiểm tra version và tự động update nếu có version mới
        if (checkVersion.toString() != version) {
            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Cập nhật phiên bản:', version)
            if (mode !== "DEV") {
                const myShellScript = exec('git stash; git pull origin master; npm install; pm2 restart server; pm2 restart cron_check');
                myShellScript.stdout.on('data', (data) => {
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', data);
                });
                myShellScript.stderr.on('data', (data) => {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', data);
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
                var proxy = shop.proxy;
                var user_agent = shop.user_agent;
                var username = shop.username;
                var password = shop.password;
                var cookie = shop.cookie;
                var is_need_login = false;
                //Kiểm tra gia hạn token
                if (moment(shop.update_time).add(6, 'hours') < moment()) {
                    result = await shopeeApi.api_get_login(spc_cds, proxy, user_agent, cookie);
                    if (result.status != 200) {
                        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Gia hạn cookie thất bại', result);
                        if (result.code == 999)
                            is_need_login = true;
                        else
                            return;
                    }
                    else {
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Gia hạn cookie thành công');
                        cookie = result.data.cookie;
                        result = await api_put_shopee_accounts({
                            id: shop.id,
                            cookie: cookie
                        });
                        if (result.code != 0) {
                            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie lên máy chủ PHP thất bại', result);
                            return;
                        }
                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie lên máy chủ PHP thành công');
                    }

                }

                //Kiểm tra thông tin shop
                result = await shopeeApi.api_get_shop_info(spc_cds, proxy, user_agent, cookie);
                if (result.code != 0) {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_get_shop_info', result);
                    return;
                }
                if (result.data.code != 0) {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Lỗi kết nối function api_get_shop_info', result.data);
                    if (result.code == 999)
                        is_need_login = true;
                    else
                        return;
                }
                if (is_need_login) {
                    spc_cds = uuidv4();
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, username, password, null);
                    if (result.status != 200) {
                        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Đăng nhập thất bại', result);
                        if (result.code == 999)
                            result = await api_put_shopee_accounts({
                                id: shop.id,
                                status: 0
                            });
                        return;
                    }
                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Đăng nhập thành công');
                    cookie = result.data.cookie;
                    result = await api_put_shopee_accounts({
                        id: shop.id,
                        spc_cds: spc_cds,
                        cookie: cookie
                    });
                    if (result.code != 0) {
                        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Cập nhật cookie thất bại', result);
                        return;
                    }
                }
                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ') Số lượng quảng cáo: ' + shop.campaigns.length);

                shop.campaigns.forEach(async (campaign) => {
                    try {
                        //Lấy thông tin chiến dịch
                        result = await shopeeApi.api_get_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign.campaignid);
                        if (result.code != 0) {
                            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_marketing_campaign', result);
                            return;
                        }
                        if (result.data.code != 0) {
                            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_marketing_campaign', result.data);
                            return;
                        }
                        var campaign_ads_list = {
                            campaign_ads_list: [{
                                advertisements: result.data.data.advertisements,
                                campaign: result.data.data.campaign
                            }]
                        };
                        campaign_ads_list.ads_audit_event = 6;
                        if (campaign_ads_list.campaign_ads_list[0].campaign.start_time > moment().unix() ||
                            (campaign_ads_list.campaign_ads_list[0].campaign.end_time != 0 &&
                                campaign_ads_list.campaign_ads_list[0].campaign.end_time < moment().unix())) {
                            result = await api_put_shopee_campaigns({
                                id: campaign.id,
                                start_time: campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                end_time: campaign_ads_list.campaign_ads_list[0].campaign.end_time,
                                status: campaign_ads_list.campaign_ads_list[0].campaign.status,
                                care_status: 0
                            });
                            if (result.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động thất bại', result);
                                return;
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo không hoạt động thành công');
                            return;
                        }

                        if (campaign_ads_list.campaign_ads_list[0].campaign.status != 1) {
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Quảng cáo đang tạm dừng');
                            return;
                        }

                        var is_update_campaign = false;
                        var update_placements = [];

                        if (campaign.campaign_type == 'keyword' || campaign.campaign_type == 'shop') {
                            //Quảng cáo từ khóa
                            var itemid = null;
                            var adsid = null;
                            var advertisement_keyword = null;
                            var advertisement_auto = null;
                            var placement_list = [];
                            var ads_keyword_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 4);
                            var ads_keyword_manual = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 0);
                            var ads_shop = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 3);
                            if (ads_shop.length > 0) {
                                //Ads Shop
                                advertisement_keyword = ads_shop[0];
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
                                        if (result.code != 0) {
                                            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thất bại', result);
                                        }
                                        console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thành công');
                                        return;
                                    }
                                }
                                if (ads_keyword_manual.length == 0) {
                                    result = await api_put_shopee_campaigns({
                                        id: campaign.id,
                                        care_status: 0
                                    });
                                    if (result.code != 0) {
                                        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo chưa cấu hình từ khóa thất bại', result);
                                    }
                                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo chưa cấu hình từ khóa thành công');
                                    return;
                                }
                                advertisement_keyword = ads_keyword_manual[0];
                                itemid = advertisement_keyword != null ? advertisement_keyword.itemid : advertisement_auto.itemid;
                                if (advertisement_keyword != null)
                                    placement_list.push(0);
                                if (advertisement_auto != null)
                                    placement_list.push(4);
                            }
                            result = await shopeeApi.api_get_detail_report_by_keyword(spc_cds, proxy, user_agent, cookie,
                                campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                moment().unix(), placement_list, 1, 0, itemid, adsid);
                            if (result.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_detail_report_by_keyword', result);
                                return;
                            }
                            if (result.data.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_detail_report_by_keyword', result.data);
                                return;
                            }

                            var keyword_reports = result.data.data;
                            campaign.placements.forEach(async (care_keyword) => {
                                var filter_keywords = advertisement_keyword.extinfo.keywords.filter(x => x.keyword == care_keyword.keyword_base64);
                                if (filter_keywords.length > 0) {
                                    var keyword = filter_keywords[0];
                                    if (care_keyword.care_status == 1
                                        && keyword.status == 1) {
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
                                        var check_win = false;

                                        if (campaign.campaign_type == 'keyword') {
                                            var product_cost = campaign.product_cost * direct_order_amount;
                                            var check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                                            if (check_profit >= 0)
                                                check_win = true;
                                        } else {
                                            if (cost == 0) {
                                                check_win = true;
                                            }
                                            else {
                                                if (direct_gmv != 0) {
                                                    var check_profit = cost / (direct_gmv * campaign.profit_num);
                                                    if (check_profit < 1)
                                                        check_win = true;
                                                }
                                            }
                                        }
                                        if (check_win) {
                                            //Quảng cáo lãi/hòa
                                            if (keyword.price < max_price) {
                                                if (click == last_click) {
                                                    //Không có click
                                                    keyword.price = Math.round(keyword.price * 1.1);
                                                    if (keyword.price > max_price)
                                                        keyword.price = max_price;
                                                    is_update_campaign = true;
                                                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword.normalize('NFC') + ') Tăng giá thầu: ', keyword.price);
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
                                                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword.normalize('NFC') + ') Tắt từ khóa không hiệu quả');
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
                                                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + keyword.keyword.normalize('NFC') + ') Giảm giá thầu:', keyword.price);
                                                    update_placements.push({
                                                        id: care_keyword.id,
                                                        last_click: click,
                                                        price: keyword.price,
                                                        last_update_click: moment().format('YYYY-MM-DD HH:mm:ss')
                                                    });
                                                }
                                            }
                                        }
                                    } else {

                                    }
                                } else {
                                    //Xóa từ khóa không tồn tại
                                    console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + care_keyword.keyword_base64.normalize('NFC') + ') Xóa từ khóa không tồn tại');
                                    update_placements.push({
                                        id: care_keyword.id,
                                        status: -1
                                    });
                                }
                            });
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Số lượng từ khóa đang care: ' + campaign.placements.length + '/' + advertisement_keyword.extinfo.keywords.length);
                        } else {
                            //Quảng cáo khám phá
                            var ads_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 8 && x.status == 1);
                            if (ads_auto.length > 0) {
                                //Là quảng cáo tự động => Tắt care
                                result = await api_put_shopee_campaigns({
                                    id: campaign.id,
                                    care_status: 0
                                });
                                if (result.code != 0) {
                                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thất bại', result);
                                }
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo tự động thành công');
                                return;
                            }

                            var ads_placements = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => (x.placement == 1 || x.placement == 2 || x.placement == 5) && x.status == 1);
                            if (ads_placements.length == 0) {
                                //Tắt care quảng cáo chưa thiết lập
                                result = await api_put_shopee_campaigns({
                                    id: campaign.id,
                                    care_status: 0
                                });
                                if (result.code != 0) {
                                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo chưa thiết lập thất bại', result);
                                }
                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Tắt care quảng cáo chưa thiết lập thành công');
                                return;
                            }
                            var itemid = ads_placements[0].itemid;
                            result = await shopeeApi.api_get_item_report_by_placement(spc_cds, proxy, user_agent, cookie,
                                campaign_ads_list.campaign_ads_list[0].campaign.start_time,
                                moment().unix(), [1, 2, 5, 8], itemid);
                            if (result.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_item_report_by_placement', result);
                                return;
                            }
                            if (result.data.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_get_item_report_by_placement', result.data);
                                return;
                            }
                            var placement_reports = result.data.data;
                            //Duyệt từ khóa kiểm tra lãi lỗ
                            ads_placements.forEach(async (placement) => {
                                var filter_placement_configs = campaign.placements.filter(x => x.placement == placement.placement);
                                if (filter_placement_configs.length > 0) {
                                    var care_placement = filter_placement_configs[0];
                                    var filter_placement_reports = placement_reports.filter(x => x.placement == placement.placement);
                                    var cost = 0;
                                    var direct_gmv = 0;
                                    var direct_order_amount = 0;
                                    var click = 0;
                                    var last_click = parseInt(care_placement.last_click);
                                    var max_hour = parseInt(care_placement.max_hour);
                                    if (filter_placement_reports.length > 0) {
                                        cost = filter_placement_reports[0].cost;
                                        direct_gmv = filter_placement_reports[0].direct_gmv;
                                        direct_order_amount = filter_placement_reports[0].direct_order_amount;
                                        cost = filter_placement_reports[0].cost;
                                        click = filter_placement_reports[0].click;
                                    }

                                    var product_cost = campaign.product_cost * direct_order_amount;
                                    var check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                                    if (check_profit >= 0) {
                                        //Quảng cáo lãi/hòa
                                        if (placement.extinfo.target.premium_rate < 300) {
                                            if (click == last_click) {
                                                //Không có click
                                                placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate + 10;
                                                if (placement.extinfo.target.premium_rate > 300)
                                                    placement.extinfo.target.premium_rate = 300;
                                                placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                                is_update_campaign = true;
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + placement.placement + ') Tăng giá thầu: ', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)');
                                                update_placements.push({
                                                    id: care_placement.id,
                                                    price: placement.extinfo.target.price,
                                                    last_update_loss: null
                                                });
                                            } else {
                                                update_placements.push({
                                                    id: care_placement.id,
                                                    last_click: click,
                                                    last_update_click: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                    last_update_loss: null
                                                });
                                            }
                                        }
                                    } else {
                                        //Vị trí cáo lỗ
                                        var is_down_price = false;
                                        if (care_placement.last_update_loss == null) {
                                            update_placements.push({
                                                id: care_placement.id,
                                                last_update_loss: moment().format('YYYY-MM-DD HH:mm:ss')
                                            });
                                            is_down_price = true;
                                        } else {
                                            if (moment(care_placement.last_update_loss).add(max_hour, 'hours') > moment()) {
                                                is_down_price = true;
                                            } else {
                                                //Tắt ví trí không hiệu quả
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + placement.placement + ') Tắt vị trí không hiệu quả');
                                                placement.status = 2;
                                                is_update_campaign = true;
                                                is_down_price = false;
                                                update_placements.push({
                                                    id: care_placement.id,
                                                    status: 2,
                                                    care_status: 2
                                                });
                                            }
                                        }

                                        if (placement.premium_rate > 0 && is_down_price) {
                                            if (last_click != click) {
                                                //Có click mới
                                                placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate - 10;
                                                if (placement.extinfo.target.premium_rate < 0)
                                                    placement.extinfo.target.premium_rate = 0;
                                                placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                                is_update_campaign = true;
                                                console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ' -> ' + placement.placement + ') Giảm giá thầu: ', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)');
                                                update_placements.push({
                                                    id: care_placement.id,
                                                    last_click: click,
                                                    price: placement.extinfo.target.price,
                                                    last_update_click: moment().format('YYYY-MM-DD HH:mm:ss')
                                                });
                                            }
                                        }
                                    }
                                }
                            });
                        }

                        if (is_update_campaign) {
                            result = await shopeeApi.api_put_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign_ads_list);
                            if (result.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_put_marketing_campaign', result);
                                return;
                            }
                            if (result.data.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi kết nối function api_put_marketing_campaign', result.data);
                                return;
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Cập nhật dữ liệu quảng cáo lên máy chủ Shopee thành công');
                        }

                        if (update_placements.length > 0) {
                            result = await api_put_shopee_placements(update_placements);
                            if (result.code != 0) {
                                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Lỗi cập nhật dữ liệu quảng cáo', result);
                                return;
                            }
                            console.log('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] (' + shop.name + ' -> ' + campaign.campaignid + ') Cập nhật dữ liệu quảng cáo lên máy chủ PHP thành công');
                        }
                    } catch (ex) {
                        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
                    }
                });
            } catch (ex) {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
            }
        });
    } catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] Lỗi ngoại lệ <' + ex + '>');
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
