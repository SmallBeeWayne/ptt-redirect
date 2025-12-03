// ==UserScript==
// @name         PTT 相關網站自動轉址到 ptt.cc
// @namespace    https://github.com/SmallBeeWayne/ptt-redirect/
// @description  將 pttweb, ptthito, moptt 轉回 ptt
// @version      0.1.0
// @author       SmallBee
// @homepage	 https://github.com/SmallBeeWayne/ptt-redirect
// @supportURL	 https://github.com/SmallBeeWayne/ptt-redirect/issues
// @license      MIT
// @match        *://*.pttweb.cc/bbs/*
// @match        *://ptthito.com/*
// @match        *://*.moptt.tw/p/*
// @run-at       document-start
// ==/UserScript==

(function () {
    'use strict';

    const doRedirect = () => {
        let pathname = window.location.pathname;
        let newURL = null;

        switch (window.location.host) {
        case "www.pttweb.cc":
        case "pttweb.cc": {
                newURL = `https://www.ptt.cc${pathname}.html`;
                break;
            }
        case "ptthito.com": {
                pathname = pathname.replaceAll("-", ".");
                const secondPathReg = new RegExp(/(?<=\/.+\/.*).+(?=.*\/)/g);
                const secondPath = secondPathReg.exec(pathname)[0];
                pathname = pathname.replace(/(?<=\/.+\/.*).+(?=.*\/)/g, secondPath.toUpperCase());
                pathname = pathname.replace(/\/$/g, "");
                newURL = `https://www.ptt.cc/bbs${pathname}.html`;
                break;
            }
        case "www.moptt.tw":
        case "moptt.tw": {
                newURL = pathname.replace(/^\/p\/([^.]+)\.(.+)$/, 'https://www.ptt.cc/bbs/$1/$2.html');
                break;
            }
        };

        if (newURL && newURL !== window.location.href) {
            location.replace(newURL);
        }
    };

    doRedirect();
})();
