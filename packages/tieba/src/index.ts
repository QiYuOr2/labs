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
  /* == 删除不需要的元素 == */
  .creative-shortcut-tip-container,
  .tbui_aside_fbar_button,
  .replace_tip,
  .right_section {
    display: none !important;
  }

  /* == 主要内容样式调整 == */
  .l_container {
    /* TODO 调整整体宽度 */
  }

  /* 长图展开 */
  .replace_div {
    height: unset !important;
  }

  .d_post_content {
    font-size: 16px !important;
  }

  .left_section,
  .l_post {
    width: 100% !important;
  }

  .l_post {
    display: flex !important;
    flex-direction: column !important;
  }

  /* 用户信息 */
  .l_post .d_author {
    width: 100% !important;
    text-align: left !important;
    background: #fff !important;
    padding: 0 !important;
  }
  .l_post .d_author .p_author {
    display: flex !important;
    align-items: center;
    gap: 16px;
    padding: 12px 24px !important;
  }
  .l_post .d_author .p_author .d_nameplate {
    display: none !important;
  }
  .l_post .d_author .p_author .j_user_card,
  .l_post .d_author .p_author img[username],
  .l_post .d_author .p_author .p_author_face {
    width: 48px !important;
    height: 48px !important;
    border-radius: 50%;
    padding: 0 !important;
  }

  .l_post .d_author .p_author .l_badge {
    margin-top: 0 !important;
  }

  /* 楼层 */
  .l_post .d_post_content_main {
    width: 100% !important;
    padding: 0 !important;
  }
  .l_post .d_post_content_main .p_content {
    padding: 0 !important;
  }

  .l_post .d_post_content_main .d_post_content {
    box-sizing: border-box;
    padding: 0 24px !important;
  }
`;
