
const ShopeeAPI = require('./api/ShopeeAPI.js');
var api = new ShopeeAPI();

run = async () => {
    const r = await api.api_get_search_items(null, null, null, null, 'Ví nữ', 60, 60, null, null, null, null, null);
    console.log(r);
}


run();
