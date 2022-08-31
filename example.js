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
    let cc = { "SPC_SC_TK": "a8480047358d70a2be3b823b796e0df3", "SPC_SC_UD": "818028135", "SPC_EC": "GXwThdPG7eUzBW4eWQ8a0Pj5bgZ6drV17iu3fMJTJBkjhaLvZqn5EVTZaQ6Gkj7ow5eNXRHs179CmToHMMY7/Bi9rIKNLsz9+yL+nNmCzHnfyw6OxCzAyqkX1rZE4g4i+KmqpekyikvL5BYVtPcl7GywSa3giEMNJbXxPIbSKlQ=", "SPC_U": "818028135", "SPC_ST": ".dU92ZXdrYk12dWFWUzQzcBXVu+ib5PU+cu4hbmC+kf9atbvtK5w9QWY4cjdnn5T+Z63SZtxgsHdqUxakRoXt9IXpWfcFUIjzP/rXhRIJ6ftBQvMnxn7w9XQrG24TNO4dYKV9JEKiG/+kricXaJFBtn8Bod5fewAn9DHjc3l2Zdf/Zs9iF9pA8izcdUyij0SMqk5qzj+qfiTN95NgUWqEjA==", "SPC_STK": "AmIafUYCLd/e0DcdqxVVVwR3p0sAbcSsXFw5F5IifKYICcZ6rjF9C6NCt5hSi6mXvXEsaH8eM7sd+w4y3RWMRtN8yPqezGLg/WpwthaLa1/znrb9CDlx/WXjRdBNRqb9nQ12D/KILatPIcrEU7db0ydy9af+3LTkkPdtnqZ4/JROHjGHIdhhBdo+3Q0Q/zY+", "SPC_WST": "GXwThdPG7eUzBW4eWQ8a0Pj5bgZ6drV17iu3fMJTJBkjhaLvZqn5EVTZaQ6Gkj7ow5eNXRHs179CmToHMMY7/Bi9rIKNLsz9+yL+nNmCzHnfyw6OxCzAyqkX1rZE4g4i+KmqpekyikvL5BYVtPcl7GywSa3giEMNJbXxPIbSKlQ=", "SPC_SC_SA_TK=": "", "SPC_SC_SA_UD=": "", "SC_SSO": "-", "SC_SSO_U": "-", "REC_T_ID": "2c470d6f-9289-11ea-9fa2-3ce82481cdbf", "SPC_F": "X01ztFFepnq9TBVpH5pnZ2QxFNKUasNi", "G_ENABLED_IDPS": "google", "SPC_CLIENTID": "X01ztFFepnq9TBVpehouxvnngmvcxdcj", "_fbp": "fb.1.1637218370394.1037149021", "_hjid": "ddc20130-ef2e-44c0-9919-e684572cb917", "_hjSessionUser_868286": "\"eyJpZCI6IjNkOWE2M2Y0LTc2ODAtNTlhYi1iOTNiLWYwZjA0NjcxOWUxNyIsImNyZWF0ZWQiOjE2MzcyMTgzNzQ0MTQsImV4aXN0aW5nIjp0cnVlfQ==\"", "SC_DFP": "elcuxIHvmu1C9F29qcthO6VXUJ7lbsRU", "_gcl_au": "1.1.1751812452.1654105826", "fulfillment-language": "vi", "_gid": "GA1.2.790876343.1658069004", "_fbc": "fb.1.1658803526769.IwAR307dXT_unzmjDsmix8ICkmUur2cFS5cqFcWxkiN8UsJNQswzotR3sQB84", "__stripe_mid": "5a3f6e5c-24f0-4acc-b654-9310e4e82e3e2afa9c", "kk_leadtag": "true", "_gcl_aw": "GCL.1659669772.CjwKCAjw3K2XBhAzEiwAmmgrAoJASHm56IB67cqC7rTUD5X7MpC7q_YqYy07uGD4Q2kqJQZI6KAsERoCJbIQAvD_BwE", "_med": "affiliates", "_ga_KK6LLGGZNQ": "GS1.1.1660525845.12.0.1660525846.0", "SPC_CDS": "fa18a2a1-8ea7-4e4c-ad25-53f1248496f7", "_QPWSDCXHZQA": "ee3074af-2836-4c63-edc6-a5297a00a436", "SPC_T_ID": "\"/1lSOJEqS9FZ3ZvTByPeDZLvco0lepDRfE6vPNqBGzVA9LZc97WmALmjcN0w3Z27iEhn9pFI7LjXY0NkFlAHl7EBLy7TDvFuh9DMVusKsGTIb6WpIFtdhm9EWayjlaTeg8A1XbgfrI2C7n/NMjbuXSrbfZ6QX9hx1XXvTzWDvnw=\"", "SPC_T_IV": "\"ZXZiZGl5dm4wbHVUUFBVYQ==\"", "language": "vi", "shopee_webUnique_ccd": "ZrlP0pF1wr9hZi658Mz95w%3D%3D%7CedO4AwzFsggw0hmf5iVr28623uMoHH1msAiFcHB6fkOD3hRq80vR2247QV83ceSgqPBMd13i0KY1jZOxRqchtedVF08%3D%7CIlSGuv80JOr7BzQc%7C05%7C3", "_hjAbsoluteSessionInProgress": "1", "SPC_SI": "\"KQy8YgAAAABjQWowNjluTEIangAAAAAAa2ZoREtxS0w=\"", "SPC_R_T_ID": "\"/1lSOJEqS9FZ3ZvTByPeDZLvco0lepDRfE6vPNqBGzVA9LZc97WmALmjcN0w3Z27iEhn9pFI7LjXY0NkFlAHl7EBLy7TDvFuh9DMVusKsGTIb6WpIFtdhm9EWayjlaTeg8A1XbgfrI2C7n/NMjbuXSrbfZ6QX9hx1XXvTzWDvnw=\"", "SPC_R_T_IV": "\"ZXZiZGl5dm4wbHVUUFBVYQ==\"", "_dc_gtm_UA-61914164-6": "1", "_ga_M32T05RVZT": "GS1.1.1661145214.349.1.1661145216.58.0.0", "_hjSession_868286": "\"eyJpZCI6IjQ0ZWRjMjk0LTY2N2ItNDc2MC05MjE0LTJiOGViZjU0MmFkNCIsImNyZWF0ZWQiOjE2NjExNDUyMTcxNDAsImluU2FtcGxlIjpmYWxzZX0=\"", "AMP_TOKEN": "%24NOT_FOUND", "_ga": "GA1.2.744428076.1637218371", "cto_bundle": "O9S0019YYmszTFJRZ1hBcUMlMkZidkhLQzVmM2p5SGdpYXJSYTFBbkRHJTJCeGt6VWVkSHg1WTRVMFZQVDdhRUcxcXFDb01UWE4yZGpzSTVuaDFTM1Z4ZTNzRXhjWUpEejJlNGVVQ3FFSVVVcSUyRm0lMkJicHY4SUJBbnFzMmhHYW5wRW9abk1TTUg3YU1aUHVFdUJaaEJBQVRlY1diYnVLQSUzRCUzRA" };
    cc = JSON.stringify(cc);
    let rs = await shopeeApi.api_get_login('fa18a2a1-8ea7-4e4c-ad25-53f1248496f7', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36', cc);
    cc = rs.cookie;
    console.log(JSON.parse(cc));
    rs = await shopeeApi.api_get_package_list('fa18a2a1-8ea7-4e4c-ad25-53f1248496f7', null, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36', cc, null, 'confirmed_date_desc', 40, 1, 0);
    console.log(rs);
}


run();
