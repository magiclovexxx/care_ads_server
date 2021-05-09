const axios = require('axios').default;
const puppeteer = require('puppeteer');
const randomUseragent = require('random-useragent');


const loginShopee = async (usser, passs) => {
    // lay cookie
    cookie = ""


    // trả về cookie kênh người bán
    return cookie

}

loginShopeeWithFaCode = async (usser, passs, facode) => {
    cookie1 = ""

    var data = JSON.stringify({ "shopid": shopId });

    var config = {
        method: 'post',
        url: 'https://shopee.vn/api/v4/shop/follow',
        headers: {
            'content-type': 'application/json',
            'referer': ref,
            'cookie': cookie1
        },
        data: data
    };

    axios(config)
        .then(function (response) {
            console.log(response.data);
        })
        .catch(function (error) {
            console.log(error);
        });


}
function csrftoken() {
    karakter = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    PanjangKarakter = karakter.length;
    acakString = '';
    for (let i = 0; i < 32; i++) {
        PanjangKarakter = PanjangKarakter - 1
        acakString += karakter[Math.floor(Math.random() * (PanjangKarakter))];


    }
    return acakString;
}





module.exports = {

    loginShopee,
    loginShopeeWithFaCode,
    
}