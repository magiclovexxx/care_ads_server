const { v4: uuidv4 } = require('uuid');
const prompt = require('prompt');
var shopeeApi = require('./api/ads_shopee.js');
var moment = require('moment');
const NodeRSA = require('node-rsa');

(async () => {
    /*
    const key = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
        'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
        '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
        'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
        '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
        'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
        'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
        '-----END RSA PRIVATE KEY-----');
    const text = 'SPC_SC_UD=29630508; SC_SSO_U=-; SPC_SC_SA_UD=; SPC_STK="yU7MEZJ2Z/japlbaVTYTbgYkum4ShDWcOhsavGsBXCA2X0TshazlWTVBR5N3s2IYhL6EFhf+cKTzk3SGHsVgsv7Ni6Zp6QQWYBvpe3/TC2hDW8BnQimD6s3tqSL6eHj9VnrCcw7eg0shV8ogQ33/G3tAo4yUuPS5Bfawbu/xMMEOSN6z5vPavimPnFEmxS+z"; SPC_U=29630508; SPC_SC_SA_TK=; SPC_F=ALcNQ6pob2w6SgYwlp9k12Bho5NqBnPJ; SPC_EC="KEQxDBF7MnWmensKpGn5CDF1BbFhfk0D+8em/ChUyUfgjRyiRgCZm/27MyiWE5gqxy+JzHiDNSh4umPoMc9QWVTbWneP6RqRxknbg3S2aQc0Tdz+mywMztE9eaS8ECU19AdN+9iUFGrCABgVweOOjg=="; SC_SSO=-; SPC_SC_TK=4d3ba651c8fcc924b797e659073a2b5f; SPC_WST="KEQxDBF7MnWmensKpGn5CDF1BbFhfk0D+8em/ChUyUfgjRyiRgCZm/27MyiWE5gqxy+JzHiDNSh4umPoMc9QWVTbWneP6RqRxknbg3S2aQc0Tdz+mywMztE9eaS8ECU19AdN+9iUFGrCABgVweOOjg=="; SC_DFP=F8efh66ctoDUYDDWbrGnpFoFhxo5Hir5';
    var encrypted = key.encrypt(text, 'base64');
    */
    //console.log('encrypted: ', encrypted);
    //const decrypted = key.decrypt(encrypted, 'utf8');
    //console.log('decrypted: ', decrypted);
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
