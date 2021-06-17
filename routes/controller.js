var express = require('express');
var shopeeApi = require('../api/ads_shopee.js');
var router = express.Router();


router.use(express.json({ limit: "5000mb", extended: true }));

router.get("/", async (req, res) => {

    res.send("----------- OK -----------");
});

router.post("/api_post_login", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var username = req.body.username;
        var password = req.body.password;
        var vcode = req.body.vcode;
        var captcha = req.body.captcha;
        var captcha_id = req.body.captcha_id;
        var result = await shopeeApi.api_post_login(SPC_CDS, proxy, UserAgent, username, password, vcode, captcha, captcha_id);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_captcha_info", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var result = await shopeeApi.api_get_captcha_info(SPC_CDS, proxy, UserAgent);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_all_category_list", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var result = await shopeeApi.api_get_all_category_list(SPC_CDS, proxy, UserAgent, cookie);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_second_category_list", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var result = await shopeeApi.api_get_second_category_list(SPC_CDS, proxy, UserAgent, cookie);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_shop_info", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var result = await shopeeApi.api_get_shop_info(SPC_CDS, proxy, UserAgent, cookie);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_page_active_collection_list", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var page_number = req.body.page_number;
        var page_size = req.body.page_size;

        var result = await shopeeApi.api_get_page_active_collection_list(SPC_CDS, proxy, UserAgent, cookie, page_number, page_size);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_query_collection_list", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var result = await shopeeApi.api_get_query_collection_list(SPC_CDS, proxy, UserAgent, cookie);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_product_selector", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var offset = req.body.offset;
        var limit = req.body.limit;
        var is_ads = req.body.is_ads;
        var need_brand = req.body.need_brand;
        var need_item_model = req.body.need_item_model;
        var search_type = req.body.search_type;
        var search_content = req.body.search_content;
        var sort_by = req.body.sort_by;
        var result = await shopeeApi.api_get_product_selector(SPC_CDS, proxy, UserAgent, cookie, offset, limit, is_ads, need_brand, need_item_model, search_type, search_content, sort_by);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.post("/api_get_item_status", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var item_id_list = req.body.item_id_list;
        var result = await shopeeApi.api_get_item_status(SPC_CDS, proxy, UserAgent, cookie, item_id_list);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.post("/api_post_marketing_graphql", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var data = req.body.data;
        data.variables.statusType = parseInt(0);
        var result = await shopeeApi.api_post_marketing_graphql(SPC_CDS, proxy, UserAgent, cookie, data);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.post("/api_post_marketing_mass_edit", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var data = req.body.data;
        console.log(data);
        var result = await shopeeApi.api_post_marketing_mass_edit(SPC_CDS, proxy, UserAgent, cookie, data);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_shop_report_by_time", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var placement_list = req.body.placement_list;
        var agg_interval = req.body.agg_interval;
        var result = await shopeeApi.api_get_shop_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_campaign_statistics", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var campaign_type = req.body.campaign_type;
        var filter_content = req.body.filter_content;
        var sort_key = req.body.sort_key;
        var sort_direction = req.body.sort_direction;
        var search_content = req.body.search_content;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var offset = req.body.offset;
        var limit = req.body.limit;
        var result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, proxy, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_search_ads", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var campaign_type = req.body.campaign_type;
        var campaign_state = req.body.campaign_state;
        var sort_key = req.body.sort_key;
        var sort_direction = req.body.sort_direction;
        var search_content = req.body.search_content;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var offset = req.body.offset;
        var limit = req.body.limit;
        var result = await shopeeApi.api_get_search_ads(SPC_CDS, proxy, UserAgent, cookie, campaign_type, campaign_state, sort_key, sort_direction, search_content, start_time, end_time, offset, limit);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_suggest_keyword", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var keyword = req.body.keyword;
        var count = req.body.count;
        var placement = req.body.placement;
        var itemid = req.body.itemid;
        var result = await shopeeApi.api_get_suggest_keyword(SPC_CDS, proxy, UserAgent, cookie, keyword, count, placement, itemid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.post("/api_post_marketing_campaign", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var campaign_ads_list = req.body.campaign_ads_list;     
        var result = await shopeeApi.api_post_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.put("/api_put_marketing_campaign", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var campaign_ads_list = req.body.campaign_ads_list;
        var result = await shopeeApi.api_put_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaign_ads_list);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_marketing_campaign", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var campaignid = req.body.campaignid;
        var result = await shopeeApi.api_get_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaignid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_marketing_meta", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var result = await shopeeApi.api_get_marketing_meta(SPC_CDS, proxy, UserAgent, cookie);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_detail_report_by_time", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var placement_list = req.body.placement_list;
        var agg_interval = req.body.agg_interval;
        var itemid = req.body.itemid;
        var adsid = req.body.adsid;

        var result = await shopeeApi.api_get_detail_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid, adsid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});


router.get("/api_get_search_report_by_time", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var agg_interval = req.body.agg_interval;

        var result = await shopeeApi.api_get_search_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, agg_interval);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_detail_report_by_keyword", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var placement_list = req.body.placement_list;
        var agg_interval = req.body.agg_interval;
        var need_detail = req.body.need_detail;
        var itemid = req.body.itemid;
        var adsid = req.body.adsid;

        var result = await shopeeApi.api_get_detail_report_by_keyword(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, need_detail, itemid, adsid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_item_report_by_time", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var placement_list = req.body.placement_list;
        var agg_interval = req.body.agg_interval;
        var itemid = req.body.itemid;

        var result = await shopeeApi.api_get_item_report_by_time(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, agg_interval, itemid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_item_report_by_placement", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var start_time = req.body.start_time;
        var end_time = req.body.end_time;
        var placement_list = req.body.placement_list;
        var itemid = req.body.itemid;

        var result = await shopeeApi.api_get_item_report_by_placement(SPC_CDS, proxy, UserAgent, cookie, start_time, end_time, placement_list, itemid);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});


router.post("/api_get_suggest_price", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var data = req.body.data;
        var result = await shopeeApi.api_get_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});


router.post("/api_get_segment_suggest_price", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var data = req.body.data;
        var result = await shopeeApi.api_get_segment_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.post("/api_get_suggest_keyword_price", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var data = req.body.data;
        var result = await shopeeApi.api_get_suggest_keyword_price(SPC_CDS, proxy, UserAgent, cookie, data);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_campaign_list", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var placement_list = req.body.placement_list;

        var result = await shopeeApi.api_get_campaign_list(SPC_CDS, proxy, UserAgent, cookie, placement_list);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});

router.get("/api_get_search_hint", async (req, res) => {
    try {
        var SPC_CDS = req.body.SPC_CDS;
        var proxy = req.body.proxy;
        var UserAgent = req.body.UserAgent;
        var cookie = req.body.cookie;
        var keyword = req.body.keyword;
        var type = req.body.type;
        var result = await shopeeApi.api_get_search_hint(SPC_CDS, proxy, UserAgent, cookie, keyword, type);
        res.send(result);
    }
    catch (ex) {
        console.log(ex);
        res.send({ code: 1001, exception: ex });
    }
});




module.exports = router;