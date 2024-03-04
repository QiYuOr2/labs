// ==UserScript==
// @name         蜜柑计划快速下载
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  在磁链后面添加下载按钮
// @author       qiyuor2
// @match        https://mikanani.me/*
// @icon         https://mikanani.me/images/favicon.ico?v=2
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const buttonClassName = 'append_download'

  function appendDownloadButton(element, value) {
      if (element.parentNode.querySelector(`.${buttonClassName}`)) {
          return
      }

      const a = document.createElement('a')
      a.className = buttonClassName
      a.href = value
      a.target = '_blank'
      a.innerText = '[点击下载]'
      element.parentNode.append(a)
  }

  function handleAllLink() {
      Array.from(document.querySelectorAll('[data-clipboard-text]')).forEach(link => {
          const value = link.dataset.clipboardText;
          appendDownloadButton(link, value);
      });
  }

  document.querySelectorAll('.js-expand_bangumi').forEach(card => {
      card.onclick = () => {
          setTimeout(() => handleAllLink(), 1000);
      };
  })

  document.querySelectorAll('.js-expand-episode').forEach(button => {
      button.onclick = () => {
          setTimeout(() => handleAllLink(), 1000);
      };
  })

  handleAllLink();
})();