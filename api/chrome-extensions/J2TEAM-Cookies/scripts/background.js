"use strict";
! function(e) {
    e.runtime.onInstalled.addListener(function(t) {
        switch (t.reason) {
            case "install":
                e.tabs.create({
                    url: e.runtime.getManifest().homepage_url
                })
        }
    }), e.runtime.setUninstallURL("https://www.junookyo.com/2019/09/create-milestone-facebook-fanpage.html?utm_source=extension&utm_medium=j2team_cookies")
}(chrome);