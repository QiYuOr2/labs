// ==UserScript==
// @name         Bushiroad Store 按钮放开
// @namespace    http://tampermonkey.net/
// @version      2025-03-27
// @description  try to take over the world!
// @author       You
// @match        https://bushiroad-store.com/collections/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bushiroad-store.com
// @grant        none
// ==/UserScript==

(function () {
  "use strict";

  const container = document.querySelector(".product-form__payment-container");

  if (container.getAttribute("hidden") !== "") {
    return;
  }

  container.removeAttribute("hidden");
  const button = document.querySelector(".product-form__add-button");
  button.classList.remove("button--disabled");
  button.classList.add("button--primary");
  button.removeAttribute("disabled");
  button.setAttribute("data-action", "add-to-cart");
  button.innerText = "予約注文";

  // const inner = `
  //           <label for="template--15692995330255__main-7614282268879-quantity" class="product-form__info-title text--strong">数量:</label>

  //           <div class="product-form__info-content">
  //             <div class="quantity-selector quantity-selector--product">
  //               <button type="button" data-max_add_cart="5" class="quantity-selector__button" data-action="decrease-picker-quantity" aria-label="数量を1減らす" title="数量を1減らす"><svg focusable="false" class="icon icon--minus" viewBox="0 0 10 2" role="presentation">
  //   <path d="M10 0v2H0V0z" fill="currentColor"></path>
  // </svg></button>
  //               <input name="quantity" aria-label="数量" class="quantity-selector__value" inputmode="numeric" value="1" size="3">
  //               <button type="button" data-max_add_cart="5" class="quantity-selector__button" data-action="increase-picker-quantity" aria-label="数量を1増やす" title="数量を1増やす"><svg focusable="false" class="icon icon--plus" viewBox="0 0 10 10" role="presentation">
  //   <path d="M6 4h4v2H6v4H4V6H0V4h4V0h2v4z" fill="currentColor" fill-rule="evenodd"></path>
  // </svg></button>
  //             </div><span class="max__product-metafield">お一人様5点まで</span></div>
  //           <span class="error__quantity">5点までしか購入できません</span>
  //         `;

  // const formList = document.querySelector(".product-form__info-list");
  // const item = document.createElement("div");
  // item.innerHTML = inner;
  // item.className = "product-form__info-item product-form__info-item--quantity";

  // formList.appendChild(item);
})();
