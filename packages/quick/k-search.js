// ==UserScript==
// @name         K键搜索
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  CtrlK, ConmmandK 定位主搜索框
// @author       qiyuor2
// @match        *://*/*
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const domainInputIdMap = {
    'www.xiaohongshu.com': '#search-input',
    'www.taobao.com': '#q',
    'x.com': 'input[enterkeyhint="search"]'
  }

  window.addEventListener('load', () => {
    findMainInput(mateKListener)
  })

  function mateKListener(input) {
    document.addEventListener('keydown', (event) => {
      if (event.key === 'k' && (event.ctrlKey || event.metaKey)) {
        console.log('meta k')
        event.preventDefault();
        input.focus();
        input.select();
      }
    });
  }

  function loopCheckInput(id, onFineded,count = 100) {
    const input = document.querySelector(id);
    if (input) {
      onFineded(input);
      return
    }

    if (count > 0) {
      setTimeout(() => {
        loopCheckInput(id, onFineded, count - 1);
      }, 100);
    }
  }
  

  function findMainInput(callback) {
    for (const [domain, inputId] of Object.entries(domainInputIdMap)) {
      if (window.location.href.includes(domain)) {
        loopCheckInput(inputId, (input) => {
          console.warn('[K] input ', input)
          callback(input)
        });
        break
      }
    }
  }
})();