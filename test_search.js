const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
var moment = require('moment');
const NodeRSA = require('node-rsa');

(async () => {
    while (true) {
        const { keyword } = await prompt.get(['keyword']);
        if (keyword != 'exit') {            
            let user_agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/93.0.4557.4 Safari/537.36';
            const { forcount } = await prompt.get(['forcount']);
            for (let i = 0; i < forcount; i++) {
                let start_unix = moment().unix();
                let result = await shopeeApi.api_get_search_items_waiting(null, user_agent, null, 'relevancy', keyword, 60, 0, 'desc', 'search', 'PAGE_GLOBAL_SEARCH', 2);
                let end_unix = moment().unix();
                console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Tìm vị trí:', i, keyword, result.message, (end_unix - start_unix) + 's');
            }
        } else {
            break;
        }
    }
})();
