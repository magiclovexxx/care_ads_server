const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
const ShopeeAPI = require('./api/ShopeeAPI.js');
const shopeeApi = new ShopeeAPI(300000);
const HttpClient = require('./api/HttpClient.js');
const httpClient = new HttpClient(300000);
var moment = require('moment');
const NodeRSA = require('node-rsa');
const fs = require('fs');
const md5 = require('md5');

async function locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order) {
    by = 'pop';
    let start_unix = moment().unix();
    let result = await shopeeApi.api_get_search_items_v2(proxy, user_agent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
    let end_unix = moment().unix();
    if (result.code != 0) {
        if (result.code == 1000) {
            if (result.status == 429 || result.status == 403) {
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeV2 chặn nhiều request -> Shopee');
                return locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
            } else {
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') ShopeeV2 Request Timeout');
                await sleep(3000);
                return locationKeyword_ShopeeV2(shopname, shopid, campaignid, itemid, max_page, proxy, cookie, user_agent, by, keyword, limit, newest, order);
            }
        } else {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), '(' + shopname + ' -> ' + campaignid + ') Lỗi api_get_search_items_v2', result);
            return -1;
        }
    }

    if (result.data.items != null) {
        let index = result.data.items.findIndex(x => x.itemid == itemid && x.campaignid != null);
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

(async () => {
    
    let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36';
    let result = await shopeeApi.api_dynamic_request(null, user_agent, null, 'https://localapi.trazk.com/keywords/v2.php?task=getKeywordsSuggestion&limit=5000&lang=vn&country=vn&userToken=VEFKa3Bqd0RQb0tGc1ZDZ3JXakhIZUdlR2c1QUg4RDhuMlpRdGNnY3ByZllHb0xFcGVsT0lCNXUwakJ5cjdHdjo6rHJ64rs6rAHFKVFndx31Wg&sortBy=relevance', 'POST', 'keywords[]=ví+nữ');
    console.log(result);

    return;
    let itemid = 6121833543;
    let keyword = 'ví nữ';
    let location = await locationKeyword_ShopeeV2(null, null, null, itemid, 6, null, null, user_agent, 'pop', keyword, 60, 0, 'desc');
    console.log(location);
    return;
    let data = 'by=sales&keyword=v%C3%AD%20n%E1%BB%AF&limit=60&newest=0&order=desc&page_type=search&scenario=PAGE_GLOBAL_SEARCH&version=2';
    let str_request = `55b03${md5(data)}55b03`;
    let if_none_match = `55b03-${md5(str_request)}`;
    console.log(if_none_match);
    return;

    let cookie = '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';

    const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
        'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
        '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
        'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
        '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
        'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
        'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
        '-----END RSA PRIVATE KEY-----');
    if (cookie != null) {
        cookie = RSA.decrypt(cookie, 'utf8');
    }
    console.log(cookie);
    /*
    if (cookie.indexOf('|') != -1) {
        cookie = cookie.split('|')[0];
    }
    if (cookie != null) {
        cookie = RSA.encrypt(cookie, 'base64');
    }
    
        console.log(cookie);*/
    /*if (fs.existsSync('/root/.pm2/logs/cron-check-error.log')) {
        const { size } = fs.statSync('/root/.pm2/logs/cron-check-error.log');
        if (((size / 1024) / 1024) > 100) {
            fs.unlinkSync('/root/.pm2/logs/cron-check-error.log');
        }
    }
    if (fs.existsSync('/root/.pm2/logs/server-error.log')) {
        const { size } = fs.statSync('/root/.pm2/logs/server-error.log');
        if (((size / 1024) / 1024) > 100) {
            fs.unlinkSync('/root/.pm2/logs/server-error.log');
        }
    }
    const time_out = Math.floor(Math.random() * (5555 - 1111 + 1)) + 1111;
    console.log(time_out);*/
})();
