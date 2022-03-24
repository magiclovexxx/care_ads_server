const exec = require('child_process').exec;
const moment = require('moment');
const os = require("os");
const HttpClient = require('./api/HttpClient.js');
const httpClient = new HttpClient(300000);
const port = process.env.PORT;
const hostname = os.hostname();
const api_url = "http://api.sacuco.com/api_user";

function api_get_vpn_ip(slave_ip) {
    let Url = api_url + '/vpn_ip?slave_ip=' + slave_ip;
    //Call request get với url để lấy data
    return httpClient.http_request(Url, 'GET').then(function (response) {
        //Webservice API trả về data
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            //Trả về lỗi kết nối
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                //Trường hợp lỗi request time out đợi 3s gọi lại function sẽ hay xảy ra nếu mạng chập chờn (Cả mạng server và client)
                await sleep(3000);
                return api_get_vpn_ip(slave_ip);
            }
            else {
                //Các lỗi phát sinh khác trả về lỗi
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}

function api_get_vpn_error(vpn_ip, vpn_port) {
    let Url = api_url + '/vpn_error?vpn_ip=' + vpn_ip + '&vpn_port=' + vpn_port;
    //Call request get với url để lấy data
    return httpClient.http_request(Url, 'GET').then(function (response) {
        //Webservice API trả về data
        response.data.status = response.status;
        return response.data;
    }, async function (error) {
        if (error.response) {
            //Trả về lỗi kết nối
            error.response.data.status = error.response.status;
            return error.response.data;
        } else {
            if (error.code + ' ' + error.message == 'ECONNRESET read ECONNRESET') {
                //Trường hợp lỗi request time out đợi 3s gọi lại function sẽ hay xảy ra nếu mạng chập chờn (Cả mạng server và client)
                await sleep(3000);
                return api_get_vpn_error(vpn_ip, vpn_port);
            }
            else {
                //Các lỗi phát sinh khác trả về lỗi
                return { code: 1000, message: error.code + ' ' + error.message };
            }
        }
    });
}


run = async () => {
    try {
        let connected = false;
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Thông tin máy chủ JS', hostname);
        let result = await api_get_vpn_ip(hostname);
        if (result.code != 0) {
            console.log(result);
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Lỗi api_get_vpn_ip', result.message);
            return;
        }
        let vpn_ip = result.data.proxy_ip;
        let vpn_port = parseInt(result.data.proxy_port);
        let proto = parseInt(result.data.proto);
        
        console.log(moment().format('MM/DD/YYYY HH:mm:ss'), 'Thông tin máy chủ VPN', vpn_ip, vpn_port);
        const openvpn = await exec(`openvpn --client --dev tun --proto ${proto} --remote ${vpn_ip} ${vpn_port} --resolv-retry infinite --remote-random --nobind --tun-mtu 1500 --tun-mtu-extra 32 --mssfix 1450 --persist-key --persist-tun --ping 15 --ping-restart 0 --ping-timer-rem --reneg-sec 0 --remote-cert-tls server --auth-user-pass /etc/openvpn/login.info --verb 3 --pull --fast-io --cipher AES-256-CBC --auth SHA512 --ca /etc/openvpn/cert.ca --key-direction 1 --tls-auth /etc/openvpn/tls.key`);
        openvpn.stdout.on('data', (data) => {
            if (data.indexOf('Initialization Sequence Completed') != -1) {
                connected = true;
            }
            console.log(data);
        });
        openvpn.stderr.on('data', (data) => {
            console.error(data);
        });
        setTimeout(async function () {
            if (!connected) {
                result = await api_get_vpn_error(vpn_ip, vpn_port);
                console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'VPN ERROR');
                exec(`pm2 restart middleware;`);
            }
        }, 30000);
    } catch (ex) {
        console.error(ex);
    } finally {
        setTimeout(function () {
            console.error(moment().format('MM/DD/YYYY HH:mm:ss'), 'Restart Middleware');
            exec(`pm2 restart middleware;`);
        }, 60000);
    }
};
run();