// ==UserScript==
// @name         PTT 相關網站自動轉址到 ptt.cc
// @namespace    https://github.com/SmallBeeWayne/ptt-redirect/
// @description  將 pttweb, ptthito, moptt 轉回 ptt
// @version      0.0.1
// @author       SmallBee
// @homepage	 https://github.com/SmallBeeWayne/ptt-redirect
// @supportURL	 https://github.com/SmallBeeWayne/ptt-redirect/issues
// @license      MIT
// @match        *://*.pttweb.cc/bbs/*
// @match        *://ptthito.com/*
// @match        *://*.moptt.tw/p/*
// @run-at       document-start
// @grant        window.onurlchange
// ==/UserScript==

(function ()
 {
    'use strict';

    async function verityURL(chkURL) {
        try {
            // TODO: 由於 CORS 政策目前還是 Failed to fetch 無法進行無效檢查
            const response = await fetch(chkURL, {
                method: 'GET',
                cache: 'no-cache',
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
                    'Accept-Language': 'zh-TW,zh;q=0.9,en;q=0.8',
                    'Referer': 'https://www.ptt.cc/'
                },
                // 只讀取前 10KB，避免下載整頁
                signal: AbortSignal.timeout(5000)
            });
            // 只讀取少量內容檢查 404
            const reader = response.body.getReader();
            const { done, value } = await reader.read();

            if (done) return !response.ok;

            const text = new TextDecoder().decode(value);
            return (
                !response.ok ||
                text.includes('404') ||
                text.includes('Not Found') ||
                text.includes('找不到') ||
                text.includes('無此文章')
            );

        } catch (error) {
            console.log('Verity fail:', error.message);
            return false; // 錯誤暫時不視為失敗，直到解決 fetch 問題
        }
    }

    const doRedirect = () => {
        let pathname = window.location.pathname;
        let newURL = null;

        // console.log('Current host:', pathname); // debug 用
        switch (window.location.host)
        {
            case "www.pttweb.cc":
            case "pttweb.cc":
                {
                    newURL = `https://www.ptt.cc${pathname}.html`;
                    break;
                }
            case "ptthito.com":
                {
                    pathname = pathname.replaceAll("-", ".");
                    const secondPathReg = new RegExp(/(?<=\/.+\/.*).+(?=.*\/)/g);
                    const secondPath = secondPathReg.exec(pathname)[0];
                    pathname = pathname.replace(/(?<=\/.+\/.*).+(?=.*\/)/g, secondPath.toUpperCase())
                    pathname = pathname.replace(/\/$/g, "");
                    newURL = `https://www.ptt.cc/bbs${pathname}.html`;
                    break;
                }
//             case "www.disp.cc":
//             case "disp.cc":
//                 {
//                     const linkElement = document.evaluate("//span[contains(text(),'※ 文章網址: ')]/a", document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
//                     if (linkElement !== null) newURL = linkElement.href;
//                     break;
//                 }
            case "www.moptt.tw":
            case "moptt.tw":
                {
                    newURL = pathname.replace(/^\/p\/([^.]+)\.(.+)$/, 'https://www.ptt.cc/bbs/$1/$2.html');
                    break;
                }
        }

        if (newURL) {
            console.log('New URL:', newURL); // debug 用
            verityURL(newURL).then(isFail => {
                if (isFail) {
                    // NOTE: 由於 CORS 政策，進一步導致這個快險功能永遠不會執行
                    // 建立自動淡出的快顯通知
                    const notification = document.createElement('div');
                    notification.style.cssText = `
            position: fixed; top: 20px; right: 20px; z-index: 99999;
            background: #ff4444; color: white; padding: 15px 20px;
            border-radius: 8px; font-size: 16px; font-weight: bold;
            box-shadow: 0 4px 12px rgba(0,0,0,0.3); min-width: 250px;
            animation: slideIn 0.3s ease-out;
        `;
                    notification.innerHTML = `
            <div>🔒 原始文章不存在 (刪除或過期)</div>
            <div style="font-size: 14px; opacity: 0.9;">${newURL}</div>
            <div style="font-size: 12px; margin-top: 8px; opacity: 0.8;">
                404 - Not Found (自動取消轉址)
            </div>
        `;

                    // 動畫樣式
                    const style = document.createElement('style');
                    style.textContent = `
            @keyframes slideIn { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
            @keyframes slideOut { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
        `;
                    document.head.appendChild(style);

                    document.body.appendChild(notification);

                    setTimeout(() => {
                        notification.style.animation = 'slideOut 0.3s ease-in forwards';
                        setTimeout(() => notification.remove(), 300);
                    }, 6000);
                } else {
                    location.replace(newURL);
                }
            });
        }
    }

    console.log(`Start PTT redirect`);
    doRedirect();

    // NOTE: 不知道是否有用，先留著
    if (window.onurlchange === null) window.addEventListener('urlchange', doRedirect);
})();
