// ==UserScript==
// @name         Bushiroad Store 自定义加购表单
// @namespace    http://tampermonkey.net/
// @version      2025-03-27
// @description  try to take over the world!
// @author       You
// @match        https://bushiroad-store.com/collections/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=bushiroad-store.com
// @grant        none
// ==/UserScript==

(function() {
  'use strict';

  const style = document.createElement('style');
  style.textContent = `
    #qyForm {
      position: fixed;
      top: 90px; right: 20px;
      background: #fff;
      padding: 18px 22px;
      width: 320px;
      font-family: Arial, sans-serif;
      box-shadow: 0 0 12px rgba(0,0,0,0.15);
      border-radius: 8px;
      z-index: 99999;
      overflow: hidden;
    }
    #qyForm label {
      display: block;
      margin-bottom: 8px;
      font-size: 16px;
    }
    #qyForm input {
      width: 100%;
      padding: 6px 8px;
      box-sizing: border-box;
      margin-top: 4px;
      margin-bottom: 12px;
      font-size: 14px;
      border-radius: 4px;
      border: 1px solid rgba(0,0,0,0.24);
    }
 
    #qyForm .actions {
      display:flex;
      gap: 8px;
    }

    #qyForm .actions button {
      flex: 1;
      padding: 4px 0;
      background: #3388BB;
      border: none;
      color: white;
      font-size: 15px;
      cursor: pointer;
      border-radius: 4px;
    }

    #qyForm .actions .re {
      width: 5em;
      border: 1px solid rgba(0,0,0, 0.5);
      font-size: 14px;
      border-radius: 4px;
      display: flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
    }
  `;
  document.head.appendChild(style);

  const formHtml = `
    <form id="qyForm">
      <label>
        Variant ID
        <input type="text" id="qy_variantId" placeholder="自动抓取中..." required disabled />
      </label>
      <label>
        数量
        <input type="number" id="qy_quantity" value="1" min="1" required />
      </label>
      <label style="display: none">
        发售日
        <input type="text" id="qy_releaseDate" />
      </label>
      <label style="display: none">
        商品ID
        <input type="text" id="qy_productId" placeholder="可选" disabled />
      </label>
      <label style="display: none">
        section-id:
        <input type="text" id="qy_sectionId" />
      </label>
      <div class="actions">
        <button id="qySubmit" type="submit">添加到购物车</button>
        <div style="display: none" class="re" id="loadInfo">填充</div>
      </div>
    </form>
  `;

  const container = document.createElement('div');
  container.innerHTML = formHtml;
  document.body.appendChild(container);

  const variantInput = document.getElementById('qy_variantId');
  const productIdInput = document.getElementById('qy_productId');
  const releaseDateInput = document.getElementById('qy_releaseDate');

  getInfo()

  const form = document.getElementById('qyForm');
  const submitButton = document.getElementById('qySubmit')

  form.addEventListener('submit', e => {
    e.preventDefault();
    getInfo();

    const variantId = variantInput.value.trim();
    let quantity = document.getElementById('qy_quantity').value;
    const releaseDate = releaseDateInput.value.trim();
    const productId = productIdInput.value.trim();
    const sectionId = document.getElementById('qy_sectionId').value.trim();

    if (!variantId || !quantity || isNaN(quantity) || quantity < 1) {
      quantity = 1
      return;
    }

    const formData = new FormData();
    formData.append('form_type', 'product');
    formData.append('utf8', '✓');
    formData.append('id', variantId);
    formData.append('quantity', quantity);

    if (releaseDate) 
      formData.append('properties[_発売日]', releaseDate);
    if (productId) 
      formData.append('product-id', productId);
    if (sectionId) 
      formData.append('section-id', sectionId);

    submitButton.setAttribute('style', "display: none");

    const tips = document.createElement('div')
    tips.classList.add('tips')
    tips.innerText = '提交中，请稍后...'

    form.appendChild(tips)

    fetch('/cart/add', {
      method: 'POST',
      body: formData,
      credentials: 'same-origin',
    })
    .then(response => {
      if (response.redirected) {
        window.location.href = response.url;
        return null;
      }
      return response.text();
    })
    .then(data => {
      if (data) {
        resultDiv.textContent = '添加成功（无跳转），请查看购物车。';
      }
    })
    .catch(err => {
      resultDiv.textContent = '请求失败: ' + err.message;
    });
  });

  document.getElementById('loadInfo').addEventListener('click', getInfo)

  function getInfo() {
    if (!variantInput.value)
      variantInput.value = getVariantIdFromMeta();

    productIdInput.value = getProductIdFromMeta();
    releaseDateInput.value = getReleaseDateFromPage();
  }


  function getVariantIdFromMeta() {
    try {
      if (window?.meta?.product && Array.isArray(window.meta.product.variants)) {
        if (window.meta.product.variants.length > 0) {
          return window.meta.product.variants[0].id.toString();
        }
      }
    } catch (e) {}
    return null;
  }

  function getProductIdFromMeta() {
    try {
      if (window?.meta?.product?.id) {
        return window.meta.product.id.toString();
      }
    } catch (e) {}
    return '';
  }

  function getReleaseDateFromPage() {
    const input = document.querySelector('input[name="properties[_発売日]"]');
    if (input && input.value) {
      return input.value.trim();
    }
    return '';
  }
})();
