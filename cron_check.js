const { RRule, RRuleSet, rrulestr } = require('rrule');
const md5 = require('md5');
const publicIp = require('public-ip');
require('dotenv').config();
const fs = require('fs');
const exec = require('child_process').exec;
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const NodeRSA = require('node-rsa');
const os = require("os");
const ShopeeAPI = require('./api/ShopeeAPI.js');
const shopeeApi = new ShopeeAPI(300000);
const HttpClient = require('./api/HttpClient.js');
const { stringify } = require('querystring');
const httpClient = new HttpClient(300000);
const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
    'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
    '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
    'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
    '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
    'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
    'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
    '-----END RSA PRIVATE KEY-----');

const port = process.env.PORT;
const use_host = process.env.USE_HOST;
const hostname = os.hostname();
const api_url = "http://api.sacuco.com/api_user";
var last_request_success = moment();
var proxy_server = null;
var slave_type = 'CRON';
var slave_ip = null;
var change_proxy_pending = false;

function api_get_shopee_campaigns(slave_ip, slave_port, uid) {
    let Url = api_url + '/shopee_campaigns?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    if (uid)
        Url += '&uid=' + uid;
    //Call request get với url để lấy data
    return httpClient.http_request(Url, 'GET').then(function (response) {
        //Webservice API trả về data
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            //Trả về lỗi kết nối
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                //Trường hợp lỗi request time out đợi 3s gọi lại function sẽ hay xảy ra nếu mạng chập chờn (Cả mạng server và client)
                await sleep(3000);
                return api_get_shopee_campaigns(slave_ip, slave_port, uid);
            }
            else {
                //Các lỗi phát sinh khác trả về lỗi
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_get_proxy_ip(slave_ip, proxy_ip) {
    let Url = api_url + '/proxy_ip?slave_ip=' + slave_ip + '&proxy_ip=' + proxy_ip;
    //Call request get với url để lấy data
    return httpClient.http_request(Url, 'GET').then(function (response) {
        //Webservice API trả về data
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            //Trả về lỗi kết nối
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                //Trường hợp lỗi request time out đợi 3s gọi lại function sẽ hay xảy ra nếu mạng chập chờn (Cả mạng server và client)
                await sleep(3000);
                return api_get_proxy_ip(slave_ip, proxy_ip);
            }
            else {
                //Các lỗi phát sinh khác trả về lỗi
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function last_connection(slave_ip, slave_port) {
    const Url = api_url + '/last_connection?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'GET').then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return last_connection(slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function restore_check(id, slave_ip, slave_port) {
    const Url = api_url + '/restore_check?id=' + id + '&slave_ip=' + slave_ip + '&slave_port=' + slave_port;;
    return httpClient.http_request(Url, 'GET').then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return restore_check(id, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_put_shopee_accounts(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_accounts?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_accounts(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_put_shopee_campaigns(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_campaigns?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_campaigns(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_put_shopee_placements(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_placements?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_placements(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_put_shopee_orders(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_orders?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_orders(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}


function api_put_shopee_packages(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_packages?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_packages(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_put_shopee_payments(data, slave_ip, slave_port) {
    const Url = api_url + '/shopee_payments?slave_ip=' + slave_ip + '&slave_port=' + slave_port;
    return httpClient.http_request(Url, 'PUT', null, null, data).then(function (response) {
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return api_put_shopee_payments(data, slave_ip, slave_port);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}


function vpn_post_search_items(proxy, UserAgent, cookie, by, keyword, limit, newest, order) {
    const Url = 'http://192.168.4.1:4000/vpn_post_search_items';
    return httpClient.http_request(Url, 'POST', null, null, {
        proxy: proxy,
        UserAgent: UserAgent,
        cookie: cookie,
        by: by,
        keyword: keyword,
        limit: limit,
        newest: newest,
        order: order
    }).then(function (response) {
        return response.data;
    }, async function (error) {
        if (error.response) {
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                await sleep(3000);
                return vpn_post_search_items(proxy, UserAgent, cookie, by, keyword, limit, newest, order);
            }
            else {
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

async function php_update_placements(campaign, update_placements, slave_ip, slave_port) {
    let result = await api_put_shopee_placements(update_placements, slave_ip, slave_port);
    last_request_success = moment();
    if (result.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_put_shopee_placements', result);
        return false;
    }
    return true;
}

async function shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, update_keyword_list) {
    let result = await shopeeApi.api_put_marketing_search_ads(spc_cds, proxy, user_agent, cookie,
        { campaignid: campaign.campaignid, placement: (campaign.campaign_type == 'keyword' ? 0 : 3), keyword_list: update_keyword_list });
    last_request_success = moment();
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

async function shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, ads_list) {
    let result = await shopeeApi.api_dynamic_request(proxy, user_agent, cookie,
        'https://banhang.shopee.vn/api/marketing/v3/pas/target_ads/?SPC_CDS=' + spc_cds + '&SPC_CDS_VER=2',
        'PUT',
        { campaignid: campaign.campaignid, ads_list: ads_list });
    last_request_success = moment();
    if (result.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi shopee_update_ads_list', result.status, (result.data != null && result.data != '' ? result.data : result.message));
        return false;
    }
    if (result.data != null && result.data != '' && result.data.code != 0) {
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi shopee_update_ads_list', result.data.message);
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

async function locationKeyword(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    return await locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
}

async function locationKeyword_Atosa(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    by = 'pop';
    let start_unix = moment().unix();
    let result = await shopeeApi.api_get_search_items_atosa(proxy, user_agent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
    let end_unix = moment().unix();
    if (result.code != 0) {
        //if (result.code == 1000) {
        if (result.status == 429 || result.status == 403) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Atosa chặn nhiều request -> Shopee');
            return locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        } else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Atosa Request Timeout');
            await sleep(3000);
            return locationKeyword_Atosa(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        }
        //} else {
        //    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Lỗi api_get_search_items_atosa', result);
        //    return -1;
        //}
    }
    last_request_success = moment();
    if (result.data.data.items != null) {
        let index = result.data.data.items.findIndex(x => x.itemid == itemid && x.shopid == shopid && x.campaignid != null);
        let page = (newest / limit);
        if (index != -1) {
            let ads_location = (index + 1);
            if (ads_location <= (page == 3 ? 6 : 5)) {
                ads_location = ads_location + (page * 10);
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                return ads_location;
            } else {
                if (ads_location >= (page == 3 ? 57 : 56)) {
                    ads_location = ads_location - (50 - (page * 10));
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                    return ads_location;
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        } else {
            if (max_page == 0) {
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                return 999;
            } else {
                if (page < max_page) {
                    page = page + 1;
                    newest = newest + limit;
                    return locationKeyword_Atosa(shopname, shopid, campaignid, itemid, max_page, proxy, result.cookie, user_agent, by, keyword, limit, newest, order);
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        }
    } else {
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Atosa:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
        return 999;
    }
}

async function locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    by = 'pop';
    let start_unix = moment().unix();
    let result = await shopeeApi.api_get_search_items_v2(proxy, user_agent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
    let end_unix = moment().unix();
    if (result.code != 0) {
        //if (result.code == 1000) {
        if (result.status == 429 || result.status == 403) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeV2 chặn nhiều request -> Atosa');
            return locationKeyword_Atosa(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        } else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeV2 Request Timeout');
            await sleep(3000);
            return locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        }
        //} else {
        //    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Lỗi api_get_search_items_v2', result);
        //    return -1;
        //}
    }
    last_request_success = moment();
    if (result.data.items != null) {
        let index = result.data.items.findIndex(x => x.itemid == itemid && x.shopid == shopid && x.campaignid != null);
        let page = (newest / limit);
        if (index != -1) {
            let ads_location = (index + 1);
            if (ads_location <= (page == 3 ? 6 : 5)) {
                ads_location = ads_location + (page * 10);
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                return ads_location;
            } else {
                if (ads_location >= (page == 3 ? 57 : 56)) {
                    ads_location = ads_location - (50 - (page * 10));
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                    return ads_location;
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        } else {
            if (max_page == 0) {
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                return 999;
            } else {
                if (page < max_page) {
                    page = page + 1;
                    newest = newest + limit;
                    return locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, result.cookie, user_agent, by, keyword, limit, newest, order);
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        }
    } else {
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeV2:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
        return 999;
    }
}


async function locationKeyword_ShopeeVPN(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    by = 'relevancy';
    let start_unix = moment().unix();
    let result = await vpn_post_search_items(proxy, user_agent, cookie, by, keyword, limit, newest, order);
    let end_unix = moment().unix();
    if (result.code != 0) {
        //if (result.code == 1000) {
        if (result.status == 429 || result.status == 403) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeVPN BLOCK');
            await sleep(10000);
            return locationKeyword_ShopeeVPN(shopname, shopid, campaignid, itemid, max_page, proxy_server, cookie, user_agent, by, keyword, limit, newest, order);
        } else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeVPN Request Timeout');
            await sleep(10000);
            return locationKeyword_ShopeeVPN(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        }
    }
    last_request_success = moment();
    if (result.data.items != null) {
        let index = result.data.items.findIndex(x => x.item_basic.itemid == itemid && x.item_basic.shopid == shopid && x.campaignid == campaignid);
        let page = (newest / limit);
        if (index != -1) {
            let ads_location = (index + 1);
            if (ads_location <= (page == 3 ? 6 : 5)) {
                ads_location = ads_location + (page * 10);
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                return ads_location;
            } else {
                if (ads_location >= (page == 3 ? 57 : 56)) {
                    ads_location = ads_location - (50 - (page * 10));
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                    return ads_location;
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        } else {
            if (max_page == 0) {
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                return 999;
            } else {
                if (page < max_page) {
                    page = page + 1;
                    newest = newest + limit;
                    return locationKeyword_ShopeeVPN(shopname, shopid, campaignid, itemid, max_page, proxy, result.cookie, user_agent, by, keyword, limit, newest, order);
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        }
    } else {
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí ShopeeVPN:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
        return 999;
    }

}

async function locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    by = 'relevancy';
    let start_unix = moment().unix();
    let result = await shopeeApi.api_get_search_items(proxy, user_agent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
    let end_unix = moment().unix();
    if (result.code != 0) {
        let statusCode = result.status;
        //if (result.code == 1000) {
        //if (result.status == 429 || result.status == 403) {
        let is_waiting = false;
        let old_ip = 'N';
        if (proxy != null) {
            old_ip = proxy.host;
        }
        while (change_proxy_pending) {
            await sleep(3000);
            is_waiting = true;
        }
        if (!is_waiting) {
            change_proxy_pending = true;
            result = await api_get_proxy_ip(slave_ip, old_ip);
            if (result.code != 0) {
                change_proxy_pending = false;
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi api_get_proxy_ip', result.message);
                return -1;
            }
            proxy_server = {
                host: result.data.proxy_ip,
                port: parseInt(result.data.proxy_port),
                auth: { username: result.data.proxy_username, password: result.data.proxy_password.replace('\r', '') }
            };
            change_proxy_pending = false;
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Shopee chặn nhiều request (' + statusCode + ') -> Đổi Proxy', old_ip, ' -> ', result.data.proxy_ip);
        }
        await sleep(10000);
        return locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy_server, cookie, user_agent, by, keyword, limit, newest, order);
        /*} else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Shopee Request Timeout');
            await sleep(10000);
            return locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
        }*/
    }
    last_request_success = moment();
    if (result.data.items != null) {
        let index = result.data.items.findIndex(x => x.item_basic.itemid == itemid && x.item_basic.shopid == shopid && x.campaignid == campaignid);
        let page = (newest / limit);
        if (index != -1) {
            let ads_location = (index + 1);
            if (ads_location <= (page == 3 ? 6 : 5)) {
                ads_location = ads_location + (page * 10);
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                return ads_location;
            } else {
                if (ads_location >= (page == 3 ? 57 : 56)) {
                    ads_location = ads_location - (50 - (page * 10));
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', ads_location, max_page);
                    return ads_location;
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        } else {
            if (max_page == 0) {
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                return 999;
            } else {
                if (page < max_page) {
                    page = page + 1;
                    newest = newest + limit;
                    return locationKeyword_Shopee(shopname, shopid, campaignid, itemid, max_page, proxy, result.cookie, user_agent, by, keyword, limit, newest, order);
                } else {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
                    return 999;
                }
            }
        }
    } else {
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Tìm vị trí Shopee:', keyword.normalize('NFC'), (end_unix - start_unix) + 's', '->', 999, max_page);
        return 999;
    }

}

function sleep(ms) {
    return new Promise((resolve) => {
        setTimeout(resolve, ms);
    });
}

run = async () => {

    let is_wait = false;
    let ps_start_time = moment();
    let proxy = null;
    proxy_server = null;
    try {
        if (fs.existsSync('/root/.pm2/logs/cron-check-error.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/cron-check-error.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/cron-check-error.log');
                exec('pm2 restart cron_check;');
                return;
            }
        }
        if (fs.existsSync('/root/.pm2/logs/cron-check-out.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/cron-check-out.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/cron-check-out.log');
                exec('pm2 restart cron_check;');
                return;
            }
        }
        if (fs.existsSync('/root/.pm2/logs/server-error.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/server-error.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/server-error.log');
                exec('pm2 restart server;');
                return;
            }
        }
        if (fs.existsSync('/root/.pm2/logs/server-out.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/server-out.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/server-out.log');
                exec('pm2 restart server;');
                return;
            }
        }
        if (fs.existsSync('/root/.pm2/logs/middleware-error.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/middleware-error.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/middleware-error.log');
                exec('pm2 restart middleware;');
                return;
            }
        }
        if (fs.existsSync('/root/.pm2/logs/middleware-out.log')) {
            const { size } = fs.statSync('/root/.pm2/logs/middleware-out.log');
            if (((size / 1024) / 1024) > 10) {
                fs.unlinkSync('/root/.pm2/logs/middleware-out.log');
                exec('pm2 restart middleware;');
                return;
            }
        }
        const uid = null;
        slave_ip = await publicIp.v4();
        last_request_success = moment();
        if (use_host) {
            slave_ip = hostname;
        }
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Thông tin máy chủ JS', slave_ip, port);
        let result = await api_get_shopee_campaigns(slave_ip, port, uid);
        last_request_success = moment();
        if (result.code != 0) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi api_get_shopee_campaigns', result);
            return;
        }
        //check version từ server
        let version = result.data.version;
        slave_type = result.data.type;
        let clone_user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36';
        //check version từ local
        let checkVersion = fs.readFileSync("version.txt", { flag: "as+" });
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Phiên bản hiện tại:', checkVersion.toString());

        //Kiểm tra version và tự động update nếu có version mới
        if (checkVersion.toString() != version) {
            is_wait = true;
            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Cập nhật phiên bản:', version);
            try {
                exec('git stash; git pull origin master; npm install; pm2 restart all;');
            }
            catch (ex) {
                console.log(ex);
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
            }
            return;
        }

        let data_accounts = result.data.accounts;
        let total_orders = result.data.total_orders;
        let data_campaigns = result.data.campaigns;
        let total_placements = result.data.total_placements;

        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng tài khoản:', data_accounts.length);
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng đơn hàng:', total_orders);
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng quảng cáo:', data_campaigns.length);
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Số lượng từ khóa/vị trí:', total_placements);

        if (data_campaigns.length > 0 && use_host) {
            //Lấy proxy
            result = await api_get_proxy_ip(slave_ip, 'N');
            if (result.code != 0) {
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi api_get_proxy_ip', result.message);
                return;
            }
            proxy_server = {
                host: result.data.proxy_ip,
                port: parseInt(result.data.proxy_port),
                auth: { username: result.data.proxy_username, password: result.data.proxy_password.replace('\r', '') }
            };
            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lấy proxy', result.data.proxy_ip);
        }

        if ((data_accounts.length + data_campaigns.length) > 0) {
            is_wait = true;
            let interval = setInterval(async function () {
                if (data_accounts.length - data_accounts.filter(x => x.job_done).length == 0
                    && data_campaigns.length - data_campaigns.filter(x => x.job_done).length == 0) {
                    clearInterval(interval);
                    result = await last_connection(slave_ip, port);
                    last_request_success = moment();
                    console.log(`---Hoàn thành tiến trình: ${moment().diff(ps_start_time, 'seconds')}s---`);
                    await sleep((slave_type != 'CRON' ? 60000 : 3000));
                    run();
                }
            }, 3000);
        } else {
            result = await last_connection(slave_ip, port);
            last_request_success = moment();
            return;
        }

        data_accounts.forEach(async function (account) {
            try {
                let spc_cds = account.spc_cds;
                let user_agent = account.user_agent;
                let username = account.username;
                let password = account.password;
                let cookie = account.cookie;

                let last_cancel_time = account.last_cancel_time;
                let last_cancel_page = account.last_cancel_page;
                if (last_cancel_page == -1)
                    last_cancel_page = 1;

                let last_complete_time = account.last_complete_time;
                let last_complete_page = account.last_complete_page;
                if (last_complete_page == -1)
                    last_complete_page = 1;

                let last_pay_time = account.last_pay_time;
                let last_pay_page = account.last_pay_page;
                if (last_pay_page == -1)
                    last_pay_page = 1;

                let max_pack_time = account.max_pack_time;
                let min_pack_time = account.min_pack_time;
                let min_pack_blocked = account.min_pack_blocked;

                if (max_pack_time == -1 || min_pack_time == -1) {
                    max_pack_time = 0;
                    min_pack_time = 0;
                    min_pack_blocked = 0;
                }

                let is_need_login = false;
                //Kiểm tra thông tin shop
                let result = await shopeeApi.api_get_login(spc_cds, proxy, user_agent, cookie);
                last_request_success = moment();
                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_login', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    if (result.code == 999 && (result.status == 403 || result.status == 400))
                        is_need_login = true;
                    else
                        return;
                } else {
                    cookie = result.cookie;
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Kiểm tra token: OK');
                    result = await api_put_shopee_accounts({ id: account.sid, cookie: cookie, last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss') }, slave_ip, port);
                    last_request_success = moment();
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                        return;
                    }
                }

                if (is_need_login) {
                    spc_cds = uuidv4();
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, cookie, username, password, null, null, null);
                    last_request_success = moment();
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
                                }, slave_ip, port);
                                last_request_success = moment();
                            }
                        }
                        return;
                    }
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Đăng nhập thành công');
                    cookie = result.cookie;
                    result = await api_put_shopee_accounts({
                        id: account.sid,
                        spc_cds: spc_cds,
                        options: JSON.stringify(result),
                        cookie: cookie,
                        last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss')
                    }, slave_ip, port);
                    last_request_success = moment();
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                        return;
                    }
                }

                //Check restore
                let is_restore_check = false;
                if (account.packages == 1000) {
                    is_restore_check = true;
                }

                //Kiểm tra đón gói đang treo
                for (let i = 0; i < account.packages.length; i++) {
                    let order_id = account.packages[i].order_id;
                    result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        let get_one_order = result.data.data;
                        let order_sn = get_one_order.order_sn;
                        let checksum = md5(JSON.stringify(get_one_order));
                        if (checksum != account.packages[i].checksum) {
                            let status = get_one_order.status;
                            let status_ext = get_one_order.status_ext;
                            let logistics_status = get_one_order.logistics_status;
                            let request_data = {
                                uid: account.uid,
                                shop_id: account.sid,
                                order_id: order_id,
                                checksum: checksum,
                                status: status,
                                status_ext: status_ext,
                                logistics_status: logistics_status
                            };

                            request_data.cancel_reason_ext = get_one_order.cancel_reason_ext;
                            request_data.fulfillment_carrier_name = get_one_order.fulfillment_carrier_name;
                            request_data.channel_id = get_one_order.fulfillment_channel_id;
                            request_data.checkout_carrier_name = get_one_order.checkout_carrier_name;

                            if (get_one_order.ship_by_date != 0) {
                                request_data.ship_by_date = moment.unix(get_one_order.ship_by_date).format('YYYY-MM-DD HH:mm:ss');
                            }

                            if (get_one_order.pickup_time != 0) {
                                request_data.pickup_time = moment.unix(get_one_order.pickup_time).format('YYYY-MM-DD HH:mm:ss');
                            }

                            if (get_one_order.delivery_time != 0) {
                                request_data.delivery_time = moment.unix(get_one_order.delivery_time).format('YYYY-MM-DD HH:mm:ss');
                            }

                            if (get_one_order.complete_time != 0) {
                                request_data.complete_time = moment.unix(get_one_order.complete_time).format('YYYY-MM-DD HH:mm:ss');
                            }

                            if (get_one_order.cancel_time != 0) {
                                request_data.cancel_time = moment.unix(get_one_order.cancel_time).format('YYYY-MM-DD HH:mm:ss');
                            }

                            //GET PACKAGE
                            result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
                            last_request_success = moment();
                            let is_skip_get_package = false;
                            if (!(result.code == 0 && result.data.code == 0)) {
                                request_data.checksum = 'ERROR:package';
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_package', order_id, result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                if (status == 4 || status == 5 || logistics_status == 1 || logistics_status == 3) {
                                    continue;
                                } else {
                                    is_skip_get_package = true;
                                }
                            }
                            if (!is_skip_get_package) {
                                let get_package = result.data.data;
                                let tracking_info = null;
                                if (get_package.order_info.package_list != null &&
                                    get_package.order_info.package_list.length > 0) {
                                    request_data.package_number = get_package.order_info.package_list[0].package_number;
                                    request_data.third_party_tn = get_package.order_info.package_list[0].third_party_tn;
                                    request_data.consignment_no = get_package.order_info.package_list[0].consignment_no;
                                    request_data.package_logistics_status = get_package.order_info.package_list[0].package_logistics_status;
                                    if (get_package.order_info.package_list[0].tracking_info != null &&
                                        get_package.order_info.package_list[0].tracking_info.length > 0) {
                                        tracking_info = get_package.order_info.package_list[0].tracking_info;
                                        tracking_info.forEach((v) => { delete v.flag; delete v.type; delete v.status; delete v.logid; delete v.system_time; });
                                        request_data.tracking_info = JSON.stringify(tracking_info)
                                        request_data.last_logistics_status = tracking_info[0].logistics_status;
                                        request_data.last_logistics_ctime = moment.unix(tracking_info[0].ctime).format('YYYY-MM-DD HH:mm:ss');
                                        request_data.last_logistics_description = tracking_info[0].description;
                                    }
                                }
                                if (tracking_info != null) {
                                    let tracking_info_filter = tracking_info.filter(x => x.logistics_status == 8);
                                    if (tracking_info_filter.length > 0) {
                                        request_data.last_logistics_status = tracking_info_filter[0].logistics_status;
                                        request_data.last_logistics_ctime = moment.unix(tracking_info_filter[0].ctime).format('YYYY-MM-DD HH:mm:ss');
                                        request_data.last_logistics_description = tracking_info_filter[0].description;
                                    } else {
                                        if (request_data.last_logistics_status == 201) {
                                            request_data.refund_time = request_data.last_logistics_ctime;
                                        }
                                    }
                                }
                            }

                            //GET TRANSACTION
                            result = await shopeeApi.api_get_income_transaction_history_detail(spc_cds, proxy, user_agent, cookie, order_id);
                            last_request_success = moment();
                            let is_skip_get_income_transaction_history_detail = false;
                            if (!(result.code == 0 && result.data.code == 0)) {
                                request_data.checksum = 'ERROR:transaction';
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_income_transaction_history_detail', order_id, result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                if (status == 4 || status == 5) {
                                    continue;
                                } else {
                                    is_skip_get_income_transaction_history_detail = true;
                                }
                            }
                            if (!is_skip_get_income_transaction_history_detail) {
                                let income_transaction_history_detail = result.data.data;
                                request_data.service_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.service_fee);
                                request_data.transaction_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.transaction_fee);
                                request_data.commission_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.commission_fee);
                                request_data.seller_voucher = Math.abs(income_transaction_history_detail.buyer_payment_info.seller_voucher);
                                request_data.merchant_subtotal = Math.abs(income_transaction_history_detail.buyer_payment_info.merchant_subtotal);
                                request_data.product_discount_rebate_from_shopee = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.product_discount_rebate_from_shopee);
                                request_data.seller_absorbed_coin_cash_back = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.seller_absorbed_coin_cash_back);
                                request_data.cancel_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.cancel_amount);
                                request_data.product_price = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.product_price);
                                request_data.refund_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.refund_amount);
                                request_data.final_total = request_data.product_price - request_data.seller_voucher + request_data.product_discount_rebate_from_shopee - request_data.service_fee - request_data.transaction_fee - request_data.commission_fee - request_data.refund_amount - request_data.seller_absorbed_coin_cash_back;
                                if (request_data.cancel_reason_ext == 5) {
                                    request_data.final_total = request_data.product_price - request_data.seller_voucher + request_data.product_discount_rebate_from_shopee;
                                }
                            }

                            result = await api_put_shopee_packages([request_data], slave_ip, port);
                            last_request_success = moment();
                            if (result.code != 0) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') Lỗi api_put_shopee_packages', result);
                                continue;
                            }
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') P check order status OK', order_sn);

                        } else {
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') P check order status SKIP', order_sn);
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_one_order', order_id, result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    }
                }

                //Lấy đơn đóng gói
                let pack_page = 1;
                let first_pack_time = 0;

                while (true) {
                    result = await shopeeApi.api_get_package_list(spc_cds, proxy, user_agent, cookie, null, 'confirmed_date_desc', 40, pack_page, 0);
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') api_get_package_list', pack_page);
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        if (result.data.data.package_list.length > 0) {
                            let package_list = result.data.data.package_list;
                            let is_break_while = false;
                            //START FOR
                            for (let i = 0; i < package_list.length; i++) {
                                let order_id = package_list[i].order_id;
                                let ship_by_date = package_list[i].ship_by_date;
                                let shipping_confirm_time = package_list[i].shipping_confirm_time;
                                let pack_time = package_list[i].shipping_confirm_time;
                                let channel_id = package_list[i].channel_id;
                                if (first_pack_time == 0) {
                                    first_pack_time = pack_time;
                                }
                                if (min_pack_time == 0 || max_pack_time == 0) {
                                    min_pack_time = pack_time;
                                    max_pack_time = pack_time;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        min_pack_time: min_pack_time,
                                        max_pack_time: max_pack_time
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        is_break_while = true;
                                        break;
                                    } else {
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Khởi tạo min_pack_time, max_pack_time', min_pack_time);
                                    }
                                }
                                if (pack_time < max_pack_time && min_pack_blocked == 1) {
                                    is_break_while = true;
                                    break;
                                }

                                if (pack_time > min_pack_time && pack_time < max_pack_time && min_pack_blocked == 0) {
                                    continue;
                                }
                                //Lấy thông tin đơn
                                result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                                last_request_success = moment();
                                if (result.code == 0 && result.data.code == 0) {
                                    let get_one_order = result.data.data;
                                    //Lấy thông tin
                                    let order_sn = get_one_order.order_sn;
                                    let buyer_user_id = (get_one_order.buyer_user.user_id != null ? get_one_order.buyer_user.user_id : 0);
                                    let buyer_user_name = get_one_order.buyer_user.user_name;
                                    let buyer_shop_id = (get_one_order.buyer_user.shop_id != null ? get_one_order.buyer_user.shop_id : 0);
                                    let buyer_portrait = get_one_order.buyer_user.portrait;
                                    let create_time = get_one_order.create_time;
                                    let fulfillment_carrier_name = get_one_order.fulfillment_carrier_name;
                                    let checkout_carrier_name = get_one_order.checkout_carrier_name;
                                    let status = get_one_order.status;
                                    let status_ext = get_one_order.status_ext;
                                    let logistics_status = get_one_order.logistics_status;
                                    let package_number = package_list[i].package_number;
                                    let third_party_tn = package_list[i].third_party_tn;
                                    let consignment_no = package_list[i].consignment_no;
                                    let pickup_time = package_list[i].pickup_time;
                                    let parcel_no = package_list[i].parcel_no;
                                    let parcel_price = package_list[i].parcel_price;
                                    let order_items = [];
                                    for (let n = 0; n < get_one_order.order_items.length; n++) {
                                        order_items.push({
                                            item_id: get_one_order.order_items[n].item_id,
                                            sku: get_one_order.order_items[n].item_model.sku,
                                            name: get_one_order.order_items[n].product.name,
                                            image: get_one_order.order_items[n].product.images.length > 0 ? get_one_order.order_items[n].product.images[0] : null,
                                            item_price: get_one_order.order_items[n].item_price,
                                            order_price: get_one_order.order_items[n].order_price,
                                            amount: get_one_order.order_items[n].amount,
                                            rebate_price: get_one_order.order_items[n].item_model.rebate_price,
                                            status: get_one_order.order_items[n].status
                                        });
                                    }

                                    result = await api_put_shopee_packages([{
                                        uid: account.uid,
                                        shop_id: account.sid,
                                        order_id: order_id,
                                        order_sn: order_sn,
                                        create_time: moment.unix(create_time).format('YYYY-MM-DD HH:mm:ss'),
                                        pickup_time: moment.unix(pickup_time).format('YYYY-MM-DD HH:mm:ss'),
                                        ship_by_date: moment.unix(ship_by_date).format('YYYY-MM-DD HH:mm:ss'),
                                        shipping_confirm_time: moment.unix(shipping_confirm_time).format('YYYY-MM-DD HH:mm:ss'),
                                        buyer_user_id: buyer_user_id,
                                        buyer_user_name: buyer_user_name,
                                        buyer_shop_id: buyer_shop_id,
                                        buyer_portrait: buyer_portrait,
                                        fulfillment_carrier_name: fulfillment_carrier_name,
                                        checkout_carrier_name: checkout_carrier_name,
                                        package_number: package_number,
                                        third_party_tn: third_party_tn,
                                        consignment_no: consignment_no,
                                        channel_id: channel_id,
                                        parcel_no: parcel_no,
                                        parcel_price: parcel_price,
                                        order_items: (order_items != null ? JSON.stringify(order_items) : null),
                                        status: status,
                                        status_ext: status_ext,
                                        logistics_status: logistics_status
                                    }], slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') Lỗi api_put_shopee_packages', result);
                                        is_break_while = true;
                                        break;
                                    }

                                    if (pack_time < max_pack_time) {
                                        if (max_pack_time != first_pack_time) {
                                            max_pack_time = first_pack_time;
                                            result = await api_put_shopee_accounts({
                                                id: account.sid,
                                                max_pack_time: max_pack_time
                                            }, slave_ip, port);
                                            last_request_success = moment();
                                            if (result.code != 0) {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                                is_break_while = true;
                                                break;
                                            } else {
                                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật max_pack_time', max_pack_time);
                                            }
                                        }
                                        if (min_pack_blocked == 1) {
                                            is_break_while = true;
                                            break;
                                        }
                                    }

                                    if (pack_time < min_pack_time && min_pack_blocked == 0) {
                                        min_pack_time = pack_time;
                                        result = await api_put_shopee_accounts({
                                            id: account.sid,
                                            min_pack_time: min_pack_time
                                        }, slave_ip, port);
                                        last_request_success = moment();
                                        if (result.code != 0) {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                            is_break_while = true;
                                            break;
                                        } else {
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật min_pack_time', min_pack_time);
                                        }
                                    }

                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ' [' + pack_page + ']) order package', order_sn, moment.unix(pack_time).format('YYYY-MM-DD HH:mm:ss'));

                                } else {
                                    //LỖI
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_one_order', order_id, result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                    is_break_while = true;
                                    break;
                                }
                            }
                            //END FOR
                            if (is_break_while) {
                                break;
                            } else {
                                pack_page++;
                            }
                        } else {
                            max_pack_time = first_pack_time;
                            min_pack_blocked = 1;
                            result = await api_put_shopee_accounts({
                                id: account.sid,
                                max_pack_time: max_pack_time,
                                min_pack_blocked: min_pack_blocked
                            }, slave_ip, port);
                            last_request_success = moment();
                            if (result.code != 0) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                            } else {
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật max_pack_time', max_pack_time, 'min_pack_blocked', min_pack_blocked);
                            }
                            break;
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_package_list', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        break;
                    }
                }

                //Kiểm tra đơn hàng hủy treo
                for (let i = 0; i < account.orders.length; i++) {
                    let order_id = account.orders[i].order_id;
                    let order_sn = account.orders[i].order_sn;

                    result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        let get_package = result.data.data;
                        let last_logistics_status = 0;
                        let last_logistics_ctime = 0;
                        let last_logistics_description = null;
                        let tracking_info = null;

                        let package_number = null;
                        let third_party_tn = null;
                        let consignment_no = null;
                        let package_logistics_status = 0;
                        let refund_time = null;

                        if (get_package.order_info.package_list != null &&
                            get_package.order_info.package_list.length > 0) {
                            package_number = get_package.order_info.package_list[0].package_number;
                            third_party_tn = get_package.order_info.package_list[0].third_party_tn;
                            consignment_no = get_package.order_info.package_list[0].consignment_no;
                            package_logistics_status = get_package.order_info.package_list[0].package_logistics_status;
                            if (get_package.order_info.package_list[0].tracking_info != null &&
                                get_package.order_info.package_list[0].tracking_info.length > 0) {
                                tracking_info = get_package.order_info.package_list[0].tracking_info;
                                //tracking_info.sort((a, b) => { return b.id - a.id });
                                tracking_info.forEach((v) => { delete v.flag; delete v.type; delete v.status; delete v.logid; delete v.system_time; });
                                last_logistics_status = tracking_info[0].logistics_status;
                                last_logistics_ctime = tracking_info[0].ctime;
                                last_logistics_description = tracking_info[0].description;
                            }
                        }

                        if (last_logistics_status != 0) {
                            if (account.orders[i].status == 4) {
                                let tracking_info_filter = tracking_info.filter(x => x.logistics_status == 8);
                                if (tracking_info_filter.length > 0) {
                                    last_logistics_status = tracking_info_filter[0].logistics_status;
                                    last_logistics_ctime = tracking_info_filter[0].ctime;
                                    last_logistics_description = tracking_info_filter[0].description;
                                } else {
                                    if (last_logistics_status == 201) {
                                        refund_time = moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss');
                                    }
                                }
                            } else {
                                let tracking_info_filter = tracking_info.filter(x => x.logistics_status == 201);
                                if (tracking_info_filter.length > 0) {
                                    last_logistics_status = tracking_info_filter[0].logistics_status;
                                    last_logistics_ctime = tracking_info_filter[0].ctime;
                                    last_logistics_description = tracking_info_filter[0].description;
                                    refund_time = moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss');
                                }
                            }
                        }
                        if (last_logistics_status != account.orders[i].last_logistics_status) {
                            result = await api_put_shopee_orders([{
                                uid: account.uid,
                                shop_id: account.sid,
                                order_id: order_id,
                                refund_time: refund_time,
                                last_logistics_status: last_logistics_status,
                                last_logistics_ctime: (last_logistics_ctime != 0 ? moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss') : null),
                                last_logistics_description: last_logistics_description,
                                package_logistics_status: package_logistics_status,
                                package_number: package_number,
                                third_party_tn: third_party_tn,
                                consignment_no: consignment_no,
                                tracking_info: (tracking_info != null ? JSON.stringify(tracking_info) : null)
                            }], slave_ip, port);
                            last_request_success = moment();
                            if (result.code != 0) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') Lỗi api_put_shopee_orders', result);
                                continue;
                            }
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') O check order status OK', order_sn);
                        } else {
                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') O check order status SKIP', order_sn);
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_package', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    }
                }

                //Lấy đơn hàng hủy
                let cancel_page = 1;
                let count_cancel_page = 0;
                let first_cancel_time = 0;
                let disable_check_cancel_time = false;
                while (true) {
                    result = await shopeeApi.api_get_order_id_list(spc_cds, proxy, user_agent, cookie, 1, 'cancelled_complete', 40, cancel_page, 0, false);
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        if (result.data.data.orders.length > 0) {
                            let loop_status = 1;
                            let orders = result.data.data.orders;
                            let total_page = Math.ceil(result.data.data.page_info.total / result.data.data.page_info.page_size);
                            for (let i = 0; i < orders.length; i++) {
                                let order_id = orders[i].order_id;
                                result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                                last_request_success = moment();
                                if (result.code == 0 && result.data.code == 0) {
                                    let get_one_order = result.data.data;
                                    let cancel_time = get_one_order.cancel_time;
                                    if (first_cancel_time == 0) {
                                        first_cancel_time = cancel_time;
                                    }
                                    if (!disable_check_cancel_time &&
                                        cancel_time < last_cancel_time) {
                                        disable_check_cancel_time = true;
                                        if (last_cancel_time != first_cancel_time) {
                                            last_cancel_time = first_cancel_time;
                                            result = await api_put_shopee_accounts({
                                                id: account.sid,
                                                last_cancel_time: last_cancel_time,
                                                cancel_total_page: total_page
                                            }, slave_ip, port);
                                            last_request_success = moment();
                                            if (result.code != 0) {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                                return;
                                            }
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_cancel_time', last_cancel_time);
                                        }
                                        if (last_cancel_page == 0) {
                                            loop_status = 0;
                                            break;
                                        } else {
                                            if (last_cancel_page > 1) {
                                                count_cancel_page = 0;
                                                cancel_page = last_cancel_page;
                                                loop_status = 3;
                                                break;
                                            }
                                        }

                                    }

                                    if (last_cancel_time == 0) {
                                        last_cancel_time = cancel_time;
                                        result = await api_put_shopee_accounts({
                                            id: account.sid,
                                            last_cancel_time: last_cancel_time,
                                            cancel_total_page: total_page
                                        }, slave_ip, port);
                                        last_request_success = moment();
                                        if (result.code != 0) {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                            return;
                                        }
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_cancel_time', last_cancel_time);
                                    }
                                    let order_sn = get_one_order.order_sn;
                                    let delivery_time = get_one_order.delivery_time;
                                    let cancel_reason_ext = get_one_order.cancel_reason_ext;
                                    if (cancel_reason_ext == 202 || cancel_reason_ext == 5) {

                                        let buyer_user_id = (get_one_order.buyer_user.user_id != null ? get_one_order.buyer_user.user_id : 0);
                                        let buyer_user_name = get_one_order.buyer_user.user_name;
                                        let buyer_shop_id = (get_one_order.buyer_user.shop_id != null ? get_one_order.buyer_user.shop_id : 0);

                                        let buyer_portrait = get_one_order.buyer_user.portrait;
                                        let create_time = get_one_order.create_time;
                                        let fulfillment_carrier_name = get_one_order.fulfillment_carrier_name;
                                        let checkout_carrier_name = get_one_order.checkout_carrier_name;

                                        let status = get_one_order.status;
                                        if (moment.unix(cancel_time).startOf('month').add(3, 'months') < moment().startOf('month')) {
                                            last_cancel_page = 0;
                                            result = await api_put_shopee_accounts({
                                                id: account.sid,
                                                last_cancel_page: last_cancel_page
                                            }, slave_ip, port);
                                            last_request_success = moment();
                                            if (result.code != 0) {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                                return;
                                            }
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_cancel_page', last_cancel_page);
                                            loop_status = 2;
                                            break;
                                        } else {
                                            result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
                                            last_request_success = moment();
                                            if (result.code == 0 && result.data.code == 0) {
                                                let get_package = result.data.data;
                                                result = await shopeeApi.api_get_income_transaction_history_detail(spc_cds, proxy, user_agent, cookie, order_id);
                                                last_request_success = moment();
                                                if (result.code == 0 && result.data.code == 0) {
                                                    let income_transaction_history_detail = result.data.data;

                                                    let last_logistics_status = 0;
                                                    let last_logistics_ctime = 0;
                                                    let last_logistics_description = null;
                                                    let tracking_info = null;

                                                    let package_number = null;
                                                    let third_party_tn = null;
                                                    let consignment_no = null;
                                                    let package_logistics_status = 0;
                                                    let refund_time = null;

                                                    if (get_package.order_info.package_list != null &&
                                                        get_package.order_info.package_list.length > 0) {
                                                        package_number = get_package.order_info.package_list[0].package_number;
                                                        third_party_tn = get_package.order_info.package_list[0].third_party_tn;
                                                        consignment_no = get_package.order_info.package_list[0].consignment_no;
                                                        package_logistics_status = get_package.order_info.package_list[0].package_logistics_status;
                                                        if (get_package.order_info.package_list[0].tracking_info != null &&
                                                            get_package.order_info.package_list[0].tracking_info.length > 0) {
                                                            tracking_info = get_package.order_info.package_list[0].tracking_info;
                                                            //tracking_info.sort((a, b) => { return b.id - a.id });
                                                            tracking_info.forEach((v) => { delete v.flag; delete v.type; delete v.status; delete v.logid; delete v.system_time; });
                                                            last_logistics_status = tracking_info[0].logistics_status;
                                                            last_logistics_ctime = tracking_info[0].ctime;
                                                            last_logistics_description = tracking_info[0].description;
                                                        }
                                                    }

                                                    if (cancel_reason_ext == 202) {
                                                        if (last_logistics_status != 0) {
                                                            let tracking_info_filter = tracking_info.filter(x => x.logistics_status == 201);
                                                            if (tracking_info_filter.length > 0) {
                                                                last_logistics_status = tracking_info_filter[0].logistics_status;
                                                                last_logistics_ctime = tracking_info_filter[0].ctime;
                                                                last_logistics_description = tracking_info_filter[0].description;
                                                                refund_time = moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss');
                                                            }
                                                        }
                                                    }
                                                    let service_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.service_fee);
                                                    let transaction_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.transaction_fee);
                                                    let commission_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.commission_fee);
                                                    let seller_voucher = Math.abs(income_transaction_history_detail.buyer_payment_info.seller_voucher);
                                                    let merchant_subtotal = Math.abs(income_transaction_history_detail.buyer_payment_info.merchant_subtotal);
                                                    let product_discount_rebate_from_shopee = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.product_discount_rebate_from_shopee);
                                                    let seller_absorbed_coin_cash_back = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.seller_absorbed_coin_cash_back);
                                                    let cancel_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.cancel_amount);
                                                    let product_price = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.product_price);
                                                    let refund_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.refund_amount);

                                                    let order_items = [];
                                                    for (let n = 0; n < get_one_order.order_items.length; n++) {
                                                        order_items.push({
                                                            item_id: get_one_order.order_items[n].item_id,
                                                            sku: get_one_order.order_items[n].item_model.sku,
                                                            name: get_one_order.order_items[n].product.name,
                                                            image: get_one_order.order_items[n].product.images.length > 0 ? get_one_order.order_items[n].product.images[0] : null,
                                                            item_price: get_one_order.order_items[n].item_price,
                                                            order_price: get_one_order.order_items[n].order_price,
                                                            amount: get_one_order.order_items[n].amount,
                                                            rebate_price: get_one_order.order_items[n].item_model.rebate_price,
                                                            status: get_one_order.order_items[n].status
                                                        });
                                                    }

                                                    let final_total = 0;
                                                    if (cancel_reason_ext == 5) {
                                                        final_total = product_price - seller_voucher + product_discount_rebate_from_shopee;
                                                    }

                                                    result = await api_put_shopee_orders([{
                                                        uid: account.uid,
                                                        shop_id: account.sid,
                                                        order_id: order_id,
                                                        order_sn: order_sn,
                                                        create_time: moment.unix(create_time).format('YYYY-MM-DD HH:mm:ss'),
                                                        delivery_time: moment.unix(delivery_time).format('YYYY-MM-DD HH:mm:ss'),
                                                        cancel_time: moment.unix(cancel_time).format('YYYY-MM-DD HH:mm:ss'),
                                                        refund_time: refund_time,
                                                        cancel_reason_ext: cancel_reason_ext,
                                                        last_logistics_status: last_logistics_status,
                                                        last_logistics_ctime: (last_logistics_ctime != 0 ? moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss') : null),
                                                        last_logistics_description: last_logistics_description,
                                                        package_logistics_status: package_logistics_status,
                                                        buyer_user_id: buyer_user_id,
                                                        buyer_user_name: buyer_user_name,
                                                        buyer_shop_id: buyer_shop_id,
                                                        buyer_portrait: buyer_portrait,
                                                        fulfillment_carrier_name: fulfillment_carrier_name,
                                                        checkout_carrier_name: checkout_carrier_name,
                                                        service_fee: service_fee,
                                                        transaction_fee: transaction_fee,
                                                        commission_fee: commission_fee,
                                                        seller_voucher: seller_voucher,
                                                        package_number: package_number,
                                                        third_party_tn: third_party_tn,
                                                        consignment_no: consignment_no,
                                                        product_price: product_price,
                                                        cancel_amount: cancel_amount,
                                                        refund_amount: refund_amount,
                                                        merchant_subtotal: merchant_subtotal,
                                                        product_discount_rebate_from_shopee: product_discount_rebate_from_shopee,
                                                        seller_absorbed_coin_cash_back: seller_absorbed_coin_cash_back,
                                                        final_total: final_total,
                                                        order_items: (order_items != null ? JSON.stringify(order_items) : null),
                                                        tracking_info: (tracking_info != null ? JSON.stringify(tracking_info) : null),
                                                        status: status
                                                    }], slave_ip, port);
                                                    last_request_success = moment();
                                                    if (result.code != 0) {
                                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') Lỗi api_put_shopee_orders', result);
                                                        return;
                                                    }
                                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ' [' + cancel_page + ']) order cancel OK', order_sn, moment.unix(cancel_time).format('YYYY-MM-DD HH:mm:ss'));
                                                } else {
                                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_income_transaction_history_detail', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                                    loop_status = 0;
                                                    break;
                                                }
                                            } else {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_package', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                                loop_status = 0;
                                                break;
                                            }
                                        }
                                    } else {
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ' [' + cancel_page + ']) order cancel SKIP', order_sn, cancel_time);
                                    }
                                } else {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_one_order', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                    loop_status = 0;
                                    break;
                                }
                            }
                            if (loop_status != 0) {
                                if (last_cancel_page != 0 && cancel_page > last_cancel_page) {
                                    last_cancel_page = cancel_page;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        last_cancel_page: last_cancel_page,
                                        cancel_total_page: total_page
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_cancel_page', last_cancel_page);
                                } else {
                                    if (last_cancel_page == 0 && loop_status != 1) {
                                        break;
                                    }
                                }
                            } else {
                                break;
                            }
                        } else {
                            if (last_cancel_page != 0) {
                                last_cancel_page = 0;
                                result = await api_put_shopee_accounts({
                                    id: account.sid,
                                    last_cancel_page: last_cancel_page
                                }, slave_ip, port);
                                last_request_success = moment();
                                if (result.code != 0) {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                    return;
                                }
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_cancel_page', last_cancel_page);
                            }
                            break;
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_order_id_list', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        break;
                    }
                    cancel_page++;
                    count_cancel_page++;
                    if (last_cancel_page != 0 && count_cancel_page >= 3) {
                        is_restore_check = true;
                        break;
                    }
                }

                //Lấy đơn đã giao
                let complete_page = 1;
                let count_complete_page = 0;
                let first_complete_time = 0;
                let disable_check_complete_time = false;

                while (true) {
                    result = await shopeeApi.api_get_order_id_list(spc_cds, proxy, user_agent, cookie, 1, 'completed', 40, complete_page, 0, false);
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        if (result.data.data.orders.length > 0) {
                            let loop_status = 1;
                            let orders = result.data.data.orders;
                            let total_page = Math.ceil(result.data.data.page_info.total / result.data.data.page_info.page_size);
                            for (let i = 0; i < orders.length; i++) {
                                let order_id = orders[i].order_id;
                                result = await shopeeApi.api_get_one_order(spc_cds, proxy, user_agent, cookie, order_id);
                                last_request_success = moment();
                                if (result.code == 0 && result.data.code == 0) {
                                    let get_one_order = result.data.data;
                                    let complete_time = get_one_order.complete_time;
                                    if (first_complete_time == 0) {
                                        first_complete_time = complete_time;
                                    }
                                    if (!disable_check_complete_time &&
                                        complete_time < last_complete_time) {
                                        disable_check_complete_time = true;
                                        if (last_complete_time != first_complete_time) {
                                            last_complete_time = first_complete_time;
                                            result = await api_put_shopee_accounts({
                                                id: account.sid,
                                                last_complete_time: last_complete_time,
                                                complete_total_page: total_page
                                            }, slave_ip, port);
                                            last_request_success = moment();
                                            if (result.code != 0) {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                                return;
                                            }
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_complete_time', last_complete_time);
                                        }
                                        if (last_complete_page == 0) {
                                            loop_status = 0;
                                            break;
                                        } else {
                                            if (last_complete_page > 1) {
                                                count_complete_page = 0;
                                                complete_page = last_complete_page;
                                                loop_status = 3;
                                                break;
                                            }
                                        }
                                    }

                                    if (last_complete_time == 0) {
                                        last_complete_time = complete_time;
                                        result = await api_put_shopee_accounts({
                                            id: account.sid,
                                            last_complete_time: last_complete_time,
                                            complete_total_page: total_page
                                        }, slave_ip, port);
                                        last_request_success = moment();
                                        if (result.code != 0) {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                            return;
                                        }
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_complete_time', last_complete_time);
                                    }

                                    let order_sn = get_one_order.order_sn;
                                    let delivery_time = get_one_order.delivery_time;

                                    let buyer_user_id = (get_one_order.buyer_user.user_id != null ? get_one_order.buyer_user.user_id : 0);
                                    let buyer_user_name = get_one_order.buyer_user.user_name;
                                    let buyer_shop_id = (get_one_order.buyer_user.shop_id != null ? get_one_order.buyer_user.shop_id : 0);
                                    let buyer_portrait = get_one_order.buyer_user.portrait;
                                    let create_time = get_one_order.create_time;
                                    let fulfillment_carrier_name = get_one_order.fulfillment_carrier_name;
                                    let checkout_carrier_name = get_one_order.checkout_carrier_name;

                                    let status = get_one_order.status;
                                    if (moment.unix(complete_time).startOf('month').add(3, 'months') < moment().startOf('month')) {
                                        last_complete_page = 0;
                                        result = await api_put_shopee_accounts({
                                            id: account.sid,
                                            last_complete_page: last_complete_page
                                        }, slave_ip, port);
                                        last_request_success = moment();
                                        if (result.code != 0) {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                            return;
                                        }
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_complete_page', last_complete_page);
                                        loop_status = 2;
                                        break;
                                    } else {
                                        result = await shopeeApi.api_get_package(spc_cds, proxy, user_agent, cookie, order_id);
                                        last_request_success = moment();
                                        if (result.code == 0 && result.data.code == 0) {
                                            let get_package = result.data.data;
                                            result = await shopeeApi.api_get_income_transaction_history_detail(spc_cds, proxy, user_agent, cookie, order_id);
                                            last_request_success = moment();
                                            if (result.code == 0 && result.data.code == 0) {
                                                let income_transaction_history_detail = result.data.data;

                                                let last_logistics_status = 0;
                                                let last_logistics_ctime = 0;
                                                let last_logistics_description = null;
                                                let tracking_info = null;

                                                let package_number = null;
                                                let third_party_tn = null;
                                                let consignment_no = null;
                                                let package_logistics_status = 0;
                                                let refund_time = null;

                                                if (get_package.order_info.package_list != null &&
                                                    get_package.order_info.package_list.length > 0) {
                                                    package_number = get_package.order_info.package_list[0].package_number;
                                                    third_party_tn = get_package.order_info.package_list[0].third_party_tn;
                                                    consignment_no = get_package.order_info.package_list[0].consignment_no;
                                                    package_logistics_status = get_package.order_info.package_list[0].package_logistics_status;
                                                    if (get_package.order_info.package_list[0].tracking_info != null &&
                                                        get_package.order_info.package_list[0].tracking_info.length > 0) {
                                                        tracking_info = get_package.order_info.package_list[0].tracking_info;
                                                        //tracking_info.sort((a, b) => { return b.id - a.id });
                                                        tracking_info.forEach((v) => { delete v.flag; delete v.type; delete v.status; delete v.logid; delete v.system_time; });
                                                        last_logistics_status = tracking_info[0].logistics_status;
                                                        last_logistics_ctime = tracking_info[0].ctime;
                                                        last_logistics_description = tracking_info[0].description;
                                                    }
                                                }

                                                if (last_logistics_status != 0) {
                                                    let tracking_info_filter = tracking_info.filter(x => x.logistics_status == 8);
                                                    if (tracking_info_filter.length > 0) {
                                                        last_logistics_status = tracking_info_filter[0].logistics_status;
                                                        last_logistics_ctime = tracking_info_filter[0].ctime;
                                                        last_logistics_description = tracking_info_filter[0].description;
                                                    } else {
                                                        if (last_logistics_status == 201) {
                                                            refund_time = moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss');
                                                        }
                                                    }
                                                }

                                                let service_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.service_fee);
                                                let transaction_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.transaction_fee);
                                                let commission_fee = Math.abs(income_transaction_history_detail.payment_info.fees_and_charges.commission_fee);
                                                let seller_voucher = Math.abs(income_transaction_history_detail.buyer_payment_info.seller_voucher);
                                                let merchant_subtotal = Math.abs(income_transaction_history_detail.buyer_payment_info.merchant_subtotal);
                                                let product_discount_rebate_from_shopee = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.product_discount_rebate_from_shopee);
                                                let seller_absorbed_coin_cash_back = Math.abs(income_transaction_history_detail.payment_info.rebate_and_voucher.seller_absorbed_coin_cash_back);
                                                let cancel_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.cancel_amount);
                                                let product_price = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.product_price);
                                                let refund_amount = Math.abs(income_transaction_history_detail.payment_info.merchant_subtotal.refund_amount);

                                                let order_items = [];
                                                for (let n = 0; n < get_one_order.order_items.length; n++) {
                                                    order_items.push({
                                                        item_id: get_one_order.order_items[n].item_id,
                                                        sku: get_one_order.order_items[n].item_model.sku,
                                                        name: get_one_order.order_items[n].product.name,
                                                        image: get_one_order.order_items[n].product.images.length > 0 ? get_one_order.order_items[n].product.images[0] : null,
                                                        item_price: get_one_order.order_items[n].item_price,
                                                        order_price: get_one_order.order_items[n].order_price,
                                                        amount: get_one_order.order_items[n].amount,
                                                        rebate_price: get_one_order.order_items[n].item_model.rebate_price,
                                                        status: get_one_order.order_items[n].status
                                                    });
                                                }

                                                let final_total = product_price - seller_voucher + product_discount_rebate_from_shopee - service_fee - transaction_fee - commission_fee - refund_amount - seller_absorbed_coin_cash_back;

                                                result = await api_put_shopee_orders([{
                                                    uid: account.uid,
                                                    shop_id: account.sid,
                                                    order_id: order_id,
                                                    order_sn: order_sn,
                                                    create_time: moment.unix(create_time).format('YYYY-MM-DD HH:mm:ss'),
                                                    delivery_time: moment.unix(delivery_time).format('YYYY-MM-DD HH:mm:ss'),
                                                    complete_time: moment.unix(complete_time).format('YYYY-MM-DD HH:mm:ss'),
                                                    refund_time: refund_time,
                                                    last_logistics_status: last_logistics_status,
                                                    last_logistics_ctime: (last_logistics_ctime != 0 ? moment.unix(last_logistics_ctime).format('YYYY-MM-DD HH:mm:ss') : null),
                                                    last_logistics_description: last_logistics_description,
                                                    package_logistics_status: package_logistics_status,
                                                    buyer_user_id: buyer_user_id,
                                                    buyer_user_name: buyer_user_name,
                                                    buyer_shop_id: buyer_shop_id,
                                                    buyer_portrait: buyer_portrait,
                                                    fulfillment_carrier_name: fulfillment_carrier_name,
                                                    checkout_carrier_name: checkout_carrier_name,
                                                    service_fee: service_fee,
                                                    transaction_fee: transaction_fee,
                                                    commission_fee: commission_fee,
                                                    seller_voucher: seller_voucher,
                                                    package_number: package_number,
                                                    third_party_tn: third_party_tn,
                                                    consignment_no: consignment_no,
                                                    product_price: product_price,
                                                    cancel_amount: cancel_amount,
                                                    refund_amount: refund_amount,
                                                    merchant_subtotal: merchant_subtotal,
                                                    product_discount_rebate_from_shopee: product_discount_rebate_from_shopee,
                                                    seller_absorbed_coin_cash_back: seller_absorbed_coin_cash_back,
                                                    final_total: final_total,
                                                    order_items: (order_items != null ? JSON.stringify(order_items) : null),
                                                    tracking_info: (tracking_info != null ? JSON.stringify(tracking_info) : null),
                                                    status: status
                                                }], slave_ip, port);
                                                last_request_success = moment();
                                                if (result.code != 0) {
                                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ') Lỗi api_put_shopee_orders', result);
                                                    return;
                                                }
                                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + order_id + ' [' + complete_page + ']) order complete', order_sn, moment.unix(complete_time).format('YYYY-MM-DD HH:mm:ss'));
                                            } else {
                                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_income_transaction_history_detail', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                                loop_status = 0;
                                                break;
                                            }
                                        } else {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_package', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                            loop_status = 0;
                                            break;
                                        }
                                    }
                                } else {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_one_order', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                                    loop_status = 0;
                                    break;
                                }
                            }
                            if (loop_status != 0) {
                                if (last_complete_page != 0 && complete_page > last_complete_page) {
                                    last_complete_page = complete_page;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        last_complete_page: last_complete_page,
                                        complete_total_page: total_page
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_complete_page', last_complete_page);
                                } else {
                                    if (last_complete_page == 0 && loop_status != 1) {
                                        break;
                                    }
                                }
                            } else {
                                break;
                            }
                        } else {
                            if (last_complete_page != 0) {
                                last_complete_page = 0;
                                result = await api_put_shopee_accounts({
                                    id: account.sid,
                                    last_complete_page: last_complete_page
                                }, slave_ip, port);
                                last_request_success = moment();
                                if (result.code != 0) {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                    return;
                                }
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_complete_page', last_complete_page);
                            }
                            break;
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_order_id_list', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        break;
                    }
                    complete_page++;
                    count_complete_page++;
                    if (last_complete_page != 0 && count_complete_page >= 3) {
                        is_restore_check = true;
                        break;
                    }
                }

                //Lấy thanh toán về ví
                let pay_page = 1;
                let count_pay_page = 0;
                let first_pay_time = 0;
                let disable_check_pay_time = false;

                while (true) {
                    result = await shopeeApi.api_get_wallet_transactions(spc_cds, proxy, user_agent, cookie, 0, pay_page, 50, null, null, '102,101,405,404,401,402,302,504,505,301');
                    last_request_success = moment();
                    if (result.code == 0 && result.data.code == 0) {
                        if (result.data.data.list.length > 0) {
                            let loop_status = 1;
                            let list = result.data.data.list;
                            let total_page = Math.ceil(result.data.data.page_info.total / result.data.data.page_info.page_size);
                            for (let i = 0; i < list.length; i++) {
                                let get_wallet_transaction = list[i];
                                let transaction_id = get_wallet_transaction.transaction_id;
                                let pay_time = get_wallet_transaction.ctime;
                                if (first_pay_time == 0) {
                                    first_pay_time = pay_time;
                                }
                                if (!disable_check_pay_time &&
                                    pay_time < last_pay_time) {
                                    disable_check_pay_time = true;
                                    if (last_pay_time != first_pay_time) {
                                        last_pay_time = first_pay_time;
                                        result = await api_put_shopee_accounts({
                                            id: account.sid,
                                            last_pay_time: last_pay_time,
                                            pay_total_page: total_page
                                        }, slave_ip, port);
                                        last_request_success = moment();
                                        if (result.code != 0) {
                                            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                            return;
                                        }
                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_pay_time', last_pay_time);
                                    }
                                    if (last_pay_page == 0) {
                                        loop_status = 0;
                                        break;
                                    } else {
                                        if (last_pay_page > 1) {
                                            count_pay_page = 0;
                                            pay_page = last_pay_page;
                                            loop_status = 3;
                                            break;
                                        }
                                    }
                                }

                                if (last_pay_time == 0) {
                                    last_pay_time = pay_time;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        last_pay_time: last_pay_time,
                                        pay_total_page: total_page
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_pay_time', last_pay_time);
                                }

                                let transaction_type = get_wallet_transaction.type;
                                let order_sn = get_wallet_transaction.order_sn;
                                let amount = get_wallet_transaction.amount;
                                let target_id = get_wallet_transaction.target_id;
                                let status = get_wallet_transaction.status;

                                if (moment.unix(pay_time).startOf('month').add(3, 'months') < moment().startOf('month')) {
                                    last_pay_page = 0;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        last_pay_page: last_pay_page
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_pay_page', last_pay_page);
                                    loop_status = 2;
                                    break;
                                } else {
                                    result = await api_put_shopee_payments([{
                                        uid: account.uid,
                                        shop_id: account.sid,
                                        transaction_id: transaction_id,
                                        transaction_type: transaction_type,
                                        order_sn: order_sn,
                                        amount: amount,
                                        target_id: target_id,
                                        payment_time: moment.unix(pay_time).format('YYYY-MM-DD HH:mm:ss'),
                                        status: status
                                    }], slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + transaction_id + ') Lỗi api_put_shopee_payments', result);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ' -> ' + transaction_id + ' [' + pay_page + ']) order payment OK', order_sn, moment.unix(pay_time).format('YYYY-MM-DD HH:mm:ss'));
                                }
                            }
                            if (loop_status != 0) {
                                if (last_pay_page != 0 && pay_page > last_pay_page) {
                                    last_pay_page = pay_page;
                                    result = await api_put_shopee_accounts({
                                        id: account.sid,
                                        last_pay_page: last_pay_page,
                                        pay_total_page: total_page
                                    }, slave_ip, port);
                                    last_request_success = moment();
                                    if (result.code != 0) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                        return;
                                    }
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_pay_page', last_pay_page);
                                } else {
                                    if (last_pay_page == 0 && loop_status != 1) {
                                        break;
                                    }
                                }
                            } else {
                                break;
                            }
                        } else {
                            if (last_pay_page != 0) {
                                last_pay_page = 0;
                                result = await api_put_shopee_accounts({
                                    id: account.sid,
                                    last_pay_page: last_pay_page
                                }, slave_ip, port);
                                last_request_success = moment();
                                if (result.code != 0) {
                                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_put_shopee_accounts', result.message);
                                    return;
                                }
                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Cập nhật last_pay_page', last_pay_page);
                            }
                            break;
                        }
                    } else {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Lỗi api_get_wallet_transactions', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                        break;
                    }
                    pay_page++;
                    count_pay_page++;
                    if (last_pay_page != 0 && count_pay_page >= 3) {
                        is_restore_check = true;
                        break;
                    }
                }

                if (is_restore_check) {
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + account.name + ') Restore Check');
                    restore_check(account.sid, slave_ip, port);
                }
                await last_connection(slave_ip, port);

            } catch (ex) {
                console.log(ex);
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
            } finally {
                account.job_done = true;
            }
        });

        data_campaigns.forEach(async function (campaign) {
            //for (let dc = 0; dc < data_campaigns.length; dc++) {
            //let campaign = data_campaigns[dc];
            try {
                let spc_cds = campaign.spc_cds;
                let user_agent = campaign.user_agent;
                let username = campaign.username;
                let password = campaign.password;
                let cookie = campaign.cookie;
                let is_need_login = false;

                let result = await shopeeApi.api_get_login(spc_cds, proxy, user_agent, cookie);
                last_request_success = moment();
                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_get_login', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    if (result.code == 999 && (result.status == 403 || result.status == 400))
                        is_need_login = true;
                    else {
                        campaign.job_done = true;
                        return;
                    }
                } else {
                    cookie = result.cookie;
                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Kiểm tra token: OK');
                    result = await api_put_shopee_accounts({ id: campaign.sid, cookie: cookie, last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss') }, slave_ip, port);
                    last_request_success = moment();
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_put_shopee_accounts', result.message);
                        return;
                    }
                }

                if (is_need_login) {
                    spc_cds = uuidv4();
                    result = await shopeeApi.api_post_login(spc_cds, proxy, user_agent, cookie, username, password, null, null, null);
                    last_request_success = moment();
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
                                }, slave_ip, port);
                                last_request_success = moment();
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
                        last_renew_time: moment().format('YYYY-MM-DD HH:mm:ss'),
                        options: JSON.stringify(result),
                    }, slave_ip, port);
                    last_request_success = moment();
                    if (result.code != 0) {
                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ') Lỗi api_put_shopee_accounts', result.message);
                        campaign.job_done = true;
                        return;
                    }
                }

                //Kiểm tra tài khoản
                result = await shopeeApi.api_get_marketing_meta(spc_cds, proxy, user_agent, cookie);
                if (result.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_marketing_meta', result.status, (result.data != null && result.data != '' ? result.data : result.message));
                    campaign.job_done = true;
                    return;
                }
                if (result.data != null && result.data != '' && result.data.code != 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lỗi api_get_marketing_meta', result.data.message);
                    campaign.job_done = true;
                    return;
                }
                let balance = result.data.data.account_info.balance;
                if (balance <= 0) {
                    console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Tài khoản hết tiền');
                    campaign.job_done = true;
                    return;
                } else {
                    console.info(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Số dư tài khoản:', balance.toFixed(0).replace(/(\d)(?=(\d\d\d)+(?!\d))/g, "$1,"));
                }

                //Lấy thông tin chiến dịch
                //sleep(100);
                result = await shopeeApi.api_get_marketing_campaign(spc_cds, proxy, user_agent, cookie, campaign.campaignid);
                last_request_success = moment();
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
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + ']) Lấy thông tin quảng cáo thành công');
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
                    }, slave_ip, port);
                    last_request_success = moment();
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
                                }, slave_ip, port);
                                last_request_success = moment();
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
                            }, slave_ip, port);
                            last_request_success = moment();
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
                    last_request_success = moment();
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
                        //campaign.placements.forEach(async function (care_keyword, index, array) {
                        for (let c = 0; c < campaign.placements.length; c++) {
                            try {
                                let care_keyword = campaign.placements[c];
                                let filter_keywords = advertisement_keyword.extinfo.keywords.filter(x => x.keyword == care_keyword.keyword_str);
                                let is_next_step = false;
                                if (filter_keywords.length > 0) {
                                    let keyword = filter_keywords[0];
                                    if (care_keyword.match_type != keyword.match_type) {
                                        is_next_step = await php_update_placements(campaign, [{
                                            id: care_keyword.id,
                                            match_type: keyword.match_type
                                        }], slave_ip, port);
                                        last_request_success = moment();
                                        if (!is_next_step) {
                                            continue;
                                            //return;
                                        }
                                    }

                                    if (care_keyword.schedule_events == null) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Không tìm thấy dữ liệu lập lịch');
                                        continue;
                                        //return;
                                    }
                                    let events = JSON.parse(care_keyword.schedule_events);
                                    let current_event = null;
                                    events.sort((a, b) => (a.priority < b.priority) ? 1 : ((b.priority < a.priority) ? -1 : 0));
                                    for (let e = 0; e < events.length; e++) {
                                        let event = events[e];
                                        if (event.allDay) {
                                            current_event = event;
                                            break;
                                        } else {
                                            const rule = RRule.fromString(event.rrule);
                                            const dates = rule.between(new Date(moment().add(-1, 'days').format(`YYYY-MM-DDT${moment(rule.options.dtstart).add(-7, 'hours').add(-1, 'seconds').format('HH:mm:ss')}.000`) + 'Z'), new Date(moment().add(1, 'days').format(`YYYY-MM-DDT${moment(rule.options.dtstart).add(-7, 'hours').add(parseInt(event.duration.split(':')[0]), 'hours').add(parseInt(event.duration.split(':')[1]), 'minutes').add(1, 'seconds').format('HH:mm:ss')}.000`) + 'Z'));
                                            let is_current_event = false;
                                            for (let d = 0; d < dates.length; d++) {
                                                let date = dates[d];
                                                const from_datetime = moment(date).add(-7, 'hours');
                                                const end_datetime = moment(date).add(-7, 'hours').add(parseInt(event.duration.split(':')[0]), 'hours').add(parseInt(event.duration.split(':')[1]), 'minutes');
                                                if (moment() >= from_datetime && moment() <= end_datetime) {
                                                    is_current_event = true;
                                                    break;
                                                }
                                            }
                                            if (is_current_event) {
                                                current_event = event;
                                                break;
                                            }
                                        }
                                    }
                                    if (current_event == null) {
                                        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Không tìm thấy lập lịch hiện tại');
                                        continue;
                                        //return;
                                    }

                                    let min_price = (campaign.campaign_type == 'keyword' ? (keyword.match_type == 0 ? 400 : 480) : (keyword.match_type == 0 ? 500 : 600));
                                    if (current_event.care_type == 3) {
                                        //Giảm về giá thầu tối thiểu
                                        if (keyword.price > min_price) {
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giảm về giá thầu tối thiểu');
                                            keyword.price = min_price;
                                            is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                            last_request_success = moment();
                                        }
                                        continue;
                                        //return;
                                    }

                                    if (current_event.care_type == 4) {
                                        //Tạm dừng từ khóa
                                        if (keyword.status != 0) {
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tạm dừng từ khóa');
                                            keyword.status = 0;
                                            is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                            last_request_success = moment();
                                        }
                                        continue;
                                        //return;
                                    }

                                    //Bật lại từ khóa nếu đang bị tắt
                                    is_next_step = true;
                                    if (keyword.status == 0) {
                                        keyword.status = 1;
                                        is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                        last_request_success = moment();
                                    }
                                    if (!is_next_step) {
                                        continue;
                                        //return;
                                    }

                                    let max_price = parseFloat(current_event.max_price);
                                    if (max_price < min_price) {
                                        max_price = min_price;
                                    }

                                    if (current_event.care_type == 0 || current_event.care_type == 2) {
                                        //Đấu thầu lãi lỗ & Đấu thầu CIR
                                        let filter_keyword_reports = keyword_reports.filter(x => x.keyword == keyword.keyword);
                                        let cost = 0;
                                        let direct_gmv = 0;
                                        let direct_order_amount = 0;
                                        let click = 0;
                                        let broad_cir = 0;
                                        let direct_cir = 0;

                                        let last_click = parseInt(care_keyword.last_click);
                                        let max_hour = parseInt(current_event.max_hour);
                                        let cir_type = 0;
                                        let cir_value = 0;
                                        if (current_event.care_type == 2) {
                                            cir_type = parseInt(current_event.cir_type);
                                            cir_value = parseFloat(current_event.cir_value);
                                            cir_value = (cir_value * 80) / 100; //Hệ số an toàn 80%
                                        }
                                        if (filter_keyword_reports.length > 0) {
                                            cost = filter_keyword_reports[0].cost;
                                            direct_gmv = filter_keyword_reports[0].direct_gmv;
                                            direct_order_amount = filter_keyword_reports[0].direct_order_amount;
                                            cost = filter_keyword_reports[0].cost;
                                            click = filter_keyword_reports[0].click;
                                            broad_cir = filter_keyword_reports[0].broad_cir * 100;
                                            direct_cir = filter_keyword_reports[0].direct_cir * 100;
                                        }

                                        let check_win = false;
                                        if (campaign.campaign_type == 'keyword') {
                                            if (current_event.care_type == 0) {
                                                //Đấu thầu lãi lỗ
                                                let product_cost = campaign.product_cost * direct_order_amount;
                                                let check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                                                if (check_profit >= 0)
                                                    check_win = true;
                                            } else {
                                                //Đấu thầu CIR
                                                if (cir_value <= (cir_type == 0 ? broad_cir : direct_cir))
                                                    check_win = true;
                                            }
                                        } else {
                                            if (cir_value <= broad_cir)
                                                check_win = true;
                                        }

                                        if (check_win) {
                                            //Quảng cáo lãi/hòa
                                            if (click == last_click) {
                                                //Không có click
                                                let old_price = keyword.price;
                                                let ads_location = 999;
                                                if (keyword.price == max_price) {
                                                    if (moment(care_keyword.last_check_time).add(60, 'minutes') < moment()) {
                                                        ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, 0, proxy_server, null, clone_user_agent, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                                        last_request_success = moment();
                                                        is_next_step = await php_update_placements(campaign, [{
                                                            id: care_keyword.id,
                                                            last_check_time: moment().format('YYYY-MM-DD HH:mm:ss')
                                                        }], slave_ip, port);
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
                                                        }
                                                    }
                                                } else {
                                                    ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, 0, proxy_server, null, clone_user_agent, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                                    last_request_success = moment();
                                                }
                                                if (ads_location != -1) {
                                                    if (ads_location == 1) {
                                                        keyword.price = Math.round(keyword.price * 0.99);
                                                        if (keyword.price < min_price)
                                                            keyword.price = min_price;
                                                    } else {
                                                        keyword.price = Math.round(keyword.price * 1.1);
                                                        if (keyword.price > max_price)
                                                            keyword.price = max_price;
                                                    }

                                                    if (keyword.price != old_price) {
                                                        is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
                                                        }
                                                        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tăng giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price);
                                                    }

                                                    if (care_keyword.last_update_loss != null) {
                                                        is_next_step = await php_update_placements(campaign, [{
                                                            id: care_keyword.id,
                                                            last_update_loss: null
                                                        }], slave_ip, port);
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
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
                                                }], slave_ip, port);
                                                last_request_success = moment();
                                                if (!is_next_step) {
                                                    continue;
                                                    //return;
                                                }
                                            }

                                        } else {
                                            //Từ khóa cáo lỗ
                                            let is_down_price = true;
                                            if (max_hour != 0) {
                                                if (care_keyword.last_update_loss == null) {
                                                    is_next_step = await php_update_placements(campaign, [{
                                                        id: care_keyword.id,
                                                        last_update_loss: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                        last_click: click
                                                    }], slave_ip, port);
                                                    last_request_success = moment();
                                                    if (!is_next_step) {
                                                        continue;
                                                        //return;
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
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
                                                        }
                                                        is_next_step = await php_update_placements(campaign, [{
                                                            id: care_keyword.id,
                                                            care_status: 2
                                                        }], slave_ip, port);
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
                                                        }
                                                        is_down_price = false;
                                                    }
                                                }
                                            }

                                            if (is_down_price) {
                                                if (last_click != click) {
                                                    if (keyword.price > min_price) {
                                                        //Có click mới
                                                        let old_price = keyword.price;
                                                        keyword.price = Math.round(keyword.price * 0.9);
                                                        if (keyword.price < min_price)
                                                            keyword.price = min_price;

                                                        if (keyword.price != old_price) {
                                                            is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                            last_request_success = moment();
                                                            if (!is_next_step) {
                                                                continue;
                                                                //return;
                                                            }
                                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giảm giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price);
                                                        }
                                                    }
                                                    is_next_step = await php_update_placements(campaign, [{
                                                        id: care_keyword.id,
                                                        last_click: click,
                                                        last_update_click: moment().format('YYYY-MM-DD HH:mm:ss'),
                                                        last_up_price: moment().format('YYYY-MM-DD HH:mm:ss')
                                                    }], slave_ip, port);
                                                    last_request_success = moment();
                                                    if (!is_next_step) {
                                                        continue;
                                                        //return;
                                                    }
                                                } else {
                                                    //Không có click
                                                    if (moment(care_keyword.last_up_price).add(30, 'minutes') <= moment()) {
                                                        let old_price = keyword.price;
                                                        let ads_location = 999;
                                                        if (keyword.price == max_price) {
                                                            if (moment(care_keyword.last_check_time).add(60, 'minutes') < moment()) {
                                                                ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, 0, proxy_server, null, clone_user_agent, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                                                last_request_success = moment();
                                                                is_next_step = await php_update_placements(campaign, [{
                                                                    id: care_keyword.id,
                                                                    last_check_time: moment().format('YYYY-MM-DD HH:mm:ss')
                                                                }], slave_ip, port);
                                                                last_request_success = moment();
                                                                if (!is_next_step) {
                                                                    continue;
                                                                    //return;
                                                                }
                                                            }
                                                        } else {
                                                            ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, 0, proxy_server, null, clone_user_agent, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                                            last_request_success = moment();
                                                        }
                                                        if (ads_location != -1) {
                                                            if (ads_location == 1) {
                                                                keyword.price = Math.round(keyword.price * 0.99);
                                                                if (keyword.price < min_price)
                                                                    keyword.price = min_price;
                                                            } else {
                                                                keyword.price = Math.round(keyword.price * 1.1);
                                                                if (keyword.price > max_price)
                                                                    keyword.price = max_price;
                                                            }

                                                            if (keyword.price != old_price) {
                                                                is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                                last_request_success = moment();
                                                                if (!is_next_step) {
                                                                    continue;
                                                                    //return;
                                                                }
                                                                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Tăng giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price);
                                                            }
                                                            is_next_step = await php_update_placements(campaign, [{
                                                                id: care_keyword.id,
                                                                last_up_price: moment().format('YYYY-MM-DD HH:mm:ss')
                                                            }], slave_ip, port);
                                                            last_request_success = moment();
                                                            if (!is_next_step) {
                                                                continue;
                                                                //return;
                                                            }

                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    } else {
                                        //Đấu thầu vị trí
                                        let min_location = current_event.min_location;
                                        let max_location = current_event.max_location;
                                        let max_page = getMaxPage(max_location);
                                        let ads_location = await locationKeyword(campaign.name, campaign.shop_id, campaign.campaignid, itemid, max_page, proxy_server, null, clone_user_agent, 'relevancy', keyword.keyword, 60, 0, 'desc');
                                        last_request_success = moment();
                                        if (ads_location != -1) {
                                            if (ads_location > max_location) {
                                                //Tăng giá thầu
                                                let old_price = keyword.price;
                                                keyword.price = Math.round(keyword.price * 1.1);
                                                if (keyword.price > max_price)
                                                    keyword.price = max_price;
                                                if (keyword.price != old_price) {
                                                    is_next_step = await shopee_update_keyword_list(spc_cds, proxy, user_agent, cookie, campaign, [keyword]);
                                                    last_request_success = moment();
                                                    if (!is_next_step) {
                                                        continue;
                                                        //return;
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
                                                            last_request_success = moment();
                                                            if (!is_next_step) {
                                                                continue;
                                                                //return;
                                                            }
                                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giảm giá thầu: ', old_price, '->', keyword.price, 'Max:', max_price, 'Location:', ads_location, '<', current_event.min_location);
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
                                                        last_request_success = moment();
                                                        if (!is_next_step) {
                                                            continue;
                                                            //return;
                                                        }
                                                    }
                                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + keyword.keyword.normalize('NFC') + ') Giữ vị trí:', old_price, '->', keyword.price, 'Max:', max_price, current_event.min_location, '<=', ads_location, '<=', current_event.max_location);
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
                                    }], slave_ip, port);
                                    last_request_success = moment();
                                    if (!is_next_step) {
                                        continue;
                                        //return;
                                    }
                                }
                            } catch (ex) {
                                console.log(ex);
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
                            }
                            finally {
                                //if (index === array.length - 1) {
                                //    campaign.job_done = true;
                                //}
                            }
                        }
                        campaign.job_done = true;
                        return;
                        //});
                    }
                } else {
                    //Quảng cáo khám phá
                    let ads_auto = campaign_ads_list.campaign_ads_list[0].advertisements.filter(x => x.placement == 8 && x.status == 1);
                    if (ads_auto.length > 0) {
                        //Là quảng cáo tự động => Tắt care
                        result = await api_put_shopee_campaigns({
                            id: campaign.cid,
                            care_status: 0
                        }, slave_ip, port);
                        last_request_success = moment();
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
                        }, slave_ip, port);
                        last_request_success = moment();
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
                    last_request_success = moment();
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
                    //let is_update_campaign = false;
                    let update_placements = [];

                    for (let i = 0; i < campaign.placements.length; i++) {
                        let care_placement = campaign.placements[i];
                        let filter_placements = ads_placements.filter(x => x.placement == care_placement.placement);
                        if (filter_placements.length > 0) {
                            let placement = filter_placements[0];
                            if (care_placement.schedule_events == null) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Không tìm thấy dữ liệu lập lịch');
                                continue;
                                //return;
                            }
                            let events = JSON.parse(care_placement.schedule_events);
                            let current_event = null;
                            events.sort((a, b) => (a.priority < b.priority) ? 1 : ((b.priority < a.priority) ? -1 : 0));
                            for (let e = 0; e < events.length; e++) {
                                let event = events[e];
                                if (event.allDay) {
                                    current_event = event;
                                    break;
                                } else {
                                    const rule = RRule.fromString(event.rrule);
                                    const dates = rule.between(new Date(moment().add(-1, 'days').format(`YYYY-MM-DDT${moment(rule.options.dtstart).add(-7, 'hours').add(-1, 'seconds').format('HH:mm:ss')}.000`) + 'Z'), new Date(moment().add(1, 'days').format(`YYYY-MM-DDT${moment(rule.options.dtstart).add(-7, 'hours').add(parseInt(event.duration.split(':')[0]), 'hours').add(parseInt(event.duration.split(':')[1]), 'minutes').add(1, 'seconds').format('HH:mm:ss')}.000`) + 'Z'));
                                    let is_current_event = false;
                                    for (let d = 0; d < dates.length; d++) {
                                        let date = dates[d];
                                        const from_datetime = moment(date).add(-7, 'hours');
                                        const end_datetime = moment(date).add(-7, 'hours').add(parseInt(event.duration.split(':')[0]), 'hours').add(parseInt(event.duration.split(':')[1]), 'minutes');
                                        if (moment() >= from_datetime && moment() <= end_datetime) {
                                            is_current_event = true;
                                            break;
                                        }
                                    }
                                    if (is_current_event) {
                                        current_event = event;
                                        break;
                                    }
                                }
                            }
                            if (current_event == null) {
                                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Không tìm thấy lập lịch hiện tại');
                                continue;
                                //return;
                            }

                            if (current_event.care_type == 3) {
                                //Điều chỉnh premium về mức tối thiểu
                                if (placement.extinfo.target.premium_rate > 0) {
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') [Lập lịch] Premium 0%');
                                    placement.extinfo.target.premium_rate = 0;
                                    placement.extinfo.target.price = placement.extinfo.target.base_price;
                                    is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, premium_rate: 0 }]);
                                    last_request_success = moment();
                                    if (!is_next_step) {
                                        break;
                                    }
                                    //is_update_campaign = true;
                                }
                                continue;
                                //return;
                            }

                            if (current_event.care_type == 4) {
                                //Tạm dừng vị trí
                                if (placement.status == 1) {
                                    console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.filter_placements + ') [Lập lịch] Tạm dừng vị trí');
                                    placement.status = 2;
                                    is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, status: 2 }]);
                                    last_request_success = moment();
                                    if (!is_next_step) {
                                        break;
                                    }
                                    //is_update_campaign = true;
                                }
                                continue;
                                //return;
                            }

                            //Bật lại vị trí nếu đang bị tắt
                            if (placement.status == 2) {
                                placement.status = 1;
                                is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, status: 1 }]);
                                last_request_success = moment();
                                if (!is_next_step) {
                                    break;
                                }
                                //is_update_campaign = true;
                            }

                            let filter_placement_reports = placement_reports.filter(x => x.placement == placement.placement);
                            let cost = 0;
                            let direct_gmv = 0;
                            let direct_order_amount = 0;
                            let click = 0;
                            let broad_cir = 0;
                            let direct_cir = 0;

                            let last_click = parseInt(care_placement.last_click);
                            let max_hour = parseInt(current_event.max_hour);

                            let cir_type = 0;
                            let cir_value = 0;
                            if (current_event.care_type == 2) {
                                cir_type = parseInt(current_event.cir_type);
                                cir_value = parseFloat(current_event.cir_value);
                                cir_value = (cir_value * 80) / 100; //Hệ số an toàn 80%
                            }

                            if (filter_placement_reports.length > 0) {
                                cost = filter_placement_reports[0].cost;
                                direct_gmv = filter_placement_reports[0].direct_gmv;
                                direct_order_amount = filter_placement_reports[0].direct_order_amount;
                                cost = filter_placement_reports[0].cost;
                                click = filter_placement_reports[0].click;
                                broad_cir = filter_placement_reports[0].broad_cir * 100;
                                direct_cir = filter_placement_reports[0].direct_cir * 100;
                            }

                            let check_win = false;
                            if (current_event.care_type == 0) {
                                let product_cost = campaign.product_cost * direct_order_amount;
                                let check_profit = campaign.profit_num * (direct_gmv - ((direct_gmv * campaign.fix_cost) / 100) - product_cost) - cost;
                                if (check_profit >= 0) {
                                    check_win = true;
                                }
                            } else {
                                if (cir_value <= (cir_type == 0 ? broad_cir : direct_cir))
                                    check_win = true;
                            }
                            if (check_win) {
                                //Quảng cáo lãi/hòa
                                if (placement.extinfo.target.premium_rate < current_event.max_price || placement.extinfo.target.premium_rate > current_event.max_price) {
                                    if (click == last_click) {
                                        //Không có click
                                        placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate + 10;
                                        if (placement.extinfo.target.premium_rate > current_event.max_price)
                                            placement.extinfo.target.premium_rate = current_event.max_price;
                                        placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                        is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, premium_rate: placement.extinfo.target.premium_rate }]);
                                        last_request_success = moment();
                                        if (!is_next_step) {
                                            break;
                                        }
                                        //is_update_campaign = true;
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
                                let is_down_price = true;
                                if (max_hour != 0) {
                                    if (care_placement.last_update_loss == null) {
                                        update_placements.push({
                                            id: care_placement.id,
                                            last_update_loss: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            last_click: click
                                        });
                                        is_down_price = true;
                                    } else {
                                        if (moment(care_placement.last_update_loss).add(max_hour, 'hours') > moment()) {
                                            is_down_price = true;
                                        } else {
                                            //Tắt ví trí không hiệu quả
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Tắt vị trí không hiệu quả');
                                            placement.status = 2;
                                            is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, status: 2 }]);
                                            last_request_success = moment();
                                            if (!is_next_step) {
                                                break;
                                            }
                                            //is_update_campaign = true;
                                            update_placements.push({
                                                id: care_placement.id,
                                                care_status: 2
                                            });
                                            is_down_price = false;
                                        }
                                    }
                                }
                                if (is_down_price) {
                                    if (last_click != click) {
                                        if (placement.premium_rate > 0) {
                                            //Có click mới
                                            placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate - 10;
                                            if (placement.extinfo.target.premium_rate < 0)
                                                placement.extinfo.target.premium_rate = 0;
                                            placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                            is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, premium_rate: placement.extinfo.target.premium_rate }]);
                                            last_request_success = moment();
                                            if (!is_next_step) {
                                                break;
                                            }
                                            //is_update_campaign = true;
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Giảm giá thầu: ', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)', 'Base:', placement.extinfo.target.base_price);
                                        }
                                        update_placements.push({
                                            id: care_placement.id,
                                            last_click: click,
                                            last_update_click: moment().format('YYYY-MM-DD HH:mm:ss'),
                                            last_up_price: moment().format('YYYY-MM-DD HH:mm:ss')
                                        });
                                    } else {
                                        //Không có click
                                        if (moment(care_placement.last_up_price).add(30, 'minutes') <= moment()) {
                                            placement.extinfo.target.premium_rate = placement.extinfo.target.premium_rate + 10;
                                            if (placement.extinfo.target.premium_rate > current_event.max_price)
                                                placement.extinfo.target.premium_rate = current_event.max_price;
                                            placement.extinfo.target.price = Math.round(placement.extinfo.target.base_price * (placement.extinfo.target.premium_rate / 100 + 1));
                                            is_next_step = await shopee_update_placement_list(spc_cds, proxy, user_agent, cookie, campaign, [{ placement: placement.placement, premium_rate: placement.extinfo.target.premium_rate }]);
                                            last_request_success = moment();
                                            if (!is_next_step) {
                                                break;
                                            }
                                            //is_update_campaign = true;
                                            console.log(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + campaign.name + ' -> ' + campaign.campaignid + ' [' + campaign.campaign_type + '] -> ' + placement.placement + ') Tăng giá thầu:', placement.extinfo.target.price, '(' + placement.extinfo.target.premium_rate + '%)', 'Base:', placement.extinfo.target.base_price);
                                            update_placements.push({
                                                id: care_placement.id,
                                                last_up_price: moment().format('YYYY-MM-DD HH:mm:ss')
                                            });
                                        }
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

                    /*if (is_update_campaign) {
                        let is_next_step = await shopee_campaign_ads_list(spc_cds, proxy, user_agent, cookie, campaign, campaign_ads_list);
                        if (!is_next_step) {
                            campaign.job_done = true;
                            return;
                        }
                    }*/

                    if (update_placements.length > 0) {
                        await php_update_placements(campaign, update_placements, slave_ip, port);
                        last_request_success = moment();
                    }
                    campaign.job_done = true;
                }
                await last_connection(slave_ip, port);
            } catch (ex) {
                campaign.job_done = true;
                console.log(ex);
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
            }
            //}
        });
    } catch (ex) {
        console.log(ex);
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
        console.log(`---Hoàn thành tiến trình: ${moment().diff(ps_start_time, 'seconds')}s---`);
        await sleep((slave_type != 'CRON' ? 60000 : 3000));
        run();
    }
    finally {
        if (!is_wait) {
            console.log(`---Hoàn thành tiến trình: ${moment().diff(ps_start_time, 'seconds')}s---`);
            await sleep((slave_type != 'CRON' ? 60000 : 3000));
            run();
        }
    }
}

setInterval(async function () {
    try {
        console.log("---Last request success:", last_request_success.format('MM/DD/YYYY HH:mm:ss') + "---");
        if (moment(last_request_success).add(5, 'minutes') < moment()) {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Khởi động tiến trình bị treo');
            exec('pm2 restart cron_check;');
        }
    }
    catch (ex) {
        console.log(ex);
        console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi ngoại lệ <' + ex + '>');
    }
}, 10000);

run();
