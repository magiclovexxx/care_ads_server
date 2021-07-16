const express = require('express');
const shopeeApi = require('../api/ads_shopee.js');
const router = express.Router();
const moment = require('moment');

router.use(express.json({ limit: "5000mb", extended: true }));

router.get("/", async (req, res) => {
    res.send("SACUCO SYSTEM");
});

router.post("/api_dynamic_request", async (req, res) => {
    try {
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let url = req.body.url;
        let method = req.body.method;
        let data = req.body.data;
        let result = await shopeeApi.api_dynamic_request(proxy, UserAgent, cookie, url, method, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_dynamic_request', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_dynamic_request', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.post("/api_post_login", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let username = req.body.username;
        let password = req.body.password;
        let vcode = req.body.vcode;
        let captcha = req.body.captcha;
        let captcha_id = req.body.captcha_id;
        let result = await shopeeApi.api_post_login(SPC_CDS, proxy, UserAgent, null, username, password, vcode, captcha, captcha_id);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_login', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_login', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_captcha_info", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_captcha_info(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_captcha_info', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_captcha_info', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_all_category_list", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_all_category_list(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_all_category_list', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_all_category_list', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_second_category_list", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_second_category_list(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_second_category_list', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_second_category_list', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_shop_info", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_shop_info(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_shop_info', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_shop_info', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_page_active_collection_list", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let page_number = req.body.page_number;
        let page_size = req.body.page_size;

        let result = await shopeeApi.api_get_page_active_collection_list(SPC_CDS, proxy, UserAgent, cookie, page_number, page_size);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_page_active_collection_list', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_page_active_collection_list', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_query_collection_list", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_query_collection_list(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_query_collection_list', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_query_collection_list', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_product_selector", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let offset = req.body.offset;
        let limit = req.body.limit;
        let is_ads = req.body.is_ads;
        let need_brand = req.body.need_brand;
        let need_item_model = req.body.need_item_model;
        let search_type = req.body.search_type;
        let search_content = req.body.search_content;
        let sort_by = req.body.sort_by;
        let result = await shopeeApi.api_get_product_selector(SPC_CDS, proxy, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content, sort_by);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_product_selector', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_product_selector', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.post("/api_get_item_status", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let item_id_list = req.body.item_id_list;
        let result = await shopeeApi.api_get_item_status(SPC_CDS, proxy, UserAgent, cookie, item_id_list);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_status', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_status', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.post("/api_post_marketing_graphql", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        data.variables.statusType = parseInt(0);
        let result = await shopeeApi.api_post_marketing_graphql(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_marketing_graphql', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_marketing_graphql', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.put("/api_put_marketing_mass_edit", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        let result = await shopeeApi.api_put_marketing_mass_edit(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_mass_edit', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_mass_edit', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.put("/api_put_marketing_search_ads", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        let result = await shopeeApi.api_put_marketing_search_ads(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_search_ads', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_search_ads', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_shop_report_by_time", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let placement_list = req.body.placement_list;
        let agg_interval = req.body.agg_interval;
        let result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_shop_report_by_time', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_shop_report_by_time', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_campaign_statistics", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let campaign_type = req.body.campaign_type;
        let filter_content = req.body.filter_content;
        let sort_key = req.body.sort_key;
        let sort_direction = req.body.sort_direction;
        let search_content = req.body.search_content;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let offset = req.body.offset;
        let limit = req.body.limit;
        let result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, proxy, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_campaign_statistics', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_campaign_statistics', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_search_ads", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let campaign_type = req.body.campaign_type;
        let campaign_state = req.body.campaign_state;
        let sort_key = req.body.sort_key;
        let sort_direction = req.body.sort_direction;
        let search_content = req.body.search_content;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let offset = req.body.offset;
        let limit = req.body.limit;
        let result = await shopeeApi.api_get_search_ads(SPC_CDS, proxy, UserAgent, cookie, campaign_type, campaign_state, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_ads', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_ads', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_suggest_keyword", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let keyword = req.body.keyword;
        let count = req.body.count;
        let placement = req.body.placement;
        let itemid = req.body.itemid;
        let result = await shopeeApi.api_get_suggest_keyword(SPC_CDS, proxy, UserAgent, cookie, keyword, count, placement, itemid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_keyword', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_keyword', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.post("/api_post_marketing_campaign", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let campaign_ads_list = req.body.campaign_ads_list;
        let result = await shopeeApi.api_post_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_marketing_campaign', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_post_marketing_campaign', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.put("/api_put_marketing_campaign", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let campaign_ads_list = req.body.campaign_ads_list;
        let result = await shopeeApi.api_put_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_campaign', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_put_marketing_campaign', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_marketing_campaign", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let campaignid = req.body.campaignid;
        let result = await shopeeApi.api_get_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaignid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_marketing_campaign', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_marketing_campaign', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_marketing_meta", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let result = await shopeeApi.api_get_marketing_meta(SPC_CDS, proxy, UserAgent, cookie);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_marketing_meta', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_marketing_meta', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_detail_report_by_time", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let placement_list = req.body.placement_list;
        let agg_interval = req.body.agg_interval;
        let itemid = req.body.itemid;
        let adsid = req.body.adsid;

        let result = await shopeeApi.api_get_detail_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid, adsid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_detail_report_by_time', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_detail_report_by_time', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});


router.get("/api_get_search_report_by_time", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let agg_interval = req.body.agg_interval;

        let result = await shopeeApi.api_get_search_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, agg_interval);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_report_by_time', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_report_by_time', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_detail_report_by_keyword", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let placement_list = req.body.placement_list;
        let agg_interval = req.body.agg_interval;
        let need_detail = req.body.need_detail;
        let itemid = req.body.itemid;
        let adsid = req.body.adsid;

        let result = await shopeeApi.api_get_detail_report_by_keyword(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, itemid, adsid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_detail_report_by_keyword', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_detail_report_by_keyword', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_item_report_by_time", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let placement_list = req.body.placement_list;
        let agg_interval = req.body.agg_interval;
        let itemid = req.body.itemid;

        let result = await shopeeApi.api_get_item_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_report_by_time', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_report_by_time', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_item_report_by_placement", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let start_time = req.body.start_time;
        let end_time = req.body.end_time;
        let placement_list = req.body.placement_list;
        let itemid = req.body.itemid;

        let result = await shopeeApi.api_get_item_report_by_placement(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, itemid);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_report_by_placement', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_item_report_by_placement', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});


router.post("/api_get_suggest_price", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        let result = await shopeeApi.api_get_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_price', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_price', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});


router.post("/api_get_segment_suggest_price", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        let result = await shopeeApi.api_get_segment_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_segment_suggest_price', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_segment_suggest_price', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.post("/api_get_suggest_keyword_price", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let data = req.body.data;
        let result = await shopeeApi.api_get_suggest_keyword_price(SPC_CDS, proxy, UserAgent, cookie, data);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_keyword_price', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_suggest_keyword_price', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_campaign_list", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let placement_list = req.body.placement_list;
        let result = await shopeeApi.api_get_campaign_list(SPC_CDS, proxy, UserAgent, cookie, placement_list);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_campaign_list', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_campaign_list', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_search_hint", async (req, res) => {
    try {
        let SPC_CDS = req.body.SPC_CDS;
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let keyword = req.body.keyword;
        let type = req.body.type;
        let result = await shopeeApi.api_get_search_hint(SPC_CDS, proxy, UserAgent, cookie, keyword, type);
        if (result.code != 0) {
            console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_hint', result);
        }
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_hint', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_search_items", async (req, res) => {
    try {
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let by = req.body.by;
        let keyword = req.body.keyword;
        let limit = req.body.limit;
        let newest = req.body.newest;
        let order = req.body.order;
        let result = await shopeeApi.api_get_search_items(proxy, UserAgent, cookie, by, keyword, limit, newest, order, 'search', 'PAGE_GLOBAL_SEARCH', 2);
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_search_items', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});

router.get("/api_get_shop_info_shopid", async (req, res) => {
    try {
        let proxy = req.body.proxy;
        let UserAgent = req.body.UserAgent;
        let cookie = req.body.cookie;
        let shopid = req.body.shopid;
        let result = await shopeeApi.api_get_shop_info_shopid(proxy, UserAgent, cookie, shopid);
        res.send(result);
    }
    catch (ex) {
        console.error('[' + moment().format('MM/DD/YYYY HH:mm:ss') + '] api_get_shop_info_shopid', { code: 1001, message: ex });
        res.send({ code: 1001, message: ex });
    }
});


module.exports = router;