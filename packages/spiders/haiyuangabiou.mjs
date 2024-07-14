/////////////////////////////////////////////
// 
// 目标网站：https://mfirst.haiyuangabiou.com
// 
/////////////////////////////////////////////

import fs from 'node:fs'
import fetch from 'node-fetch';
import { load } from 'cheerio';

const basicURL = 'https://mfirst.haiyuangabiou.com';

fetch(`${basicURL}/info_wurw/dir.html`).then(res => res.text()).then(async (body) => {
  const $ = load(body);
  const items = [];

  $('.cjcon.yxj').each((i, el) => {
    const $el = $(el);
    items.push({
      title: $el.find('.order').text(),
      url: `${basicURL}${$el.find('a').attr('href')}`,
    });
  });

  async function readSubTxt(url, next) {
    const subResponse = await fetch(`${url.replace(/\.html$/, `_${next}.html`)}`);
    const subBody = await subResponse.text();
    const $ = load(subBody);

    return $('.rdtext').text().trim();
  }

  for (const item of items) {
    // https://mfirst.haiyuangabiou.com/read_wurw/zfdsb.html
    const response = await fetch(item.url);
    const body = await response.text();

    const $ = load(body);
    const content = [];

    // 新手魔王 (1 / 3)_
    const title = $('h1').text();
    const [, currentTxt, totalTxt] = title.match(/\((\d+) \/ (\d+)\)/);
    const current = parseInt(currentTxt, 10);
    const total = parseInt(totalTxt, 10);

    content.push('\n\n');
    content.push(item.title);
    content.push($('.rdtext').text().trim());

    console.log(`[${current}/${total}] ${item.title}`)

    for (let i = current + 1; i <= total; i++) {
      const subContent = await readSubTxt(item.url, i)
      content.push(subContent);
    }

    item.content = content.join('\n');

    // 大狗狗?是狼!.txt -> 大狗狗是狼.txt 去除文件名中的符号
    item.title = item.title.replace(/[\?\*\|\\\/:<>"]/g, ' ');
    fs.writeFileSync(`./spider_result/${item.title}.txt`, item.content, 'utf-8')
  }
});