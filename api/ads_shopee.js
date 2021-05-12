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

const api_login = async (SPC_CDS, SPC_CDS_VER, cookie, username, phone, password, remember, vcode) => {        
    const password_hash = crypto.createHash('sha256').update(md5(password)).digest('hex');
    const Url = 'https://banhang.shopee.vn/api/v2/login/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER;
    var data = (username != null ? 'username=' + username : 'phone=' + phone);
    data += '&password_hash=' + password_hash;
    data += '&remember=' + (remember ? 'true' : 'false');
    if(vcode != null)
    {
        data += '&vcode=' + vcode;
    }
    const result = await axiosInstance.post(Url, data).then(function(response) {  
        return { status: response.status, data: response.data, cookie: response.headers['set-cookie'] };
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

const api_get_all_category_list = async (SPC_CDS, SPC_CDS_VER, cookie, version) => {        
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_all_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER + '&version=' + version;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookieParse(cookie),
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

const api_get_second_category_list = async (SPC_CDS, SPC_CDS_VER, cookie, version) => {        
    const Url = 'https://banhang.shopee.vn/api/v3/category/get_second_category_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER + '&version=' + version;
    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookieParse(cookie),
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

const api_shopcategory = async (SPC_CDS, SPC_CDS_VER, cookie, page_number, page_size) => {        
    var Url = 'https://banhang.shopee.vn/api/shopcategory/v3/category/page_active_collection_list/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER;
    Url += '&page_number=' + page_number;
    Url += '&page_size=' + page_size;

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookieParse(cookie),
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

const api_product_selector = async (SPC_CDS, SPC_CDS_VER, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content) => {        
    var Url = 'https://banhang.shopee.vn/api/marketing/v3/public/product_selector/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER;
    Url += '&offset=' + offset;
    Url += '&limit=' + limit;
    Url += '&is_ads=' + is_ads;
    Url += '&need_brand=' + need_brand;
    Url += '&need_item_model=' + need_item_model;
    if (search_type != null) {
        Url += '&search_type=' + search_type;
        Url += '&search_content=' + search_content;        
    }

    const result = await axiosInstance.get(Url, {
        headers: {
            cookie: cookieParse(cookie),
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

const api_get_item_status = async (SPC_CDS, SPC_CDS_VER, cookie, item_id_list) => {
    const Url = 'https://banhang.shopee.vn/api/marketing/v3/pas/get_item_status/?SPC_CDS=' + SPC_CDS + '&SPC_CDS_VER=' + SPC_CDS_VER;
    const result = await axiosInstance.post(Url, item_id_list, {
        headers: {
            cookie: cookieParse(cookie),
        }
    }).then(function(response) {  
        return { status: response.status, data: response.data };
    }).catch(function(error) {
        if (error.response) {
            return { status: error.response.status, data: error.response.data };
        }
        else {
            return { status: -1, data: null, cookie: null };
        }
    });
    return result;
}

module.exports = {

    api_login,
    api_get_all_category_list,
    api_get_second_category_list,
    api_shopcategory,
    api_product_selector,
    api_get_item_status,
}