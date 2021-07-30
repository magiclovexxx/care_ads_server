const publicIp = require('public-ip');
require('dotenv').config();
const shopeeApi = require('./api/ads_shopee.js');
const fs = require('fs');
const exec = require('child_process').exec;
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const NodeRSA = require('node-rsa');

const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
    'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
    '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
    'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
    '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
    'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
    'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
    '-----END RSA PRIVATE KEY-----');

function createAxios() {
    const axios = require('axios');
    return axios.create({ withCredentials: true, timeout: 20000 });
}
const axiosInstance = createAxios();

const port = process.env.PORT;
const api_url = "http://api.sacuco.com/api_user";

function api_get_shopee_campaigns(slave_ip, slave_port) {
    const Url = api_url + '/shopee_campaigns?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return axiosInstance.get(Url).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }).catch(function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            return { code: 1000, message: error.code + ' ' + error.message };
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
            return { code: 1000, message: error.code + ' ' + error.message };
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
            return { code: 1000, message: error.code + ' ' + error.message };
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

async function php_update_placements(campaign, update_placements) {
    let result = await api_put_shopee_placements(update_placements);
    if (result.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_placements', result.message);
        return false;
    }
    return true;
}

async function shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, update_keyword_list) {
    let result = await shopeeApi.api_put_marketing_search_ads(spc_cds, proxy, user_agent, cookie,
        { campaignid: campaign.campaignid, placement: (campaign.campaign_type == 'keyword' ? 0 : 3), keyword_list: update_keyword_list });
    if (result.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_marketing_search_ads', result.status, (result.data != null && result.data != '' ? result.data : result.message));
        return false;
    }
    if (result.data != null && result.data != '' && result.data.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_marketing_search_ads', result.data.message);
        return false;
    }
    return true;
}

async function shopee_campaign_ads_list(spc_cds, proxy, user_agent, cookie, campaign, campaign_ads_list) {
    let result = await shopeeApi.api_put_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign_ads_list);
    if (result.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_marketing_campaign', result.status, (result.data != null && result.data != '' ? result.data : result.message));
        return false;
    }
    if (result.data != null && result.data != '' && result.data.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_marketing_campaign', result.data.message);
        return false;
    }
    return true;
}

function getMaxPage(max_location) {
    if (max_location <= 10)
        return 0;
    if (max_location <= 20)
        return 1;
    if (max_location <= 30)
        return 2;
    if (max_location <= 40)
        return 3;
    if (max_location <= 50)
        return 4;
    if (max_location <= 60)
        return 5;

}

async function locationKeyword(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, by, keyword, limit, newest, order) {
    let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4557.4 Safari/537.36';
    //sleep(100);
    let result = await shopeeApi.api_get_search_items_waiting(proxy, user_agent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
    if (result.code != 0) {
        if (result.code == 1000) {
            return locationKeyword(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, by, keyword, limit, newest, order);
        } else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Lỗi api_get_search_items_waiting', result);
            return -1;
        }
    }
    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí:', keyword.normalize('NFC'), newest, max_page);
    if (result.data.items != null) {
        let index = result.data.items.findIndex(x => x.item_basic.itemid == itemid && x.item_basic.shopid == shopid && x.campaignid == campaignid);
        let page = (newest / limit);
        if (index != -1) {
            let ads_location = (index + 1);
            if (ads_location <= (page == 3 ? 6 : 5)) {
                ads_location = ads_location + (page * 10);
                return ads_location;
            } else {
                if (ads_location >= (page == 3 ? 57 : 56)) {
                    ads_location = ads_location - (50 - (page * 10));
                    return ads_location;
                } else {
                    return 999;
                }
            }
        } else {
            if (max_page == 0) {
                return 999;
            } else {
                if (page < max_page) {
                    page = page + 1;
                    newest = newest + limit;
                    return locationKeyword(shopname, shopid, campaignid, itemid, max_page, proxy, result.cookie, by, keyword, limit, newest, order);
                } else {
                    return 999;
                }
            }
        }
    } else {
        return 999;
    }

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

check_all = async () => {
    var is_wait = false;
    var slave_type = 'LIVE';
    try {
        //Khởi động nếu bị treo
        setTimeout(async function () {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Khởi động tiến trình bị treo');
            exec('pm2 restart cron_check');
        }, 300000);

        let slave_ip = await publicIp.v4();
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Thông tin máy chủ JS', slave_ip, port);
        let result = await api_get_shopee_campaigns(slave_ip, port);
        if (result.code != 0) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi api_get_shopee_campaigns', result.message);
            return;
        }
        //check version từ server
        let version = result.data.version
        //check version từ local
        let checkVersion = fs.readFileSync("version.txt", { flag: "as+" });
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Phiên bản hiện tại:', checkVersion.toString());

        //Kiểm tra version và tự động update nếu có version mới
        if (checkVersion.toString() != version) {
            is_wait = true;
            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Cập nhật phiên bản:', version);
            exec('git stash; git pull origin master; npm install; pm2 start server.js -o "/dev/null" -e "/dev/null"; pm2 start cron_check.js -o "/dev/null" -e "/dev/null" ; pm2; startup; pm2 save; pm2 restart all');
            return;
        }

        slave_type = result.data.type;

        let data_campaigns = result.data.campaigns;
        let data_accounts = result.data.accounts;
        let total_placements = result.data.total_placements;

        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng tài khoản:', data_accounts.length);
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng quảng cáo:', data_campaigns.length);
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng từ khóa/vị trí:', total_placements);

        if ((data_accounts.length + data_campaigns.length) > 0) {
            is_wait = true;
            setInterval(function () {
                if (data_accounts.length - data_accounts.filter(x => x.job_done).length == 0
                    && data_campaigns.length - data_campaigns.filter(x => x.job_done).length == 0) {
                    console.log('===== Hoàn thành tiến trình =====');
                    exec('pm2 restart cron_check');
                }
            }, 3000);
        } else {
            return;
        }

        data_accounts.forEach(async function (account) {
            try {
                let spc_cds = account.spc_cds;
                let proxy = {
                    host: account.proxy_ip,
                    port: parseInt(account.proxy_port),
                    auth: {
                        username: account.proxy_username,
                        password: account.proxy_password
                    }
                };
                let user_agent = account.user_agent;
                let username = account.username;
                let password = account.password;
                let cookie = account.cookie;
                let is_need_login = false;
                //Kiểm tra thông tin shop
                //sleep(100);
                let result = await shopeeApi.api_get_shop_info(spc_cds, proxy, user_agent, cookie);
                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_shop_info', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    if (result.code == 999 &&
                        result.status == 403)
                        is_need_login = true;
                    else
                        return;
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Kiểm tra token: OK');
                }

                if (is_need_login) {
                    spc_cds = uuidv4();
                    //sleep(100);
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, cookie, username, password, null, null, null);
                    if (result.status != 200) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_post_login', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        if (result.code == 999) {
                            if (moment(account.last_renew_time).add(10, 'days') < moment() ||
                                result.status == 481 ||
                                result.status == 470 ||
                                result.status == 403 ||
                                result.status == 491 ||
                                result.status == 464 ||
                                result.status == 480) {
                                result = await api_put_shopee_accounts({
                                    id: account.sid,
                                    options: JSON.stringify(result),
                                    status: 0
                                });
                            }
                        }
                        return;
                    }
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Đăng nhập thành công');
                    cookie = result.cookie;
                    result = await api_put_shopee_accounts({
                        id: account.sid,
                        spc_cds: spc_cds,
                        cookie: cookie,
                        options: JSON.stringify(result),
                        last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                        return;
                    }
                }
            } catch (ex) {
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
            } finally {
                account.job_done = true;
            }
        });

        data_campaigns.forEach(async function (campaign) {
            try {
                let spc_cds = campaign.spc_cds;
                let proxy = {
                    host: campaign.proxy_ip,
                    port: parseInt(campaign.proxy_port),
                    auth: {
                        username: campaign.proxy_username,
                        password: campaign.proxy_password
                    }
                };
                let user_agent = campaign.user_agent;
                let username = campaign.username;
                let password = campaign.password;
                let cookie = campaign.cookie;
                let is_need_login = false;

                //Kiểm tra thông tin shop
                //sleep(100);
                let result = await shopeeApi.api_get_shop_info(spc_cds, proxy, user_agent, cookie);

                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_get_shop_info', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    if (result.code == 999 &&
                        result.status == 403)
                        is_need_login = true;
                    else {
                        campaign.job_done = true;
                        return;
                    }
                }

                if (is_need_login) {
                    spc_cds = uuidv4();
                    //sleep(100);
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, cookie, username, password, null, null, null);
                    if (result.status != 200) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_post_login', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        if (result.code == 999) {
                            if (moment(campaign.last_renew_time).add(10, 'days') < moment() ||
                                result.status == 481 ||
                                result.status == 470 ||
                                result.status == 403 ||
                                result.status == 491 ||
                                result.status == 464 ||
                                result.status == 480) {
                                result = await api_put_shopee_accounts({
                                    id: campaign.sid,
                                    options: JSON.stringify(result),
                                    status: 0
                                });
                            }
                        }
                        campaign.job_done = true;
                        return;
                    }
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Đăng nhập thành công');
                    cookie = result.cookie;
                    result = await api_put_shopee_accounts({
                        id: campaign.sid,
                        spc_cds: spc_cds,
                        cookie: cookie,
                        options: JSON.stringify(result),
                        last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss')
                    });
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_put_shopee_accounts', result.message);
                        campaign.job_done = true;
                        return;
                    }
                }

                //Lấy thông tin chiến dịch
                //sleep(100);
                result = await shopeeApi.api_get_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign.campaignid);
                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_marketing_campaign', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    campaign.job_done = true;
                    return;
                }
                if (result.data != null && result.data != '' && result.data.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_marketing_campaign', result.data.message);
                    campaign.job_done = true;
                    return;
                }
                let campaign_ads_list = {
                    campaign_ads_list: [{
                        advertisements: result.data.data.advertisements,
                        campaign: result.data.data.campaign
                    }]
                };
                campaign_ads_list.ads_audit_event = 6;
                if (campaign_ads_list.campaign_ads_list[0].campaign.start_time > moment().unix() ||
                    (campaign_ads_list.campaign_ads_list[0].campaign.end_time != 0 &&
                        campaign_ads_list.campaign_ads_list[0].campaign.end_time < moment().unix()) ||
                    campaign_ads_list.campaign_ads_list[0].campaign.status != 1) {
                    result = await api_put_shopee_campaigns({
                        id: campaign.cid,
                        care_status: 0
                    });
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_campaigns', result.message);
                        campaign.job_done = true;
                        return;
                    }
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tắt care quảng cáo tạm dừng/kết thúc');
                    campaign.job_done = true;
                    return;
                }

                if (campaign.campaign_type == 'keyword' || campaign.campaign_type == 'shop') {
                    //Quảng cáo từ khóa
                    let itemid = null;
                    let adsid = null;
                    let advertisement_keyword = null;
                    let advertisement_auto = null;
                    let placement_list = [];
                    let ads_keyword_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 4);
                    let ads_keyword_manual = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 0);
                    let ads_shop = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 3);
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
                                    id: campaign.cid,
                                    care_status: 0
                                });
                                if (result.code != 0) {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_campaigns ', result.message);
                                }
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tắt care quảng cáo tự động');
                                campaign.job_done = true;
                                return;
                            }
                        }
                        if (ads_keyword_manual.length == 0) {
                            result = await api_put_shopee_campaigns({
                                id: campaign.cid,
                                care_status: 0
                            });
                            if (result.code != 0) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_campaigns', result.message);
                            }
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tắt care quảng cáo không có từ khóa');
                            campaign.job_done = true;
                            return;
                        }
                        advertisement_keyword = ads_keyword_manual[0];
                        itemid = advertisement_keyword != null ? advertisement_keyword.itemid : advertisement_auto.itemid;
                        if (advertisement_keyword != null)
                            placement_list.push(0);
                        if (advertisement_auto != null)
                            placement_list.push(4);
                    }

                    let startDate = moment.unix(campaign_ads_list.campaign_ads_list[0].campaign.start_time).unix();
                    let endDate = moment().endOf('day').unix();

                    if (moment.duration(moment().endOf('day').diff(moment.unix(campaign_ads_list.campaign_ads_list[0].campaign.start_time).startOf('day'))).asDays() > 89) {
                        startDate = moment().subtract(89, 'days').startOf('day').unix();
                    }

                    //sleep(100);
                    result = await shopeeApi.api_get_detail_report_by_keyword(spc_cds, proxy, user_agent, cookie,
                        startDate, endDate, placement_list, 1, 0, itemid, adsid);
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_detail_report_by_keyword', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        campaign.job_done = true;
                        return;
                    }
                    if (result.data != null && result.data != '' && result.data.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_detail_report_by_keyword', result.data.message);
                        campaign.job_done = true;
                        return;
                    }

                    let keyword_reports = result.data.data;
                    if (campaign.placements == 0) {
                        campaign.job_done = true;
                    } else {
                        campaign.placements.forEach(async function (care_keyword, index, array) {
                            try {
                                let filter_keywords = advertisement_keyword.extinfo.keywords.filter(x => x.keyword == care_keyword.keyword_str);
                                let is_next_step = false;
                                if (filter_keywords.length > 0) {
                                    let keyword = filter_keywords[0];
                                    let is_in_schedule = true;
                                    if (care_keyword.care_schedule != null) {
                                        let care_schedule = JSON.parse(care_keyword.care_schedule);
                                        if (!(care_schedule.hourOfDay.indexOf((+moment().format('HH')).toString()) != -1 &&
                                            care_schedule.dayOfWeek.indexOf(moment().day().toString()) != -1 &&
                                            care_schedule.dayOfMonth.indexOf((+moment().format('DD')).toString()) != -1 &&
                                            care_schedule.monthOfYear.indexOf((+moment().format('MM')).toString()) != -1)) {
                                            is_in_schedule = false;
                                        }
                                    }

                                    if (care_keyword.care_status == 3) {
                                        //Từ khóa tạm dừng lập lịch
                                        if (is_in_schedule) {
                                            //Tới giờ lập lịch
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') [Lập lịch] Mở lại');
                                            //Bật lại từ khóa nếu đang bị tắt
                                            is_next_step = true;
                                            if (keyword.status == 0) {
                                                keyword.status = 1;
                                                is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                            }
                                            if (!is_next_step) {
                                                return;
                                            }
                                            is_next_step = await php_update_placements(campaign, [{
                                                id: care_keyword.id,
                                                care_status: 1
                                            }]);
                                            if (!is_next_step) {
                                                return;
                                            }
                                        }
                                    }

                                    let min_price = (campaign.campaign_type == 'keyword' ? (keyword.match_type == 0 ? 400 : 480) : (keyword.match_type == 0 ? 500 : 600));
                                    let max_price = parseFloat(care_keyword.max_price);

                                    if (!is_in_schedule) {
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') [Lập lịch] Ngoài phạm vi');
                                        if (care_keyword.care_out_schedule == 0) {
                                            //Giảm về mức tối thiểu
                                            if (keyword.price > min_price) {
                                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') [Lập lịch] Giảm về mức tối thiểu:', min_price);
                                                keyword.price = min_price;
                                                is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                if (!is_next_step) {
                                                    return;
                                                }
                                            }
                                        } else {
                                            //Tạm dừng từ khóa
                                            if (keyword.status == 1) {
                                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') [Lập lịch] Tạm dừng từ khóa');
                                                keyword.status = 0;
                                                is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                if (!is_next_step) {
                                                    return;
                                                }
                                            }
                                        }
                                        await php_update_placements(campaign, [{
                                            id: care_keyword.id,
                                            care_status: 3
                                        }]);
                                        return;
                                    }
                                    if (care_keyword.care_type == 0) {
                                        //Đấu thầu lãi lỗ
                                        let filter_keyword_reports = keyword_reports.filter(x => x.keyword == keyword.keyword);
                                        let cost = 0;
                                        let direct_gmv = 0;
                                        let direct_order_amount = 0;
                                        let click = 0;
                                        let last_click = parseInt(care_keyword.last_click);
                                        let max_hour = parseInt(care_keyword.max_hour);

                                        if (filter_keyword_reports.length > 0) {
                                            cost = filter_keyword_reports[0].cost;
                                            direct_gmv = filter_keyword_reports[0].direct_gmv;
                                            direct_order_amount = filter_keyword_reports[0].direct_order_amount;
                                            cost = filter_keyword_reports[0].cost;
                                            click = filter_keyword_reports[0].click;
                                        }

                                        let check_win = false;
                                        if (campaign.campaign_type == 'keyword') {
                                            let product_cost = campaign.product_cost * direct_order_amount;
                                            let check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                                            if (check_profit >= 0)
                                                check_win = true;
                                        } else {
                                            if (cost == 0) {
                                                check_win = true;
                                            }
                                            else {
                                                if (direct_gmv != 0) {
                                                    let check_profit = cost / (direct_gmv * campaign.profit_num);
                                                    if (check_profit < 1)
                                                        check_win = true;
                                                }
                                            }
                                        }
                                        if (check_win) {
                                            //Quảng cáo lãi/hòa
                                            if (click == last_click) {
                                                //Không có click
                                                let old_price = keyword.price;
                                                let ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, 0, null, null, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                                if (ads_location != -1) {
                                                    if (ads_location == 1) {
                                                        keyword.price = Math.round(keyword.price * 0.9);
                                                        if (keyword.price < min_price)
                                                            keyword.price = min_price;
                                                    } else {
                                                        keyword.price = Math.round(keyword.price * 1.1);
                                                        if (keyword.price > max_price)
                                                            keyword.price = max_price;
                                                    }

                                                    if (keyword.price != old_price) {
                                                        is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                        if (!is_next_step) {
                                                            return;
                                                        }
                                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tăng giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price);
                                                    }

                                                    if (care_keyword.last_update_loss != null) {
                                                        is_next_step = await php_update_placements(campaign, [{
                                                            id: care_keyword.id,
                                                            last_update_loss: null
                                                        }]);
                                                        if (!is_next_step) {
                                                            return;
                                                        }
                                                    }
                                                }
                                            } else {
                                                //Có click
                                                is_next_step = await php_update_placements(campaign, [{
                                                    id: care_keyword.id,
                                                    last_click: click,
                                                    last_update_click: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                    last_update_loss: null
                                                }]);
                                                if (!is_next_step) {
                                                    return;
                                                }
                                            }

                                        } else {
                                            //Từ khóa cáo lỗ
                                            let is_down_price = false;
                                            if (care_keyword.last_update_loss == null) {
                                                is_next_step = await php_update_placements(campaign, [{
                                                    id: care_keyword.id,
                                                    last_update_loss: moment().format('YYYY-MM-DD HH:mm:ss')
                                                }]);
                                                if (!is_next_step) {
                                                    return;
                                                }
                                                is_down_price = true;
                                            } else {
                                                if (moment(care_keyword.last_update_loss).add(max_hour, 'hours') > moment()) {
                                                    is_down_price = true;
                                                } else {
                                                    //Tắt từ khóa không hiệu quả
                                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tắt từ khóa không hiệu quả');
                                                    keyword.status = 0;
                                                    is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                    if (!is_next_step) {
                                                        return;
                                                    }
                                                    is_next_step = await php_update_placements(campaign, [{
                                                        id: care_keyword.id,
                                                        care_status: 2
                                                    }]);
                                                    if (!is_next_step) {
                                                        return;
                                                    }
                                                    is_down_price = false;
                                                }
                                            }

                                            if (keyword.price > min_price && is_down_price) {
                                                if (last_click != click) {
                                                    //Có click mới
                                                    let old_price = keyword.price;
                                                    keyword.price = Math.round(keyword.price * 0.9);
                                                    if (keyword.price < min_price)
                                                        keyword.price = min_price;

                                                    if (keyword.price != old_price) {
                                                        is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                        if (!is_next_step) {
                                                            return;
                                                        }
                                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giảm giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price);
                                                    }
                                                    is_next_step = await php_update_placements(campaign, [{
                                                        id: care_keyword.id,
                                                        last_click: click,
                                                        last_update_click: moment().format('YYYY-MM-DD HH:mm:ss')
                                                    }]);
                                                    if (!is_next_step) {
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        //Đấu thầu vị trí
                                        let min_location = care_keyword.min_location;
                                        let max_location = care_keyword.max_location;
                                        let max_page = getMaxPage(max_location);
                                        let ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, max_page, null, null, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                        if (ads_location != -1) {
                                            if (ads_location > max_location) {
                                                //Tăng giá thầu
                                                let old_price = keyword.price;
                                                keyword.price = Math.round(keyword.price * 1.1);
                                                if (keyword.price > max_price)
                                                    keyword.price = max_price;
                                                if (keyword.price != old_price) {
                                                    is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                    if (!is_next_step) {
                                                        return;
                                                    }
                                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tăng giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price, 'Location:', ads_location, '>', max_location);
                                                }
                                            } else {
                                                if (ads_location < min_location) {
                                                    //Giảm giá thầu
                                                    if (keyword.price > min_price) {
                                                        let old_price = keyword.price;
                                                        keyword.price = Math.round(keyword.price * 0.9);
                                                        if (keyword.price < min_price)
                                                            keyword.price = min_price;
                                                        if (keyword.price != old_price) {
                                                            is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                            if (!is_next_step) {
                                                                return;
                                                            }
                                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giảm giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price, 'Location:', ads_location, '<', care_keyword.min_location);
                                                        }
                                                    }
                                                }
                                                else {
                                                    //Giữ vị trí
                                                    let old_price = keyword.price;
                                                    if (keyword.price > max_price)
                                                        keyword.price = max_price;

                                                    if (keyword.price != old_price) {
                                                        is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                        if (!is_next_step) {
                                                            return;
                                                        }
                                                    }
                                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giữ vị trí:', old_price, '->', keyword.price, 'Max:', max_price, care_keyword.min_location, '<=', ads_location, '<=', care_keyword.max_location);
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    //Xóa từ khóa không tồn tại
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + care_keyword.keyword_str.normalize('NFC') + ') Xóa từ khóa không tồn tại');
                                    is_next_step = await php_update_placements(campaign, [{
                                        id: care_keyword.id,
                                        status: -1
                                    }]);
                                    if (!is_next_step) {
                                        return;
                                    }
                                }
                            } catch (ex) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
                            }
                            finally {
                                if (index === array.length - 1) {
                                    campaign.job_done = true;
                                }
                            }
                        });
                    }
                } else {
                    //Quảng cáo khám phá
                    let ads_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 8 && x.status == 1);
                    if (ads_auto.length > 0) {
                        //Là quảng cáo tự động => Tắt care
                        result = await api_put_shopee_campaigns({
                            id: campaign.cid,
                            care_status: 0
                        });
                        if (result.code != 0) {
                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi function api_put_shopee_campaigns', result.message);
                        }
                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tắt care quảng cáo tự động');
                        campaign.job_done = true;
                        return;
                    }

                    let ads_placements = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => (x.placement == 1 || x.placement == 2 || x.placement == 5));
                    if (ads_placements.length == 0) {
                        //Tắt care quảng cáo chưa thiết lập
                        result = await api_put_shopee_campaigns({
                            id: campaign.cid,
                            care_status: 0
                        });
                        if (result.code != 0) {
                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_campaigns', result.message);
                        }
                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tắt care quảng cáo chưa thiết lập');
                        campaign.job_done = true;
                        return;
                    }
                    let itemid = ads_placements[0].itemid;
                    let startDate = moment.unix(campaign_ads_list.campaign_ads_list[0].campaign.start_time).unix();
                    let endDate = moment().endOf('day').unix();

                    if (moment.duration(moment().endOf('day').diff(moment.unix(campaign_ads_list.campaign_ads_list[0].campaign.start_time).startOf('day'))).asDays() > 89) {
                        startDate = moment().subtract(89, 'days').startOf('day').unix();
                    }

                    //sleep(100);
                    result = await shopeeApi.api_get_item_report_by_placement(spc_cds, proxy, user_agent, cookie,
                        startDate,
                        endDate, [1, 2, 5, 8], itemid);
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_item_report_by_placement', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        campaign.job_done = true;
                        return;
                    }
                    if (result.data != null && result.data != '' && result.data.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_item_report_by_placement', result.data.message);
                        campaign.job_done = true;
                        return;
                    }

                    let placement_reports = result.data.data;
                    let is_update_campaign = false;
                    let update_placements = [];

                    for (let i = 0; i < campaign.placements.length; i++) {
                        let care_placement = campaign.placements[i];
                        let filter_placements = ads_placements.filter(x => x.placement == care_placement.placement);
                        if (filter_placements.length > 0) {
                            let placement = filter_placements[0];
                            let is_in_schedule = true;
                            if (care_placement.care_schedule != null) {
                                let care_schedule = JSON.parse(care_placement.care_schedule);
                                if (!(care_schedule.hourOfDay.indexOf((+moment().format('HH')).toString()) != -1 &&
                                    care_schedule.dayOfWeek.indexOf(moment().day().toString()) != -1 &&
                                    care_schedule.dayOfMonth.indexOf((+moment().format('DD')).toString()) != -1 &&
                                    care_schedule.monthOfYear.indexOf((+moment().format('MM')).toString()) != -1)) {
                                    is_in_schedule = false;
                                }
                            }

                            if (care_placement.care_status == 3) {
                                //Vị trí tạm dừng lập lịch
                                if (is_in_schedule) {
                                    //Tới giờ lập lịch
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') [Lập lịch] Mở lại');
                                    update_placements.push({
                                        id: care_placement.id,
                                        care_status: 1
                                    });
                                    //Bật lại vị trí nếu đang bị tắt
                                    if (placement.status == 2) {
                                        placement.status = 1;
                                        is_update_campaign = true;
                                    }
                                }
                            }

                            if (!is_in_schedule) {
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') [Lập lịch] Ngoài phạm vi');
                                if (care_placement.care_out_schedule == 0) {
                                    //Điều chỉnh premium về mức tối thiểu
                                    if (placement.extinfo.target.premium_rate > 0) {
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') [Lập lịch] Premium 0%');
                                        placement.extinfo.target.premium_rate = 0;
                                        placement.extinfo.target.price = placement.extinfo.target.base_price;
                                        is_update_campaign = true;
                                    }
                                } else {
                                    //Tạm dừng vị trí
                                    if (placement.status == 1) {
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.filter_placements + ') [Lập lịch] Tạm dừng vị trí');
                                        placement.status = 2;
                                        is_update_campaign = true;
                                    }
                                }
                                update_placements.push({
                                    id: care_placement.id,
                                    care_status: 3
                                });
                                continue;
                            }

                            let filter_placement_reports = placement_reports.filter(x => x.placement == placement.placement);
                            let cost = 0;
                            let direct_gmv = 0;
                            let direct_order_amount = 0;
                            let click = 0;
                            let last_click = parseInt(care_placement.last_click);
                            let max_hour = parseInt(care_placement.max_hour);
                            if (filter_placement_reports.length > 0) {
                                cost = filter_placement_reports[0].cost;
                                direct_gmv = filter_placement_reports[0].direct_gmv;
                                direct_order_amount = filter_placement_reports[0].direct_order_amount;
                                cost = filter_placement_reports[0].cost;
                                click = filter_placement_reports[0].click;
                            }

                            let product_cost = campaign.product_cost * direct_order_amount;
                            let check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                            if (check_profit >= 0) {
                                //Quảng cáo lãi/hòa
                                if (placement.extinfo.target.premium_rate < care_placement.max_price || placement.extinfo.target.premium_rate > care_placement.max_price) {
                                    if (click == last_click) {
                                        //Không có click
                                        placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate + 10;
                                        if (placement.extinfo.target.premium_rate > care_placement.max_price)
                                            placement.extinfo.target.premium_rate = care_placement.max_price;
                                        placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                        is_update_campaign = true;
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Tăng giá thầu:', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)', 'Base:', placement.extinfo.target.base_price);
                                        if (care_placement.last_update_loss != null) {
                                            update_placements.push({
                                                id: care_placement.id,
                                                last_update_loss: null
                                            });
                                        }
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
                                let is_down_price = false;
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
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Tắt vị trí không hiệu quả');
                                        placement.status = 2;
                                        is_update_campaign = true;
                                        is_down_price = false;
                                        update_placements.push({
                                            id: care_placement.id,
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
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Giảm giá thầu: ', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)', 'Base:', placement.extinfo.target.base_price);
                                        update_placements.push({
                                            id: care_placement.id,
                                            last_click: click,
                                            last_update_click: moment().format('YYYY-MM-DD HH:mm:ss')
                                        });
                                    }
                                }
                            }
                        } else {
                            //Xóa vị trí không tồn tại
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + care_placement.placement + ') Xóa vị trí không tồn tại');
                            update_placements.push({
                                id: care_placement.id,
                                status: -1
                            });
                        }
                    }

                    if (is_update_campaign) {
                        let is_next_step = await shopee_campaign_ads_list(spc_cds, proxy, user_agent, cookie, campaign, campaign_ads_list);
                        if (!is_next_step) {
                            campaign.job_done = true;
                            return;
                        }
                    }
                    if (update_placements.length > 0) {
                        await php_update_placements(campaign, update_placements);
                    }
                    campaign.job_done = true;
                }
            } catch (ex) {
                campaign.job_done = true;
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
            }
        });
    } catch (ex) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
        console.log('===== Hoàn thành tiến trình =====');
        setTimeout(async function () {
            exec('pm2 restart cron_check');
        }, (slave_type == 'CRON' ? 3000 : 60000));
    }
    finally {
        if (!is_wait) {
            console.log('===== Hoàn thành tiến trình =====');
            setTimeout(async function () {
                exec('pm2 restart cron_check');
            }, (slave_type == 'CRON' ? 3000 : 60000));
        }
    }
}

(async () => {
    await check_all();
})();
