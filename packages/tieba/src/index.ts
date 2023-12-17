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

// == 删除不需要的元素 ==
css`
  #head,
  .share_btn_wrapper,
  .creative-shortcut-tip-container,
  .tbui_aside_fbar_button,
  .tb_rich_poster_container,
  .replace_tip,
  .right_section {
    display: none !important;
  }
`;

// == 主要内容样式调整 ==
css`
  .l_container,
  .content,
  .core_title_wrap_bright,
  .pb_content,
  .pb_footer,
  .core_reply_wrapper,
  .nav_list,
  .p_thread,
  [class^='thread_theme'] {
    width: 100% !important;
  }

  /* 长图展开 */
  .replace_div,
  .BDE_Image {
    width: 100% !important;
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
  .louzhubiaoshi {
    top: 0;
  }
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
