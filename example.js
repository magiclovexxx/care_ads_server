const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
var moment = require('moment');
const NodeRSA = require('node-rsa');

(async () => {
    
   /* const key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
        'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
        '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
        'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
        '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
        'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
        'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
        '-----END RSA PRIVATE KEY-----');
    const text = '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';
   // var encrypted = key.encrypt(text, 'base64');
    
    //console.log('encrypted: ', encrypted);
    const decrypted = key.decrypt(text, 'utf8');
    console.log('decrypted: ', decrypted);
    /*
    var schedule = JSON.parse('{"hourOfDay":["0","1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23"],"monthOfYear":["1","2","3","4","5","6","7","8","9","10","11","12"],"dayOfWeek":["1","2","3","4","5","6","0"],"dayOfMonth":["1","2","3","4","5","6","7","8","9","10","11","12","13","14","15","16","17","18","19","20","21","22","23","24","25","26","27","28","29","30","31"]}');
    if (!(schedule.hourOfDay.indexOf((+moment().format('HH')).toString()) != -1 &&
        schedule.dayOfWeek.indexOf(moment().day().toString()) != -1 &&
        schedule.dayOfMonth.indexOf((+moment().format('DD')).toString()) != -1 &&
        schedule.monthOfYear.indexOf((+moment().format('MM')).toString()) != -1)) {
        console.log('NO');
    }
    else {
        console.log('OK');
    }*/
    //Khởi tạo thông tin đăng nhập
    /*
    const UserAgent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4503.5 Safari/537.36';
    const SPC_CDS = uuidv4();
    var username = '0962986537'; //Tên người dùng
    var password = 'Quang199416'; //Mật khẩu
    //Đăng nhập
    var cookie = encrypted;
    var result = await shopeeApi.api_post_login(SPC_CDS, null, UserAgent, cookie, username, password, null, null, null);
    //Kiểm tra yêu cầu OTP
    if (result.status == 481) {
        //Nhập OTP
        const { OTP } = await prompt.get(['OTP']);
        //Đăng nhập với OTP
        result = await shopeeApi.api_post_login(SPC_CDS, null, UserAgent, cookie, username, password, OTP, null, null);
    }
    console.log(result);
*/
})();
