var express = require('express');
var shopeeApi = require('../api/ads_shopee.js');
var router = express.Router();
const { v4: uuidv4 } = require('uuid');

/**
 * Home page: loading all product
 */
router.get('/', async (req, res) => {
    username = "lozita.official"
    password = "Longgiang96137"
    vcode = ""
    //UserAgent = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/90.0.4430.93 Safari/537.36 Edg/90.0.818.56"
    UserAgent = ""
    start_time = 1620752400 //Thời gian bắt đầu (format Unix Timestamp)
    end_time = 1620838799 //Thời gian kết thúc (format Unix Timestamp) (0: Không giới hạn thời gian)
    agg_interval = 96
    placement_list = [0, 4]

    //cookie = await shopeeApi.api_post_login(SPC_CDS_key,UserAgent,username,password,vcode)
    SPC_CDS_key = uuidv4()

    SPC_CDS = "79e62f9e-cdec-4a8c-8001-b6f4f8a7ab3f"
    cookie = 'SPC_SC_UD=328813267; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="OBP9VCTLtqWIZi3anGwer3kv3N/gtsl7ZG+/XcyeUKi5AkJaXNNpqFsDH6QgR+wYqMvUa60kfjrG/7wtN/6375bFaJkSj40Crqb5+RmXgzwjzpaHTRny3nHaBsUbdXNUhDO5W9iGyXvna3d0nQEloYfniOoYh8leI4vxlcBCdi277t5O9912Rc3ybBmdDUJH"; SPC_U=328813267; SPC_SC_SA_TK=; SPC_F=EQtS0EQ2YQmSPqfuzpgGC1pJ0mH5t28E; SPC_EC="85aSu+tAHgbHyCp0NkPz5wexZjkqiMfXnUNCc/281FbmARyc7svqSMpfKxO6xGR8w7b5ehikU5iOjRsogKhtN08w9+WtBArC+E5MP6/xmzQHYCKtzUqMeiMskurEpCqKQiQaAInfA4qRuZEX592nfhvrlX1R1KN1Uq09aJENPA0="; SC_SSO=-; SPC_SC_TK=39cc1ac6c62ae4324e3138464847c10b; SPC_WST="85aSu+tAHgbHyCp0NkPz5wexZjkqiMfXnUNCc/281FbmARyc7svqSMpfKxO6xGR8w7b5ehikU5iOjRsogKhtN08w9+WtBArC+E5MP6/xmzQHYCKtzUqMeiMskurEpCqKQiQaAInfA4qRuZEX592nfhvrlX1R1KN1Uq09aJENPA0="; SC_DFP=jq8TPJNTyLARHTnjIzLDRBd8IUvWeMqh'

    var filter_content = 'all'
    var sort_key = 'impression'
    var campaign_type = 'keyword'
    var sort_direction = 1; //1: Sắp xếp giảm dần, 2: Sắp xếp tăng dần
    var search_content = ''; //Từ khóa tìm kiếm
    var start_time = 1618246800; //Thời gian bắt đầu (format Unix Timestamp)
    var end_time = 1620838799; //Thời gian kết thúc (format Unix Timestamp)
    var offset = 0; //Bắt đầu sản phẩm thứ n (Phân trang)
    var limit = 50; //Giới hạn số lượng dòng (Phân trang)

    //console.log(SPC_CDS_key)
    //console.log(cookie)

    //api_get_shop_report_by_time = await shopeeApi.api_get_shop_report_by_time(SPC_CDS_key, UserAgent, cookie, start_time, end_time, placement_list, agg_interval)
    result = await shopeeApi.api_get_campaign_statistics(SPC_CDS, UserAgent, cookie, campaign_type, filter_content, sort_key, sort_direction, search_content, start_time, end_time, offset, limit)

    console.log(result)

    res.send(result)

});

/**
 * Go to Add Product page
 */
router.get('/login', (req, res) => {
    res.render('add-product');
});

/**
 * Add new Product
 */
router.post('/', (req, res) => {
    console.log("Add product")
    d = new Date()
    d = d.toString()
    let newProduct = new Product({
        name: req.body.productName,
        type: req.body.productType,
        created: d,
        shop_id: "1902231"
    });


});

/**
 * Go to Update Product page
 */
router.get('/loginShopee', (req, res) => {

});

/**
 * Delete product
 */
router.delete('/:productId', (req, res) => {
    let productId = req.params.productId;

});

/**
 * Update product
 */
router.post('/:productId', (req, res) => {
    let productId = req.params.productId;

});

module.exports = router;