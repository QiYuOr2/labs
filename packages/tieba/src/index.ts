// ==UserScript==
// @name         贴吧H5优化
// @namespace    http://tampermonkey.net/
// @version      2023-12-10
// @description  try to take over the world!
// @author       You
// @match        ://tieba.baidu.com/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=baidu.com
// @grant        none
// ==/UserScript==

import { css } from '@uss/shared';

function findAndEditElement(selector: string, callback: { (item: any): any }) {
  const elements = document.querySelectorAll(selector);
  if (!elements.length) {
    setTimeout(() => findAndRemoveElement(selector), 500);
  } else {
    elements.forEach((item) => callback(item));
  }
}

function findAndRemoveElement(selector: string) {
  findAndEditElement(selector, (item) => item.remove());
}

css`
  .creative-shortcut-tip-container,
  .tbui_aside_fbar_button,
  .replace_tip,
  .replace_div {
    display: none !important;
  }

  .d_post_content {
    font-size: 16px !important;
  }
`;
