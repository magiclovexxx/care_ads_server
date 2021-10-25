const md5 = require('md5');
const crypto = require('crypto');
const moment = require('moment');
const NodeRSA = require('node-rsa');
const { v4: uuidv4 } = require('uuid');

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
    return axios.create({ withCredentials: true, timeout: 600000 });
}

function cookieParse(cookie, cookie_array) {
    let result = [];
    let cookie_primary_array = [];
    if (cookie_array != null) {
        for (let i = 0; i < cookie_array.length; i++) {
            let item = cookie_array[i].split(';')[0];
            let primary = item.split('=')[0];
            result.push(item);
            cookie_primary_array.push(primary);
        }
    }
    if (cookie != null) {
        let old_cookie_array = cookie.split('; ');
        for (let i = 0; i < old_cookie_array.length; i++) {
            let item = old_cookie_array[i];
            let primary = item.split('=')[0];
            if (cookie_primary_array.indexOf(primary) == -1)
                result.push(item);
        }
    }
    return result.length > 0 ? result.join('; ') : null;
}

const axiosInstance = createAxios();

const api_dynamic_request = async (proxy, UserAgent, cookie, url, method, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }

    if (method == 'GET') {
        let result = await axiosInstance.get(url, {
            headers: {
                cookie: cookie,
                'User-Agent': UserAgent,
                referer: url
            },
            //proxy: proxy
        }).then(function (response) {
            response.cookie = cookieParse(cookie, response.headers['set-cookie']);
            if (response.cookie != null)
                response.cookie = RSA.encrypt(response.cookie, 'base64');
            return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
        }).catch(function (error) {
            if (error.response) {
                error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
                if (error.response.cookie != null)
                    error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
                return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
            } else {
                if (proxy == null) {
                    return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
                } else {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                    if (cookie != null) {
                        cookie = RSA.encrypt(cookie, 'base64');
                    }
                    return api_dynamic_request(null, UserAgent, cookie, url, method, data);
                }
            }
        });
        return result;
    }

    if (method == 'POST') {
        let result = await axiosInstance.post(url, data, {
            headers: {
                cookie: cookie,
                'User-Agent': UserAgent,
                referer: url
            },
            //proxy: proxy
        }).then(function (response) {
            response.cookie = cookieParse(cookie, response.headers['set-cookie']);
            if (response.cookie != null)
                response.cookie = RSA.encrypt(response.cookie, 'base64');
            return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
        }).catch(function (error) {
            if (error.response) {
                error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
                if (error.response.cookie != null)
                    error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
                return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
            } else {
                if (proxy == null) {
                    return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
                } else {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                    if (cookie != null) {
                        cookie = RSA.encrypt(cookie, 'base64');
                    }
                    return api_dynamic_request(null, UserAgent, cookie, url, method, data);
                }
            }
        });
        return result;
    }

    if (method == 'PUT') {
        let result = await axiosInstance.put(url, data, {
            headers: {
                cookie: cookie,
                'User-Agent': UserAgent,
                referer: url
            },
            //proxy: proxy
        }).then(function (response) {
            response.cookie = cookieParse(cookie, response.headers['set-cookie']);
            if (response.cookie != null)
                response.cookie = RSA.encrypt(response.cookie, 'base64');
            return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
        }).catch(function (error) {
            if (error.response) {
                error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
                if (error.response.cookie != null)
                    error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
                return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
            } else {
                if (proxy == null) {
                    return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
                } else {
                    console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                    if (cookie != null) {
                        cookie = RSA.encrypt(cookie, 'base64');
                    }
                    return api_dynamic_request(null, UserAgent, cookie, url, method, data);
                }
            }
        });
        return result;
    }
}

const api_post_login = async (SPC_CDS, proxy, UserAgent, cookie, username, password, vcode, captcha, captcha_id) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const password_hash = crypto.createHash('sha256').update(md5(password)).digest('hex');
    const Url = 'https://banhang.shopee.vn/api/v2/login/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    let data = '';
    let vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    let email_regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (vnf_regex.test(username) == false) {
        if (email_regex.test(username) == false) {
            data += '&username=' + encodeURI(username);
        } else {
            data += '&email=' + encodeURI(username);
        }
    } else {
        data += '&phone=' + encodeURI('84' + username.substring(1, 10));
    }
    data += '&password_hash=' + password_hash;
    data += '&remember=true';
    if (vcode != null) {
        data += '&vcode=' + vcode;
    }
    if (captcha != null) {
        data += '&captcha=' + captcha;
    }
    if (captcha_id != null) {
        data += '&captcha_id=' + captcha_id;
    }
    const result = await axiosInstance.post(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_post_login(SPC_CDS, null, UserAgent, cookie, username, password, vcode, captcha, captcha_id);
            }
        }
    });
    return result;
}

const api_get_all_category_list = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_all_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2&version=3.1.0';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_all_category_list(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}

const api_get_second_category_list = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_second_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2&version=3.1.0';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_second_category_list(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}

const api_get_shop_info = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/selleraccount/shop_info/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_shop_info(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}

const api_get_page_active_collection_list = async (SPC_CDS, proxy, UserAgent, cookie, page_number, page_size) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/shopcategory/v3/category/page_active_collection_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    Url += '&page_number=' + page_number;
    Url += '&page_size=' + page_size;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_page_active_collection_list(SPC_CDS, null, UserAgent, cookie, page_number, page_size);
            }
        }
    });
    return result;
}

const api_get_product_selector = async (SPC_CDS, proxy, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content, sort_by) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/public/product_selector/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    Url += '&offset=' + offset;
    Url += '&limit=' + limit;
    Url += '&is_ads=' + is_ads;
    Url += '&need_brand=' + need_brand;
    Url += '&need_item_model=' + need_item_model;
    if (search_type != null) {
        Url += '&search_type=' + search_type;
        Url += '&search_content=' + encodeURI(search_content);
    }
    if (sort_by != null) {
        Url += '&sort_by=' + sort_by;
    }
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_product_selector(SPC_CDS, null, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content, sort_by);
            }
        }
    });
    return result;
}

const api_get_search_items_waiting = async (proxy, UserAgent, cookie, by, keyword, limit, newest, order, page_type, scenario, version) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://shopee.vn/api/v4/search/search_items?by=' + by;
    Url += '&keyword=' + encodeURI(keyword)
    Url += '&limit=' + limit;
    Url += '&newest=' + newest;
    Url += '&order=' + order;
    Url += '&page_type=' + page_type;
    Url += '&scenario=' + scenario;
    Url += '&version=' + version;
    const result = await axiosInstance.get(Url, {
        headers: {
            'authority': 'shopee.vn',
            'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': UserAgent,
            'x-api-source': 'pc',
            'x-shopee-language': 'vi',
            'x-requested-with': 'XMLHttpRequest',
            'if-none-match-': '55b03-0bdbd793997dcec906abc543fead0f71',
            'sec-ch-ua-platform': '"Windows"',
            'accept': '*/*',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://shopee.vn/search?keyword=' + encodeURI(keyword),
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'cookie': cookie
        },
        //proxy: proxy,
        timeout: 600000
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
        }
    });
    return result;
}

const api_get_search_items = async (proxy, UserAgent, cookie, by, keyword, limit, newest, order, page_type, scenario, version) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://shopee.vn/api/v4/search/search_items?by=' + by;
    Url += '&keyword=' + encodeURI(keyword)
    Url += '&limit=' + limit;
    Url += '&newest=' + newest;
    Url += '&order=' + order;
    Url += '&page_type=' + page_type;
    Url += '&scenario=' + scenario;
    Url += '&version=' + version;
    const result = await axiosInstance.get(Url, {
        headers: {
            'authority': 'shopee.vn',
            'sec-ch-ua': '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
            'sec-ch-ua-mobile': '?0',
            'user-agent': UserAgent,
            'x-api-source': 'pc',
            'x-shopee-language': 'vi',
            'x-requested-with': 'XMLHttpRequest',
            'if-none-match-': '55b03-0bdbd793997dcec906abc543fead0f71',
            'sec-ch-ua-platform': '"Windows"',
            'accept': '*/*',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://shopee.vn/search?keyword=' + encodeURI(keyword),
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'cookie': cookie
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_search_items(null, UserAgent, cookie, by, keyword, limit, newest, order, page_type, scenario, version);
            }
        }
    });
    return result;
}

const api_get_shop_info_shopid = async (proxy, UserAgent, cookie, shopid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://shopee.vn/api/v4/product/get_shop_info?shopid=' + shopid;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://shopee.vn'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_shop_info_shopid(null, UserAgent, cookie, shopid);
            }
        }
    });
    return result;
}

const api_get_search_hint = async (SPC_CDS, proxy, UserAgent, cookie, keyword, type) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://mall.shopee.vn/api/v1/search_hint?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    Url += '&keyword=' + encodeURI(keyword);
    Url += '&type=' + type;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_search_hint(SPC_CDS, null, UserAgent, cookie, keyword, type);
            }
        }
    });
    return result;
}

const api_put_marketing_mass_edit = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/mass_edit/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.put(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_put_marketing_mass_edit(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_put_marketing_search_ads = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/search_ads/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.put(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_put_marketing_search_ads(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_post_marketing_graphql = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/n/marketing/graphql/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_post_marketing_graphql(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_get_item_status = async (SPC_CDS, proxy, UserAgent, cookie, item_id_list) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_item_status/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, item_id_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_item_status(SPC_CDS, null, UserAgent, cookie, item_id_list);
            }
        }
    });
    return result;
}

const api_get_shop_report_by_time = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/shop_report_by_time/';
    Url += '?start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&agg_interval=' + agg_interval;
    Url += '&SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_shop_report_by_time(SPC_CDS, null, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
            }
        }
    });
    return result;
}

const api_get_captcha_info = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/selleraccount/v2/get_captcha_info/';
    Url += '?region=VN';
    Url += '&SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_captcha_info(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}

const api_get_campaign_statistics = async (SPC_CDS, proxy, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign_statistics/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&campaign_type=' + campaign_type;
    Url += '&filter_content=' + filter_content;
    Url += '&sort_key=' + sort_key;
    Url += '&sort_direction=' + sort_direction;
    Url += '&search_content=' + encodeURI(search_content);
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&offset=' + offset;
    Url += '&limit=' + limit;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_campaign_statistics(SPC_CDS, null, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
            }
        }
    });
    return result;
}

const api_get_search_ads = async (SPC_CDS, proxy, UserAgent, cookie, campaign_type, campaign_state, sort_key, sort_direction, search_content, start_time, end_time, offset, limit) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/search_ads/list/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    if (campaign_type == 'keyword' || campaign_type == 'shop')
        Url += '&campaign_type=' + campaign_type;
    Url += '&campaign_state=' + campaign_state;
    Url += '&sort_key=' + sort_key;
    Url += '&sort_direction=' + sort_direction;
    Url += '&search_content=' + encodeURI(search_content);
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&offset=' + offset;
    Url += '&limit=' + limit;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_search_ads(SPC_CDS, null, UserAgent, cookie, campaign_type, campaign_state, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
            }
        }
    });
    return result;
}

const api_get_suggest_keyword = async (SPC_CDS, proxy, UserAgent, cookie, keyword, count, placement, itemid, campaignid, adsid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/suggest/keyword/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&keyword=' + encodeURI(keyword);
    Url += '&count=' + count;
    Url += '&placement=' + placement;
    if (itemid != null && itemid != '') {
        Url += '&itemid=' + itemid;
    }
    if (campaignid != null && campaignid != '') {
        Url += '&campaignid=' + campaignid;
    }
    if (adsid != null && adsid != '') {
        Url += '&adsid=' + adsid;
    }
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_suggest_keyword(SPC_CDS, null, UserAgent, cookie, keyword, count, placement, itemid);
            }
        }
    });
    return result;
}

const api_post_marketing_campaign = async (SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, campaign_ads_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_post_marketing_campaign(SPC_CDS, null, UserAgent, cookie, campaign_ads_list);
            }
        }
    });
    return result;
}


const api_put_marketing_campaign = async (SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.put(Url, campaign_ads_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_put_marketing_campaign(SPC_CDS, null, UserAgent, cookie, campaign_ads_list);
            }
        }
    });
    return result;
}

const api_get_marketing_campaign = async (SPC_CDS, proxy, UserAgent, cookie, campaignid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&campaignid=' + campaignid;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_marketing_campaign(SPC_CDS, null, UserAgent, cookie, campaignid);
            }
        }
    });
    return result;
}


const api_get_marketing_meta = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/meta/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_marketing_meta(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}

const api_get_order_id_list = async (SPC_CDS, proxy, UserAgent, cookie, from_page_number, source, page_size, page_number, total, is_massship) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/v3/order/get_order_id_list/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&from_page_number=' + from_page_number;
    Url += '&source=' + source;
    Url += '&page_size=' + page_size;
    Url += '&page_number=' + page_number;
    Url += '&total=' + total;
    Url += '&is_massship=' + is_massship;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_order_id_list(SPC_CDS, null, UserAgent, cookie, from_page_number, source, page_size, page_number, total, is_massship);
            }
        }
    });
    return result;
}

const api_get_wallet_transactions = async (SPC_CDS, proxy, UserAgent, cookie, wallet_type, page_number, page_size, start_date, end_date, transaction_types) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/v3/finance/get_wallet_transactions/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&wallet_type=' + wallet_type;
    Url += '&page_number=' + page_number;
    Url += '&page_size=' + page_size;
    if (start_date != null)
        Url += '&start_date=' + start_date;
    if (end_date != null)
        Url += '&end_date=' + end_date;
    if (transaction_types != null)
        Url += '&transaction_types=' + transaction_types;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_wallet_transactions(SPC_CDS, null, UserAgent, cookie, wallet_type, page_number, page_size, start_date, end_date, transaction_types);
            }
        }
    });
    return result;
}

const api_get_package = async (SPC_CDS, proxy, UserAgent, cookie, order_id) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/v3/order/get_package';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&order_id=' + order_id;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_package(SPC_CDS, null, UserAgent, cookie, order_id);
            }
        }
    });
    return result;
}

const api_get_one_order = async (SPC_CDS, proxy, UserAgent, cookie, order_id) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/v3/order/get_one_order';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&order_id=' + order_id;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_one_order(SPC_CDS, null, UserAgent, cookie, order_id);
            }
        }
    });
    return result;
}

const api_get_income_transaction_history_detail = async (SPC_CDS, proxy, UserAgent, cookie, order_id) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/v3/finance/income_transaction_history_detail/';
    Url += '?order_id=' + order_id;
    Url += '&SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_income_transaction_history_detail(SPC_CDS, null, UserAgent, cookie, order_id);
            }
        }
    });
    return result;
}


const api_get_search_report_by_time = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, agg_interval) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/search_report_by_time/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&agg_interval=' + agg_interval;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_search_report_by_time(SPC_CDS, null, UserAgent, cookie, start_time, end_time, agg_interval);
            }
        }
    });
    return result;
}

const api_get_detail_report_by_time = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid, adsid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/detail_report_by_time/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&agg_interval=' + agg_interval;
    if (itemid != null && itemid != '') {
        Url += '&itemid=' + itemid;
    } else {
        Url += '&adsid=' + adsid;
    }

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_detail_report_by_time(SPC_CDS, null, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid, adsid);
            }
        }
    });
    return result;
}

const api_get_detail_report_by_keyword = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, itemid, adsid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/detail_report_by_keyword/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&agg_interval=' + agg_interval;
    Url += '&need_detail=' + need_detail;
    if (itemid != null && itemid != '') {
        Url += '&itemid=' + itemid;
    } else {
        Url += '&adsid=' + adsid;
    }

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_detail_report_by_keyword(SPC_CDS, null, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, itemid, adsid);
            }
        }
    });
    return result;
}

const api_get_item_report_by_time = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/item_report_by_time/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&agg_interval=' + agg_interval;
    Url += '&itemid=' + itemid;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_item_report_by_time(SPC_CDS, null, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid);
            }
        }
    });
    return result;
}

const api_get_item_report_by_placement = async (SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, itemid) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/item_report_by_placement/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&itemid=' + itemid;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_item_report_by_placement(SPC_CDS, null, UserAgent, cookie, start_time, end_time, placement_list, itemid);
            }
        }
    });
    return result;
}

const api_get_suggest_price = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_suggest_price/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_suggest_price(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_get_suggest_keyword_price = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_suggest_keyword_price/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, data, {
        headers: {
            'authority': 'banhang.shopee.vn',
            'sec-ch-ua': '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
            'sc-fe-ver': '30988',
            'sc-fe-session': uuidv4(),
            'user-agent': UserAgent,
            'content-type': 'application/json;charset=UTF-8',
            'accept': 'application/json, text/plain, */*',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'origin': 'https://banhang.shopee.vn',
            'sec-fetch-site': 'same-origin',
            'sec-fetch-mode': 'cors',
            'sec-fetch-dest': 'empty',
            'referer': 'https://banhang.shopee.vn/portal/marketing/pas/assembly/',
            'accept-language': 'en-US,en;q=0.9,vi;q=0.8',
            'cookie': cookie
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_suggest_keyword_price(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_get_segment_suggest_price = async (SPC_CDS, proxy, UserAgent, cookie, data) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_segment_suggest_price/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, data, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_segment_suggest_price(SPC_CDS, null, UserAgent, cookie, data);
            }
        }
    });
    return result;
}

const api_get_campaign_list = async (SPC_CDS, proxy, UserAgent, cookie, placement_list) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/list/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_campaign_list(SPC_CDS, null, UserAgent, cookie, placement_list);
            }
        }
    });
    return result;
}

const api_get_query_collection_list = async (SPC_CDS, proxy, UserAgent, cookie) => {
    if (cookie != null) {
        if (cookie.indexOf('[ROOT]') == -1)
            cookie = RSA.decrypt(cookie, 'utf8');
        else
            cookie = cookie.replace('[ROOT]', '');
    }
    let Url = 'https://banhang.shopee.vn/api/shopcategory/v3/category/query_collection_list/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent,
            referer: 'https://banhang.shopee.vn/'
        },
        //proxy: proxy
    }).then(function (response) {
        response.cookie = cookieParse(cookie, response.headers['set-cookie']);
        if (response.cookie != null)
            response.cookie = RSA.encrypt(response.cookie, 'base64');
        return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
    }).catch(function (error) {
        if (error.response) {
            error.response.cookie = cookieParse(cookie, error.response.headers['set-cookie']);
            if (error.response.cookie != null)
                error.response.cookie = RSA.encrypt(error.response.cookie, 'base64');
            return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
        } else {
            if (proxy == null) {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            } else {
                console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + ']', proxy.host, proxy.port, error.code + ' ' + error.message);
                if (cookie != null) {
                    cookie = RSA.encrypt(cookie, 'base64');
                }
                return api_get_query_collection_list(SPC_CDS, null, UserAgent, cookie);
            }
        }
    });
    return result;
}


module.exports = {
    api_dynamic_request,
    api_post_login, //Đăng nhập
    api_get_all_category_list, //Lấy danh mục của shopee
    api_get_second_category_list, //Lấy danh mục cấp độ 2 của shopee 
    api_get_page_active_collection_list, //Lấy danh mục shop đang sử dụng
    api_get_query_collection_list,
    api_get_product_selector, //Lấy danh sách sản phẩm
    api_get_item_status, //Lấy danh sách quảng cáo của sản phẩm

    api_get_shop_report_by_time, //Lấy dữ liệu thống kê chung của quảng cáo
    api_get_campaign_statistics, //Lấy dữ liệu thống kê chi tiết của quảng cáo

    api_get_suggest_keyword, //Lấy gợi ý từ khóa quảng cáo

    api_post_marketing_campaign, //Thêm quảng cáo
    api_put_marketing_campaign, //Cập nhật quảng cáo
    api_get_marketing_campaign, //Lấy thông tin quảng cáo

    api_get_suggest_price, //Lấy giá thầu gợi ý

    api_get_detail_report_by_time, //Lấy dữ liệu thống kê chi tiết của quảng cáo đấu thầu từ khóa theo mã sản phẩm
    api_get_detail_report_by_keyword, //Lấy dữ liệu thống kê chi tiết của quảng cáo đấu thầu từ khóa theo mã sản phẩm

    api_get_campaign_list, //Lấy danh sách quảng cáo

    api_get_item_report_by_time, //Lấy dữ liệu thống kê chi tiết của quảng cáo khám phá theo mã sản phẩm
    api_get_item_report_by_placement, //Lấy dữ liệu thống kê chi tiết của quảng cáo khám phá theo mã sản phẩm
    api_get_shop_info,
    api_get_search_ads,
    api_get_search_report_by_time,
    api_post_marketing_graphql,
    api_get_marketing_meta,
    api_put_marketing_mass_edit,
    api_put_marketing_search_ads,
    api_get_segment_suggest_price,
    api_get_search_hint,
    api_get_suggest_keyword_price,
    api_get_captcha_info,
    api_get_search_items,
    api_get_shop_info_shopid,
    api_get_search_items_waiting,
    api_get_order_id_list,
    api_get_package,
    api_get_one_order,
    api_get_wallet_transactions,
    api_get_income_transaction_history_detail
}