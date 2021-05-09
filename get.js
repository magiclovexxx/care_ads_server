const axios = require('axios').default;

get2fa = async () => {
    getDataShopee = await axios.get("HTTP://facode.tranquoctoan.com?key=12345999")

    console.log(getDataShopee.data)
}

(async () => {
    await get2fa()

})();
