const md5 = require("md5");
const crypto = require("crypto");
const moment = require("moment");
const NodeRSA = require("node-rsa");
const { v4: uuidv4 } = require("uuid");
const HttpClient = require("./HttpClient.js");
const qs = require("qs");
var axios = require("axios");
var fs = require("fs");
const os = require("os");
require("dotenv").config({ path: "../.env" });
var FormData = require("form-data");
const randomUseragent = require("random-useragent");
const { firefox } = require("playwright");
const { json } = require("body-parser");

// puppeteer.use(stealthPlugin);
// const { executablePath } = require('puppeteer');

const RSA = new NodeRSA(
  "-----BEGIN RSA PRIVATE KEY-----\n" +
    "MIIBOQIBAAJAbnfALiSjiV3U/5b1vIq7e/jXdzy2mPPOQa/7kT75ljhRZW0Y+pj5\n" +
    "Rl2Szt0xJ6iXsPMMdO5kMBaqQ3Rsn20leQIDAQABAkA94KovrqpEOeEjwgWoNPXL\n" +
    "/ZmD2uhVSMwSE2eQ9nuL3wO7SakKf2WjCh2EZ6ZSaP9bDyhonQbnasJfb7qI0dnh\n" +
    "AiEAzhT2YJ4YY5Q+9URTKOf9pE6l4BsDeLnZJm7xJ3ctsf0CIQCJOc3KOf509XG4\n" +
    "/ExIeZTDLqbNJkoK8ABUjEQMQ1EMLQIgdr8HdIbEYOS0HlmfXWvH8FxNIkQOjQrx\n" +
    "wD6fAHGgx/UCIFO6xWpDAJP0vzMUHqeKJ88ARB6g4kTSNCFihJLG8EjxAiEAuYcD\n" +
    "gNatFAx7DU7oXKCDHZ9DR4XlVVj0N0fcWI39Oow=\n" +
    "-----END RSA PRIVATE KEY-----"
);

mode = process.env.MODE;

console.log("process.env.HEADLESS", process.env.HEADLESS);
headless_mode = true;
if (process.env.HEADLESS == 1) {
  headless_mode = false;
} else {
  headless_mode = true;
}
console.log("headless_mode -- ", headless_mode);
//process.exit()
function randomInt(min, max) {
  // min and max included
  return Math.floor(Math.random() * (max - min + 1) + min);
}

function cookieParse(cookie, cookie_array) {
  let result = [];
  let cookie_primary_array = [];
  if (cookie_array != null) {
    for (let i = 0; i < cookie_array.length; i++) {
      let item = cookie_array[i].split(";")[0];
      let primary = item.split("=")[0];
      result.push(item);
      cookie_primary_array.push(primary);
    }
  }
  if (cookie != null) {
    let old_cookie_array = cookie.split("; ");
    for (let i = 0; i < old_cookie_array.length; i++) {
      let item = old_cookie_array[i];
      let primary = item.split("=")[0];
      if (cookie_primary_array.indexOf(primary) == -1) result.push(item);
    }
  }
  return result.length > 0 ? result.join("; ") : null;
}

function applyCookie(cookies) {
  if (cookies) {
    return Object.keys(cookies)
      .map((key) => `${key.replace("=", "")}=${cookies[key]}`)
      .join("; ");
  } else {
    return null;
  }
}

function initCookie(cookiesString) {
  const cookies = cookiesString
    .split(";")
    .map(function (cookieString) {
      return cookieString.trim().split(/=(.+)/);
    })
    .reduce(function (acc, curr) {
      acc[curr[0].replace("=", "")] = curr[1] ? curr[1] : "";
      return acc;
    }, {});
  return cookies;
}

function setCookie(cookies, headers) {
  if (!cookies) {
    cookies = {};
  }
  headers["set-cookie"]?.forEach((co) => {
    const [key, value] = co.split(";")[0].trim().split(/=(.+)/);
    cookies[key.replace("=", "")] = value ? value : "";
  });
  return cookies;
}

class ShopeeAPI {
  constructor(REQUEST_TIME_OUT) {
    this.http_client = new HttpClient(REQUEST_TIME_OUT);
    this.cookie = {};
  }

  api_dynamic_request(proxy, UserAgent, cookie, url, method, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }

    if (method == "GET") {
      const result = this.http_client
        .http_request(
          url,
          method,
          null,
          {
            cookie: applyCookie(cookie),
            "User-Agent": UserAgent,
            referer: url,
          },
          null
        )
        .then(
          function (response) {
            response.cookie = JSON.stringify(
              setCookie(cookie, response.headers)
            );
            return {
              code: 0,
              message: "OK",
              status: response.status,
              data: response.data,
              cookie: response.cookie,
              proxy: { code: 0, message: "OK" },
            };
          },
          function (error) {
            if (error.response) {
              error.response.cookie = JSON.stringify(
                setCookie(cookie, error.response.headers)
              );
              return {
                code: 999,
                message: error.response.statusText,
                status: error.response.status,
                data: error.response.data,
                cookie: error.response.cookie,
                proxy: {
                  code: error.response.status == 407 ? 1 : 0,
                  message:
                    error.response.status == 407
                      ? error.response.statusText
                      : "OK",
                },
              };
            } else {
              return {
                code: 1000,
                message: error.code + " " + error.message,
                status: 1000,
                data: null,
                cookie: null,
                proxy: { code: 0, message: "OK" },
              };
            }
          }
        );
      return result;
    }

    if (method == "POST" || method == "PUT") {
      let headers = {
        cookie: applyCookie(cookie),
        "User-Agent": UserAgent,
        referer: url,
      };
      if (url.indexOf("localapi.trazk.com") != -1) {
        headers = {
          Connection: "keep-alive",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
          Accept: "application/json, text/javascript, */*; q=0.01",
          "Content-Type": "application/x-www-form-urlencoded; charset=UTF-8",
          "sec-ch-ua-mobile": "?0",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4750.0 Safari/537.36",
          "sec-ch-ua-platform": '"Windows"',
          Origin: "https://keywordplanner.vn",
          "Sec-Fetch-Site": "cross-site",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Referer: "https://keywordplanner.vn/",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        };
      }
      const result = this.http_client
        .http_request(url, method, null, headers, data)
        .then(
          function (response) {
            response.cookie = JSON.stringify(
              setCookie(cookie, response.headers)
            );
            return {
              code: 0,
              message: "OK",
              status: response.status,
              data: response.data,
              cookie: response.cookie,
              proxy: { code: 0, message: "OK" },
            };
          },
          function (error) {
            if (error.response) {
              error.response.cookie = JSON.stringify(
                setCookie(cookie, error.response.headers)
              );
              return {
                code: 999,
                message: error.response.statusText,
                status: error.response.status,
                data: error.response.data,
                cookie: error.response.cookie,
                proxy: {
                  code: error.response.status == 407 ? 1 : 0,
                  message:
                    error.response.status == 407
                      ? error.response.statusText
                      : "OK",
                },
              };
            } else {
              return api_dynamic_request(
                null,
                UserAgent,
                cookie,
                url,
                method,
                data
              );
            }
          }
        );
      return result;
    }
  }

  api_post_login(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    username,
    password,
    vcode,
    captcha,
    captcha_id
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const password_hash = crypto
      .createHash("sha256")
      .update(md5(password))
      .digest("hex");
    const Url =
      "https://banhang.shopee.vn/api/account/sc/login/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    let data = "";
    let vnf_regex = /((09|03|07|08|05)+([0-9]{8})\b)/g;
    let email_regex =
      /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

    if (vnf_regex.test(username) == false) {
      if (email_regex.test(username) == false) {
        data += "&username=" + encodeURI(username);
      } else {
        data += "&email=" + encodeURI(username);
      }
    } else {
      data += "&phone=" + encodeURI("84" + username.substring(1, 10));
    }
    data += "&password_hash=" + password_hash;
    data += "&remember=true";
    if (vcode != null) {
      data += "&vcode=" + vcode;
    }
    if (captcha != null) {
      data += "&captcha=" + captcha;
    }
    if (captcha_id != null) {
      data += "&captcha_id=" + captcha_id;
    }
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_login(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/v2/login/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_all_category_list(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/v3/category/get_all_category_list/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2&version=3.1.0";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_second_category_list(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/v3/category/get_second_category_list/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2&version=3.1.0";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_shop_info(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/selleraccount/shop_info/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_page_active_collection_list(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    page_number,
    page_size
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/shopcategory/v3/category/page_active_collection_list/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    Url += "&page_number=" + page_number;
    Url += "&page_size=" + page_size;

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_product_selector(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    offset,
    limit,
    is_ads,
    need_brand,
    need_item_model,
    search_type,
    search_content,
    sort_by
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/product_selector/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    Url += "&offset=" + offset;
    Url += "&limit=" + limit;
    Url += "&is_ads=" + is_ads;
    Url += "&need_brand=" + need_brand;
    Url += "&need_item_model=" + need_item_model;
    if (search_type != null) {
      Url += "&search_type=" + search_type;
      Url += "&search_content=" + encodeURI(search_content);
    }
    if (sort_by != null) {
      Url += "&sort_by=" + sort_by;
    }
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  async api_get_search_items(
    proxy,
    UserAgent,
    cookie,
    by,
    keyword,
    limit,
    newest,
    order,
    page_type,
    scenario,
    version
  ) {
    console.log("--> API GET SEARCH ITEMS:  -- " + keyword);
    console.log("--> API GET SEARCH ITEMS ----> proxyyyyyyyyy:  -- " , proxy);
    let self = this;
    let res_data;
    if (cookie != null) {
      //console.log(cookie);
      //cookie = JSON.parse(cookie);
    }
    try {
      let langs = [
        "ar",
        "bg",
        "bn",
        "ca",
        "cs",
        "da",
        "de",
        "el",
        "en-GB",
        "en-US",
        "es",
        "et",
        "fi",
        "fil",
        "fr",
        "gu",
        "he",
        "hi",
        "hr",
        "hu",
        "id",
        "it",
        "ja",
        "kn",
        "ko",
        "lt",
        "lv",
        "ml",
        "mr",
        "ms",
        "nb",
        "nl",
        "pl",
        "pt-BR",
        "pt-PT",
        "ro",
        "ru",
        "sk",
        "sl",
        "sr",
        "sv",
        "ta",
        "te",
        "th",
        "tr",
        "uk",
        "vi",
        "zh-CN",
        "zh-TW",
      ];

      let rand = Math.floor(Math.random() * langs.length);
      let user_lang = langs[rand];

      let params = [
        "--disable-gpu",
        "--no-sandbox",
        "--lang=en-US",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-dev-shm-usage",
        //'--disable-accelerated-2d-canvas',
        "--no-first-run",
        //'--window-position=0,0',
        "--disable-infobars",
        //'--disable-reading-from-canvas',
        "--ignore-certificate-errors",
        "--ignore-certifcate-errors-spki-list",
        "--start-maximized",
        "--lang=" + user_lang,
        `--disable-extensions-except=${__dirname}/chrome-extensions/AudioContext-Fingerprint-Defender,${__dirname}/chrome-extensions/Canvas-Fingerprint-Defender,${__dirname}/chrome-extensions/Font-Fingerprint-Defender,${__dirname}/chrome-extensions/WebGL-Fingerprint-Defender,${__dirname}/chrome-extensions/WebRTC-Control,${__dirname}/chrome-extensions/J2TEAM-Cookies`,
        `--load-extension=${__dirname}/chrome-extensions/AudioContext-Fingerprint-Defender,${__dirname}/chrome-extensions/Canvas-Fingerprint-Defender,${__dirname}/chrome-extensions/Font-Fingerprint-Defender,${__dirname}/chrome-extensions/WebGL-Fingerprint-Defender,${__dirname}/chrome-extensions/WebRTC-Control,${__dirname}/chrome-extensions/J2TEAM-Cookies`,
      ];

      let profile_dir = "/home/profile";
      if (os.platform() == "linux") {
        profile_dir = "/home/profile";
      } else {
        profile_dir = "C:\\profile";
      }

      if (proxy) {
        let proxy_for_slave = "--proxy-server=" + proxy.host + ":" + proxy.port;
        params.push(proxy_for_slave);
        params.push("--ignore-certificate-errors");
      }

      headless_mode = true;
      if (process.env.HEADLESS == 1) {
        headless_mode = false;
      } else {
        headless_mode = true;
      }

      let getCookie = await axios.get(
        "https://beta.hotaso.vn/api_user/get_cookie?slave=1093sadjhad09128309kldasklj129i23098ahdklj193u1290easkldhklas"
      );
      console.log(
        moment().format("hh:mm:ss") + " - getcookie thành công: ",
        getCookie.data.length
      );

      var browser = await firefox.launchPersistentContext(`${profile_dir}`, {
        headless: headless_mode,
      //   proxy: {
      //     server: proxy.host+":"+proxy.port,
      //     username: proxy.auth.username,
      //     password: proxy.auth.password
      // },
        viewport: { width: randomInt(900, 1200), height: randomInt(600, 900) },

        //   args: args,
        //  proxy: network == "proxy" ? proxy_2 : "",
        //   userAgent,
        //   locale,
        javaScriptEnabled: true,
      });
      try {
        if(getCookie.data.length){
          cookie = getCookie.data;
        
          //  cookie = JSON.parse(cookie)
            cookie.forEach((elm) => delete elm.expires);
            await browser.addCookies(cookie);
            console.log(moment().format("hh:mm:ss") + " - Setcookie thành công");
        }
       
      } catch (error) {
        console.log(error);
      }

      let user_agent;
      console.log("--> START PPT:  -- headless: " + headless_mode);

      const page = await browser.pages()[0];

      //  await page.setUserAgent(user_agent)
      let width = Math.floor(Math.random() * (1280 - 1000)) + 1000;
      let height = Math.floor(Math.random() * (800 - 600)) + 600;

      // await page.setViewport({
      //     width: width,
      //     height: height
      // });
      // if (proxy) {

      //     await page.authenticate({ username: proxy.auth.username, password: proxy.auth.password });
      // }
      if (cookie) {
        //await page.setCookie(...cookie);
      }

      var searchCallBack = null;
      var searchResult = new Promise((resolve) => {
        searchCallBack = resolve;
      });

      await page.on("response", async function (res, req) {
        if (res.url().includes("/captcha/") && res.status() == 200) {
          console.log(res.url());
          try {
            console.log("----> Ăn captcha rồi");
            const imgCaptcha = await page.waitForSelector(
              '//img[@draggable="false"]'
            );
            if (imgCaptcha) {
              await imgCaptcha.screenshot({ path: "captcha.png" });
              var data = new FormData();
              data.append("image", fs.createReadStream("captcha.png"));
              var config = {
                method: "POST",
                url: "https://captcha.sacuco.com/captcha/shoppe",
                headers: {
                  ...data.getHeaders(),
                },
                data: data,
              };
              await axios(config)
                .then(async function (response) {
                  const pixels = response.data.split(" ");
                  if (pixels.length == 4) {
                    const whirl_position = pixels[2] - 2;
                    console.log("Kéo captcha: " + whirl_position);
                    const sliderHandle = await page.waitForSelector(
                      '//div[@style="width: 40px; height: 40px; transform: translateX(0px);"]'
                    );
                    if (sliderHandle) {
                      const handle = await sliderHandle.boundingBox();
                      let currentPosition = handle.width / 2;
                      await page.mouse.move(
                        handle.x + currentPosition,
                        handle.y + handle.height / 2
                      );
                      await page.mouse.down();
                      while (currentPosition < whirl_position) {
                        currentPosition += 1;
                        await page.mouse.move(
                          handle.x + currentPosition,
                          handle.y + handle.height / 2
                        );
                      }
                      await page.waitForTimeout(1000);
                      page.mouse.up();
                    }
                  }
                })
                .catch(function (error) {
                  console.log(error);
                  searchCallBack({
                    code: 1000,
                    message: error.code + " " + error.message,
                    status: 1000,
                    data: null,
                    cookie: null,
                    proxy: { code: 0, message: "OK" },
                  });
                });
            }
          } catch (ex) {
            console.log(ex);
            //    searchCallBack({ code: 1000, message: ex.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } });
          }
        }

        if (res.url().includes("/search_items")) {
          try {
            res_data = await res.json();
            const res_status = await res.status();
            //   const res_cookies = await page.cookies();

            if (res_data.items) {
              console.log(
                "--> CLOSE BROWSER SAU KHI LAY KET QUA  -- SO LUONG KET QUA: " +
                  res_data.items.length
              );
              await page.close();
              await browser.close();

              searchCallBack({
                code: 0,
                message: "OK",
                status: res_status,
                data: res_data,
                cookie: null,
                proxy: { code: 0, message: "OK" },
              });
            }
            // await page.close();
            // await browser.close();
            // console.log("Close khi lấy được dữ liệu")
          } catch (ex) {
            console.log(ex);
            searchCallBack({
              code: 1000,
              message: ex.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            });
          }
        }
      });
      try {
        let timeout = 2000
       // let search_url = `https://shopee.vn/search?keyword=` + keyword;
        let search_url = `https://shopee.vn/`
        console.log("--> Goto search keyword page " + search_url);
        await page.goto(search_url);
        // console.log("--> END PPT  -- ")
        //  await page.waitForTimeout(999999)
        timeout = Math.floor(Math.random() * (4000 - 3000)) + 3000;
        await page.waitForTimeout(timeout);
        let ax = Math.floor(Math.random() * (40 - 0)) + 0;
        let by = Math.floor(Math.random() * (100 - 0)) + 0;
        console.log("hhhhhhhhaaaaaaaaaaaaaaaaaa");
        console.log(
          moment().format("hh:mm:ss") + " - Click pixel: " + ax + "x" + by
        );

        await page.mouse.click(ax, by);

        timeout = Math.floor(Math.random() * (2000 - 1000)) + 1000;
        await page.waitForTimeout(timeout);
        await page.type(".shopee-searchbar-input__input", keyword, {
          delay: 100,
        });
        timeout = Math.floor(Math.random() * (1000 - 500)) + 500;
        await page.waitForTimeout(timeout);
        await page.keyboard.press("Enter");
        timeout = Math.floor(Math.random() * (30000 - 20000)) + 20000;
        await page.waitForTimeout(timeout);
        await page.close();
        await browser.close();
      } catch (ex) {
         console.log(ex)
         await browser.close();
      }

      const timeout_wait = setTimeout(async function () {
        console.log("--> END PPT TIMEOUT  -- ");
        await page.close();
        await browser.close();
        searchCallBack({
          code: 1000,
          message: "Request timeout",
          status: 1000,
          data: null,
          cookie: null,
          proxy: { code: 0, message: "OK" },
        });
      }, 30000);
      const result = await searchResult;
      clearTimeout(timeout_wait);

      return result;
    } catch (ex) {
      console.log(ex);
      return {
        code: 1000,
        message: ex.message,
        status: 1000,
        data: null,
        cookie: null,
        proxy: { code: 0, message: "OK" },
      };
    }

    /*let Url = 'https://shopee.vn/api/v4/search/search_items?by=' + by;
        Url += '&keyword=' + encodeURI(keyword)
        Url += '&limit=' + limit;
        Url += '&newest=' + newest;
        Url += '&order=' + order;
        Url += '&page_type=' + page_type;
        Url += '&scenario=' + scenario;
        Url += '&version=' + version;
        let text = Url.replace('https://shopee.vn/api/v4/search/search_items?', '');
        let str_request = `55b03${md5(text)}55b03`;
        let if_none_match = `55b03-${md5(str_request)}`;
        const result = this.http_client.http_request(Url, 'GET', null, {
            'authority': 'shopee.vn',
            'accept': 'application/json',
            'accept-language': 'vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5',
            'af-ac-enc-dat': 'AAUyLjEuMAAAAX+/yCHbAAAAAAJIAAAAAAAAAAD0QDTiApo7K9b1Yi6qzNTIR4qt9jpVe5OWhvxoO8uRZzDRkVHTMLvQhLGsv5yRcyEhF4Oa+0PGY81qnJbOwR1diYS9AwubYjooGNt/nB3zpyxMVkBMYvkTeckraLKIAyDSI7092SfGhXJadGJP91nidNYqrrDqMjmOsNifLGPDMZFjs4yw8pGWNnYQjtmnppYSS3CJCxVfHuOyc4FxDHHr48UdRhhbhIVgU+IFUyU01vsYaXtvIkt86xLca56jgoolAwchz2hp3UGCZPaQOWsgoEQSSK14GUVdTw2jtH9bbYWKsIHCPk4Kosz6l73FF2UR5+QqWsYDJ69sIDUI+MqjlEjEw9Ydq1zcMnGstvGdov5/Fc0jLua+QrrfDcvGmBPg43/xbQ/ylUBuGExCpgyGzeeiEX4wKeGzAITeglfAelSsueLmKhf+ihUrESbIpbeaGl0E6iSASK8uY258wCvok4w5Rk+rTYiCwgjMbeIk8oWKsIHCPk4Kosz6l73FF2XOP6/Gz8NFEsMCPUNctXUQkWOzjLDykZY2dhCO2aemlvehiJf6OllW/EgYrZ8LIcCuWkY1nVC8JblfwClwB6BwM2U0Hc2rDMX7Uwc35BB3yxfvIaXng5DA5dFl5DxycVlg/1y5RQDddqZU8vwde9pId9PA9T6efzuJielOUikGrY1TCLd9/HeDZTrOzJg8ax1WZZMuE8aC0vvIv+7WJ2YZzNI2gLnFQfK/6exM2RR9jxC3q7r7Amu/FcS/fiwQIrJCxnzBPMIg1LMs4N5bOGhE',
            'content-type': 'application/json',
            'cookie': applyCookie(cookie),
            'referer': 'https://shopee.vn/search?keyword=' + encodeURI(keyword),
            'sec-ch-ua': '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"Windows"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'sz-token': '4Ml7BhoXBmkiw16l7VtDqQ==|gYwi0c1cylneid5Cm2qLPONrS7LS4jYfHfar0K4vT3JghJUB/lgFhV7zRv5GMgQ0hJDerxxDfNrWGWnixmxckA==|HOUZy/6C2tJj91mE|04|3',
            'user-agent': UserAgent,
            'x-api-source': 'pc',
            'x-csrftoken': '9CkDZef7VcXtlc2N8kzdYuC7OHlxJX9d',
            'x-requested-with': 'XMLHttpRequest',
            'x-shopee-language': 'vi'
        }, null, proxy).then(function (response) {
            response.cookie = JSON.stringify(setCookie(cookie, response.headers));
            return { code: 0, message: 'OK', status: response.status, data: response.data, cookie: response.cookie, proxy: { code: 0, message: 'OK' } };
        }, function (error) {
            if (error.response) {
                error.response.cookie = JSON.stringify(setCookie(cookie, error.response.headers));
                return { code: 999, message: error.response.statusText, status: error.response.status, data: error.response.data, cookie: error.response.cookie, proxy: { code: (error.response.status == 407 ? 1 : 0), message: (error.response.status == 407 ? error.response.statusText : 'OK') } };
            } else {
                return { code: 1000, message: error.code + ' ' + error.message, status: 1000, data: null, cookie: null, proxy: { code: 0, message: 'OK' } };
            }
        });        
        return result;*/
  }

  api_get_search_items_v2(
    proxy,
    UserAgent,
    cookie,
    by,
    keyword,
    limit,
    newest,
    order,
    page_type,
    scenario,
    version
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://shopee.vn/api/v2/search_items/?by=" + by;
    Url += "&keyword=" + encodeURI(keyword);
    Url += "&limit=" + limit;
    Url += "&newest=" + newest;
    Url += "&order=" + order;
    Url += "&page_type=" + page_type;
    Url += "&version=" + version;
    let text = Url.replace("https://shopee.vn/api/v2/search_items/?", "");
    let str_request = `55b03${md5(text)}55b03`;
    let if_none_match = `55b03-${md5(str_request)}`;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          authority: "shopee.vn",
          "sec-ch-ua":
            '"Chromium";v="94", "Google Chrome";v="94", ";Not A Brand";v="99"',
          "sec-ch-ua-mobile": "?0",
          "user-agent": UserAgent,
          "x-api-source": "pc",
          "x-shopee-language": "vi",
          "x-requested-with": "XMLHttpRequest",
          "if-none-match-": if_none_match,
          "sec-ch-ua-platform": '"Windows"',
          accept: "*/*",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          referer: "https://shopee.vn/search?keyword=" + encodeURI(keyword),
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          cookie: applyCookie(cookie),
        },
        null,
        proxy
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          let response_items = {
            items: response.data.items,
          };
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response_items,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_search_items_atosa(
    proxy,
    UserAgent,
    cookie,
    by,
    keyword,
    limit,
    newest,
    order,
    page_type,
    scenario,
    version
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://app.atosa.asia/api/service5/shopee/search_items";

    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          authority: "app.atosa.asia",
          accept: "application/json, text/plain, */*",
          "accept-language":
            "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5",
          authorization:
            "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpZCI6IjYxOWY0YTg0NGI0MmJlMTdiMWM5NmYyZCIsIl9pZCI6IjYxOWY0YTg0NGI0MmJlMTdiMWM5NmYyZCIsInZlcnNpb25fbm8iOiIwLjAuMCIsInB3X2xhc3RfdXBkYXRlIjoiMjAyMS0xMi0xNFQxNjoxMToxNi43NzMwMDAiLCJzdG9yZV9pZCI6IlJGXzA5NjI5ODY1MzdfcXVhbmduZ3V5ZW43NjE2QGdtYWlsLmNvbSIsInN0b3JlX19pZCI6IjYxOWY0YTg0NGI0MmJlMTdiMWM5NmYyYiIsImV4cF90aW1lIjoiMjAyMS0xMi0xNiAwMjozOToyNC4wMTA1NjciLCJjb21fbWFjIjoiTVVMVElfU0hPUF9DTElFTlQiLCJhcHBfaWQiOiIiLCJyb2xlIjoibWFuYWdlciJ9.lrlhUXhTxuh-z3Abb_JOsB6XirNiuO75bPBt66OITxU",
          "content-type": "application/json",
          origin: "https://app.atosa.asia",
          referer: "https://app.atosa.asia/marketing",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="101", "Google Chrome";v="101"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "sec-fetch-dest": "empty",
          "sec-fetch-mode": "cors",
          "sec-fetch-site": "same-origin",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/101.0.4929.5 Safari/537.36",
          "x-requested-with": "XMLHttpRequest",
        },
        {
          device: "website",
          qs: {
            by: by,
            keyword: keyword,
            limit: limit,
            newest: newest,
            order: order,
            page_type: page_type,
          },
        }
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_search_items_shopee_analytics(keyword, shopid, itemid) {
    let self = this;
    let Url = "https://www.shopeeanalytics.com/vn/seller/product-position";
    let data = qs.stringify({
      keywords: keyword,
      product_url: `https://shopee.vn/SA-i.${shopid}.${itemid}`,
      sort: "relevancy",
      submit: "product-position",
    });
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          authority: "www.shopeeanalytics.com",
          "cache-control": "max-age=0",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          "upgrade-insecure-requests": "1",
          origin: "https://www.shopeeanalytics.com",
          "content-type": "application/x-www-form-urlencoded",
          "user-agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36",
          accept:
            "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "navigate",
          "sec-fetch-user": "?1",
          "sec-fetch-dest": "document",
          referer: "https://www.shopeeanalytics.com/vn/seller/product-position",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
        },
        data
      )
      .then(
        function (response) {
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
          };
        },
        function (error) {
          if (error.response) {
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
            };
          }
        }
      );
    return result;
  }

  api_get_search_items_salework(keyword, itemid) {
    let self = this;
    let Url = `https://nhaquangcao.salework.net/api/shopeeAds/getAdsLocation?keyword=${encodeURI(
      keyword
    )}&productId=${itemid}`;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          Connection: "keep-alive",
          "sec-ch-ua":
            '" Not A;Brand";v="99", "Chromium";v="100", "Google Chrome";v="100"',
          Accept: "application/json, text/plain, */*",
          Authorization:
            "Bearer eyJhbGciOiJIUzUxMiJ9.eyJzdWIiOiIzNTE3IiwiaWF0IjoxNjM4Mzc0MjE5LCJleHAiOjE2Mzg4NzgyMTl9.vRaAAHx1RnpgzsR6F6uymIhRiv-nsxSzbo3KRMNk4WJGdeoUu9CjrUjKnbQh0m6zsg2d1nNxRvhd49kdhKHdnw",
          "sec-ch-ua-mobile": "?0",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/100.0.4710.4 Safari/537.36",
          "sec-ch-ua-platform": '"Windows"',
          "Sec-Fetch-Site": "same-origin",
          "Sec-Fetch-Mode": "cors",
          "Sec-Fetch-Dest": "empty",
          Referer: "https://nhaquangcao.salework.net/searchads/keywords",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        },
        null
      )
      .then(
        function (response) {
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
          };
        },
        function (error) {
          if (error.response) {
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
            };
          }
        }
      );
    return result;
  }

  api_get_shop_info_shopid(proxy, UserAgent, cookie, shopid) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://shopee.vn/api/v4/product/get_shop_info?shopid=" + shopid;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_search_hint(SPC_CDS, proxy, UserAgent, cookie, keyword, type) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = `https://mall.shopee.vn/api/v1/search_hint?SPC_CDS=${SPC_CDS}&SPC_CDS_VER=2&keyword=${encodeURI(
      keyword
    )}&type=${type}`;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://mall.shopee.vn",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_put_marketing_mass_edit(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/mass_edit/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "PUT",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_put_marketing_search_ads(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/search/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "PUT",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_post_marketing_graphql(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/n/marketing/graphql/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  //LIVE
  api_post_session_join(cookie, uuid, session_id) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url = `https://live.shopee.vn/api/v1/session/${session_id}/join`;
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          Host: "live.shopee.vn",
          cookie: applyCookie(cookie),
          "User-Agent":
            "ShopeeVN/2.86.21 (com.beeasy.shopee.vn; build:2.86.21; iOS 15.3.1) Alamofire/5.0.5 language=vi app_type=1",
          "content-type": "application/json",
          "client-info": `device_id=${uuid};device_model=iPhone%2012%20Pro%20Max;os=1;os_version=15.3.1;client_version=28621;network=1;platform=2`,
          accept: "*/*",
          "accept-language": "vi-VN,vi;q=0.9",
          "user-agent":
            "ShopeeVN/2.86.21 (com.beeasy.shopee.vn; build:2.86.21; iOS 15.3.1) Alamofire/5.0.5 language=vi app_type=1",
        },
        {
          ver: 1,
          uuid: uuid,
        }
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_item_status(SPC_CDS, proxy, UserAgent, cookie, item_id_list) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/get_item_status/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        item_id_list
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_shop_report_by_time(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    placement_list,
    agg_interval
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/shop_report_by_time/";
    Url += "?start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));
    Url += "&agg_interval=" + agg_interval;
    Url += "&SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_captcha_info(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/selleraccount/v2/get_captcha_info/";
    Url += "?region=VN";
    Url += "&SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_campaign_statistics(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    campaign_type,
    filter_content,
    sort_key,
    sort_direction,
    search_content,
    start_time,
    end_time,
    offset,
    limit
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/campaign_statistics/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&campaign_type=" + campaign_type;
    Url += "&filter_content=" + filter_content;
    Url += "&sort_key=" + sort_key;
    Url += "&sort_direction=" + sort_direction;
    Url += "&search_content=" + encodeURI(search_content);
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&offset=" + offset;
    Url += "&limit=" + limit;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_search_ads(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    campaign_type,
    campaign_state,
    sort_key,
    sort_direction,
    search_content,
    start_time,
    end_time,
    offset,
    limit
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/marketing/v3/pas/search_ads/list/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    if (campaign_type == "keyword" || campaign_type == "shop")
      Url += "&campaign_type=" + campaign_type;
    Url += "&campaign_state=" + campaign_state;
    Url += "&sort_key=" + sort_key;
    Url += "&sort_direction=" + sort_direction;
    Url += "&search_content=" + encodeURI(search_content);
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&offset=" + offset;
    Url += "&limit=" + limit;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_suggest_keyword(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    keyword,
    count,
    placement,
    itemid,
    campaignid,
    adsid
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/marketing/v3/pas/suggest/keyword/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&keyword=" + encodeURI(keyword);
    Url += "&count=" + count;
    Url += "&placement=" + placement;
    if (itemid != null && itemid != "") {
      Url += "&itemid=" + itemid;
    }
    if (campaignid != null && campaignid != "") {
      Url += "&campaignid=" + campaignid;
    }
    if (adsid != null && adsid != "") {
      Url += "&adsid=" + adsid;
    }
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_post_marketing_campaign(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    campaign_ads_list
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        campaign_ads_list
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_put_marketing_campaign(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    campaign_ads_list
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    const Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/campaign/?SPC_CDS=" +
      SPC_CDS +
      "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "PUT",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        campaign_ads_list
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_marketing_campaign(SPC_CDS, proxy, UserAgent, cookie, campaignid) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/marketing/v3/pas/campaign/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&campaignid=" + campaignid;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_marketing_meta(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");
        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/marketing/v3/pas/meta/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_package_list(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    source,
    sort_by,
    page_size,
    page_number,
    total
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");
        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }

    let Url = "https://banhang.shopee.vn/api/v3/order/get_package_list";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    if (source != null) {
      Url += "&source=" + source;
    }
    Url += "&sort_by=" + sort_by;
    Url += "&page_size=" + page_size;
    Url += "&page_number=" + page_number;
    Url += "&total=" + total;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_order_id_list(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    from_page_number,
    source,
    page_size,
    page_number,
    total,
    is_massship
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/v3/order/get_order_id_list/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&from_page_number=" + from_page_number;
    Url += "&source=" + source;
    Url += "&page_size=" + page_size;
    Url += "&page_number=" + page_number;
    Url += "&total=" + total;
    Url += "&is_massship=" + is_massship;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_wallet_transactions(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    wallet_type,
    page_number,
    page_size,
    start_date,
    end_date,
    transaction_types
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/v3/finance/get_wallet_transactions/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&wallet_type=" + wallet_type;
    Url += "&page_number=" + page_number;
    Url += "&page_size=" + page_size;
    if (start_date != null) Url += "&start_date=" + start_date;
    if (end_date != null) Url += "&end_date=" + end_date;
    if (transaction_types != null)
      Url += "&transaction_types=" + transaction_types;

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_package(SPC_CDS, proxy, UserAgent, cookie, order_id) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/v3/order/get_package";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&order_id=" + order_id;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_one_order(SPC_CDS, proxy, UserAgent, cookie, order_id) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/v3/order/get_one_order";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&order_id=" + order_id;
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_income_transaction_history_detail(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    order_id
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/v3/finance/income_transaction_history_detail/";
    Url += "?order_id=" + order_id;
    Url += "&SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_search_report_by_time(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    agg_interval
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/search_report_by_time/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&agg_interval=" + agg_interval;

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_detail_report_by_time(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    placement_list,
    agg_interval,
    itemid,
    adsid
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/detail_report_by_time/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));
    Url += "&agg_interval=" + agg_interval;
    if (itemid != null && itemid != "") {
      Url += "&itemid=" + itemid;
    } else {
      Url += "&adsid=" + adsid;
    }

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_detail_report_by_keyword(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    placement_list,
    agg_interval,
    need_detail,
    itemid,
    adsid
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/detail_report_by_keyword/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));
    Url += "&agg_interval=" + agg_interval;
    Url += "&need_detail=" + need_detail;
    if (itemid != null && itemid != "") {
      Url += "&itemid=" + itemid;
    } else {
      Url += "&adsid=" + adsid;
    }

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_item_report_by_time(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    placement_list,
    agg_interval,
    itemid
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/item_report_by_time/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));
    Url += "&agg_interval=" + agg_interval;
    Url += "&itemid=" + itemid;

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_item_report_by_placement(
    SPC_CDS,
    proxy,
    UserAgent,
    cookie,
    start_time,
    end_time,
    placement_list,
    itemid
  ) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/report/item_report_by_placement/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&start_time=" + start_time;
    Url += "&end_time=" + end_time;
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));
    Url += "&itemid=" + itemid;

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/get_suggest_price/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_suggest_keyword_price(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");
        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/get_suggest_keyword_price/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";

    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          authority: "banhang.shopee.vn",
          "sec-ch-ua":
            '"Google Chrome";v="93", " Not;A Brand";v="99", "Chromium";v="93"',
          "sc-fe-ver": "30988",
          "sc-fe-session": uuidv4(),
          "user-agent": UserAgent,
          "content-type": "application/json;charset=UTF-8",
          accept: "application/json, text/plain, */*",
          "sec-ch-ua-mobile": "?0",
          "sec-ch-ua-platform": '"Windows"',
          origin: "https://banhang.shopee.vn",
          "sec-fetch-site": "same-origin",
          "sec-fetch-mode": "cors",
          "sec-fetch-dest": "empty",
          referer: "https://banhang.shopee.vn/portal/marketing/pas/assembly/",
          "accept-language": "en-US,en;q=0.9,vi;q=0.8",
          cookie: applyCookie(cookie),
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_segment_suggest_price(SPC_CDS, proxy, UserAgent, cookie, data) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/marketing/v3/pas/get_segment_suggest_price/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    const result = this.http_client
      .http_request(
        Url,
        "POST",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        data
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_campaign_list(SPC_CDS, proxy, UserAgent, cookie, placement_list) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url = "https://banhang.shopee.vn/api/marketing/v3/pas/campaign/list/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";
    Url += "&placement_list=" + encodeURI(JSON.stringify(placement_list));

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }

  api_get_query_collection_list(SPC_CDS, proxy, UserAgent, cookie) {
    let self = this;
    if (cookie != null) {
      if (!cookie.startsWith("{")) {
        if (cookie.indexOf("[ROOT]") == -1)
          cookie = RSA.decrypt(cookie, "utf8");
        else cookie = cookie.replace("[ROOT]", "");

        cookie = initCookie(cookie);
      } else {
        cookie = JSON.parse(cookie);
      }
    }
    let Url =
      "https://banhang.shopee.vn/api/shopcategory/v3/category/query_collection_list/";
    Url += "?SPC_CDS=" + SPC_CDS;
    Url += "&SPC_CDS_VER=2";

    const result = this.http_client
      .http_request(
        Url,
        "GET",
        null,
        {
          cookie: applyCookie(cookie),
          "User-Agent": UserAgent,
          referer: "https://banhang.shopee.vn/",
        },
        null
      )
      .then(
        function (response) {
          response.cookie = JSON.stringify(setCookie(cookie, response.headers));
          return {
            code: 0,
            message: "OK",
            status: response.status,
            data: response.data,
            cookie: response.cookie,
            proxy: { code: 0, message: "OK" },
          };
        },
        function (error) {
          if (error.response) {
            error.response.cookie = JSON.stringify(
              setCookie(cookie, error.response.headers)
            );
            return {
              code: 999,
              message: error.response.statusText,
              status: error.response.status,
              data: error.response.data,
              cookie: error.response.cookie,
              proxy: {
                code: error.response.status == 407 ? 1 : 0,
                message:
                  error.response.status == 407
                    ? error.response.statusText
                    : "OK",
              },
            };
          } else {
            return {
              code: 1000,
              message: error.code + " " + error.message,
              status: 1000,
              data: null,
              cookie: null,
              proxy: { code: 0, message: "OK" },
            };
          }
        }
      );
    return result;
  }
}
module.exports = ShopeeAPI;
