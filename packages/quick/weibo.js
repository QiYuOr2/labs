// ==UserScript==
// @name         修复微博时间线
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  修复微博时间线
// @author       qiyuor2
// @match        https://weibo.com/*
// @match        https://weibo.com/
// @icon         https://www.google.com/s2/favicons?sz=64&domain=weibo.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  var origOpen = XMLHttpRequest.prototype.open;
  XMLHttpRequest.prototype.open = function () {
      if (arguments[1].indexOf('/ajax/feed/unreadfriendstimeline') > -1) {
          var modifiedArgus = arguments;
          modifiedArgus[1] = modifiedArgus[1].replace('unreadfriend', 'friend');
          origOpen.apply(this, modifiedArgus);
      } else {
          origOpen.apply(this, arguments);
      }
  };
})();