const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
//Example Shopee


(async () => {
    //Khởi tạo thông tin đăng nhập
    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    const SPC_CDS = uuidv4();
    var username = '0962986537'; //Tên người dùng
    var password = 'Quang199416'; //Mật khẩu
    //Đăng nhập
    var cookie = 'SPC_SC_UD=29630508; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="MoHHYFLyqojCsVV2c0/V00EryyoCh74IRv1mpDlz0QopF4aLIzwIKLA2hOAPcwberHLaxeoEFGM9BUqHo8+HjDNDakTvUuJoxRNDq0PQFJJb9FF9eLMQpLf4JcSwpcFivMyMa5LxbhjI1WDDpsu/gTTiO0fX/9KAUzwkVfJU2pPmf+d+82rTvcMVy1bT9sVO"; SPC_U=29630508; SPC_SC_SA_TK=; SPC_F=6MzA8aRs7gVPm5D9Avb0JM5vmzKrX76J; SPC_EC="HalBQz6p4Ms6luH9vSBsF2CxToKE6bAH1c4KjG6KpiU8nyn8zx5jhbEGlO2LTPvtJtH5tiovxEAGWTAv5ZBEid/Lu7o5waFhXQt4wSJZvBKK9A/fik4HBxH2u3evChhb8eFurZcBjwC5TCg4SgCwrw=="; SC_SSO=-; SPC_SC_TK=1adb2853643d22a324073502d5157455; SPC_WST="HalBQz6p4Ms6luH9vSBsF2CxToKE6bAH1c4KjG6KpiU8nyn8zx5jhbEGlO2LTPvtJtH5tiovxEAGWTAv5ZBEid/Lu7o5waFhXQt4wSJZvBKK9A/fik4HBxH2u3evChhb8eFurZcBjwC5TCg4SgCwrw=="; SC_DFP=7ByM3mi87new9aRR7AvpwlvxIfwp7eG3';
    var result = await shopeeApi.api_post_login(SPC_CDS, null, UserAgent, cookie, username, password, null, null, null);
    //Kiểm tra yêu cầu OTP
    if (result.status == 481) {
        //Nhập OTP
        const { OTP } = await prompt.get(['OTP']);
        //Đăng nhập với OTP
        result = await shopeeApi.api_post_login(SPC_CDS, null, UserAgent, cookie, username, password, OTP, null, null);
    }
    console.log(result);
})();
