(async function () {
  const items = [];

  document.querySelectorAll(".product-item").forEach((element) => {
    const title = element.querySelector(".product-item__title").innerText.replace('MyGO!!!!! ZEPP TOUR 2025「心のはしを辿って」', '').trim();
    const price = element.querySelector(".price").innerText.match(/([\d,]+)円/)[0];
    const link = element.querySelector('.product-item__title').getAttribute('href')
    items.push({ '名称': title, '价格': price  });
  });

  
  // 加载 SheetJS（如果还没加载）
  if (typeof XLSX === "undefined") {
    await new Promise((resolve) => {
      const script = document.createElement("script");
      script.src = "https://cdn.sheetjs.com/xlsx-latest/package/dist/xlsx.full.min.js";
      script.onload = resolve;
      document.head.appendChild(script);
    });
  }

  // 创建工作表和工作簿
  const worksheet = XLSX.utils.json_to_sheet(items);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "商品");

  XLSX.writeFile(workbook, "商品.xlsx");
})();
