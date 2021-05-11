var express = require('express');
var shopeeApi = require('../api/ads_shopee.js');
var router = express.Router();

/**
 * Home page: loading all product
 */
router.get('/',async (req, res)  => {
   cookie = await shopeeApi.loginShopee()
   console.log(cookie)
   res.send(cookie)
   
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
        created:d,
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