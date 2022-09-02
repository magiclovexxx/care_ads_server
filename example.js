const md5 = require('md5');
const publicIp = require('public-ip');
require('dotenv').config();
const fs = require('fs');
const exec = require('child_process').exec;
const moment = require('moment');
const { v4: uuidv4 } = require('uuid');
const NodeRSA = require('node-rsa');
const os = require("os");
const ShopeeAPI = require('./api/ShopeeAPI.js');
const shopeeApi = new ShopeeAPI(300000);
const HttpClient = require('./api/HttpClient.js');
const { stringify } = require('querystring');
const httpClient = new HttpClient(300000);
const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
    'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
    'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
    '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
    'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
    '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
    'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
    'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
    '-----END RSA PRIVATE KEY-----');

function applyCookie(cookies) {
    if (cookies) {
        return Object.keys(cookies).map(key => `${key}=${cookies[key]}`).join('; ');
    } else {
        return null;
    }
}

function initCookie(cookiesString) {
    const cookies = cookiesString.split(";").map(function (cookieString) {
        return cookieString.trim().split(/=(.+)/);
    }).reduce(function (acc, curr) {
        acc[curr[0]] = (curr[1] ? curr[1] : '');
        return acc;
    }, {});
    return cookies;
}

function setCookie(cookies, headers) {
    if (!cookies) {
        cookies = {};
    }
    headers['set-cookie']?.forEach(co => {
        const [key, value] = co.split(';')[0].trim().split(/=(.+)/);
        cookies[key] = value;
    });
    return cookies;
}
run = async () => {

    let cc = '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';
    let rs = await shopeeApi.api_get_login('fa18a2a1-8ea7-4e4c-ad25-53f1248496f7', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36', cc);
    cc = rs.cookie;
    //rs = await shopeeApi.api_get_package_list('fa18a2a1-8ea7-4e4c-ad25-53f1248496f7', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36', cc, null, 'confirmed_date_desc', 40, 1, 0);
    console.log(rs);
}


run();
