const md5 = require('md5');
const crypto = require('crypto');

function createAxios() {
    const axios = require('axios');
    return axios.create({ withCredentials: true });
}

function cookieParse(cookie)
{
    var result = [];
    for(var i = 0; i < cookie.length; i++)
        result.push(cookie[i].split(';')[0]);
    return result.join('; ');
}

const axiosInstance = createAxios();

//API FUNCTION
const api_post_login = async (SPC_CDS, UserAgent, username, password, vcode) => {
    const password_hash = crypto.createHash('sha256').update(md5(password)).digest('hex');
    const Url = 'https://banhang.shopee.vn/api/v2/login/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    var data = '';
    var vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    if (vnf_regex.test(username) == false) {
        data += '&username=' + encodeURI(username);
    } else {        
        data += '&phone=' + encodeURI('84' + username.substring(1, 10));
    }
    data += '&password_hash=' + password_hash;
    data += '&remember=true';
    if(vcode != null)
    {
        data += '&vcode=' + vcode;
    }
    const result = await axiosInstance.post(Url, data, {
        headers: {
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data, cookie: cookieParse(response.headers['set-cookie']) };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data, cookie: null };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

const api_get_all_category_list = async (SPC_CDS, UserAgent, cookie) => {        
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_all_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2&version=3.1.0';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_second_category_list = async (SPC_CDS, UserAgent, cookie) => {        
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_second_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2&version=3.1.0';
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_shopcategory = async (SPC_CDS, UserAgent, cookie, page_number, page_size) => {        
    var Url = 'https://banhang.shopee.vn/api/shopcategory/v3/category/page_active_collection_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    Url += '&page_number=' + page_number;
    Url += '&page_size=' + page_size;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_product_selector = async (SPC_CDS, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/public/product_selector/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    Url += '&offset=' + offset;
    Url += '&limit=' + limit;
    Url += '&is_ads=' + is_ads;
    Url += '&need_brand=' + need_brand;
    Url += '&need_item_model=' + need_item_model;
    if (search_type != null) {
        Url += '&search_type=' + search_type;
        Url += '&search_content=' + encodeURI(search_content);        
    }

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_item_status = async (SPC_CDS, UserAgent, cookie, item_id_list) => {
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_item_status/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, item_id_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_shop_report_by_time = async (SPC_CDS, UserAgent, cookie, start_time, end_time, placement_list, agg_interval) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/report/shop_report_by_time/';
    Url += '?start_time=' + start_time;
    Url += '&end_time=' + end_time;
    Url += '&placement_list=' + encodeURI(JSON.stringify(placement_list));
    Url += '&agg_interval=' + agg_interval;
    Url += '&SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_campaign_statistics = async (SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign_statistics/';
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
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_suggest_keyword = async (SPC_CDS, UserAgent, cookie, keyword, count, placement, itemid) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/suggest/keyword/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&keyword=' + encodeURI(keyword);
    Url += '&count=' + count;
    Url += '&placement=' + placement;
    Url += '&itemid=' + itemid;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_post_marketing_campaign = async (SPC_CDS, UserAgent, cookie, campaign_ads_list) => {
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.post(Url, campaign_ads_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}


const api_put_marketing_campaign = async (SPC_CDS, UserAgent, cookie, campaign_ads_list) => {
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=2';
    const result = await axiosInstance.put(Url, campaign_ads_list, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

const api_get_marketing_campaign = async (SPC_CDS, UserAgent, cookie, campaignid) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/campaign/';
    Url += '?SPC_CDS=' + SPC_CDS;
    Url += '&SPC_CDS_VER=2';
    Url += '&campaignid=' + campaignid;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookie,
            'User-Agent': UserAgent
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null };
        }
    });
    return result;
}

module.exports = {
    api_post_login,
    api_get_all_category_list,
    api_get_second_category_list,
    api_get_shopcategory,
    api_get_product_selector,
    api_get_item_status,
    api_get_shop_report_by_time,
    api_get_campaign_statistics,
    api_get_suggest_keyword,
    api_post_marketing_campaign,
    api_put_marketing_campaign,
    api_get_marketing_campaign,   
}