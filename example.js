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
    console.log(setCookie(null, { 'set-cookie': ['SPD=123', 'DDD=2333'] }));
    let cookie = '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';
    const RSA = new NodeRSA('-----BEGIN RSA PRIVATE KEY-----\n' +
        'MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n' +
        'Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n' +
        '/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n' +
        'AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n' +
        '/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n' +
        'wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n' +
        'gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n' +
        '-----END RSA PRIVATE KEY-----');
    if (cookie != null) {
        cookie = RSA.decrypt(cookie, 'utf8');
    }

}


run();
