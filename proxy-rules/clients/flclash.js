// FlClash / Clash Verge 覆写脚本。由 proxy-rules 生成，不要手改。
// 不是节点订阅，也不是在线转换。先导入机场订阅，再把这个文件的原始链接填进覆写脚本。
// https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/flclash.js
// 脚本只替换策略组、规则和 mode。不改节点，也不打开 allow-lan。
// AI 组的成员写死在 spec 里，只有手动选择。
function main(config) {
  if (!config || typeof config !== "object") {
    return config;
  }
  stripNodeEmoji(config);
  var spec = {"exclude":"(到期|剩余流量|官网|产品|平台)","groups":[{"name":"默认代理","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Proxy.png","proxies":["自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"AI","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/AI.png","proxies":["日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"广告拦截","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Advertising.png","proxies":["REJECT","DIRECT","默认代理"]},{"name":"YouTube","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/YouTube.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Google","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Google.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Telegram","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Telegram.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Twitter","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitter.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Discord","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Discord.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"WhatsApp","type":"select","icon":"https://fastly.jsdelivr.net/gh/Homarr-Labs/dashboard-icons@master/png/whatsapp.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"NETFLIX","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Netflix.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Disney+","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Disney%2B.png","proxies":["日本节点","台湾节点","狮城节点","美国节点","日本自动","台湾自动","狮城自动","美国自动","全部节点","DIRECT"]},{"name":"Spotify","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Spotify.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Twitch","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Twitch.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Bahamut","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bahamut.png","proxies":["台湾节点","香港节点","台湾自动","香港自动","全部节点","DIRECT"]},{"name":"TikTok","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/TikTok.png","proxies":["日本节点","台湾节点","狮城节点","美国节点","日本自动","台湾自动","狮城自动","美国自动","全部节点","DIRECT"]},{"name":"国外媒体","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/ForeignMedia.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"哔哩哔哩","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/bilibili.png","proxies":["DIRECT","香港节点","台湾节点","默认代理"]},{"name":"国内媒体","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/DomesticMedia.png","proxies":["DIRECT","香港节点","台湾节点","默认代理"]},{"name":"Microsoft","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Microsoft.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"OneDrive","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/OneDrive.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Apple","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Apple.png","proxies":["DIRECT","默认代理","香港自动","日本自动","台湾自动","狮城自动","美国自动","自动选择","全部节点"]},{"name":"GitHub","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/GitHub.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Docker","type":"select","icon":"https://fastly.jsdelivr.net/gh/Homarr-Labs/dashboard-icons@master/png/docker.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Dev PKG","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Lab.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Cloudflare","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Cloudflare.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Yahoo","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Yahoo.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Bangumi","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Bookpedia.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"PayPal","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/PayPal.png","proxies":["美国节点","日本节点","香港节点","狮城节点","美国自动","日本自动","香港自动","狮城自动","全部节点","DIRECT"]},{"name":"Steam","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Steam.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"PlayStation","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/PlayStation.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Xbox","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Xbox.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"Nintendo","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Nintendo.png","proxies":["默认代理","自动选择","故障转移","香港节点","日本节点","台湾节点","狮城节点","美国节点","全部节点","DIRECT"]},{"name":"下载","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Download.png","proxies":["DIRECT","默认代理","香港自动","日本自动","狮城自动","美国自动","全部节点"]},{"name":"国内CDN","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Domestic.png","proxies":["DIRECT","默认代理"]},{"name":"国内社交","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/WeChat.png","proxies":["DIRECT","默认代理"]},{"name":"国内游戏","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Game.png","proxies":["DIRECT","默认代理"]},{"name":"漏网之鱼","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Final.png","proxies":["默认代理","DIRECT","香港自动","日本自动","狮城自动","美国自动","自动选择","全部节点"]},{"name":"全球直连","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Direct.png","proxies":["DIRECT","默认代理"]},{"name":"香港节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png","regex":"(港|HK|hk|Hong Kong|HongKong|hongkong)"},{"name":"日本节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png","regex":"(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan)"},{"name":"台湾节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png","regex":"(台|新北|彰化|TW|Taiwan)"},{"name":"狮城节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png","regex":"(新加坡|坡|狮城|SG|Singapore)"},{"name":"美国节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png","regex":"(美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States)"},{"name":"全部节点","type":"select","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Global.png","regex":".*"},{"name":"自动选择","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Auto.png","regex":".*","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"香港自动","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png","regex":"(港|HK|hk|Hong Kong|HongKong|hongkong)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"日本自动","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png","regex":"(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"台湾自动","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png","regex":"(台|新北|彰化|TW|Taiwan)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"狮城自动","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png","regex":"(新加坡|坡|狮城|SG|Singapore)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"美国自动","type":"url-test","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png","regex":"(美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"故障转移","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Available.png","regex":".*","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"香港故转","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Hong_Kong.png","regex":"(港|HK|hk|Hong Kong|HongKong|hongkong)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"日本故转","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Japan.png","regex":"(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"台湾故转","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Taiwan.png","regex":"(台|新北|彰化|TW|Taiwan)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"狮城故转","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/Singapore.png","regex":"(新加坡|坡|狮城|SG|Singapore)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50},{"name":"美国故转","type":"fallback","icon":"https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/United_States.png","regex":"(美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States)","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50}],"rules":[{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/LocalAreaNetwork.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ddgksf2013/Filter/master/Unbreak.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/UnBan.list","interval":86400},{"kind":"url","group":"广告拦截","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/microsoft-telemetry.list","interval":86400},{"kind":"url","group":"广告拦截","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list","interval":86400},{"kind":"url","group":"广告拦截","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanProgramAD.list","interval":86400},{"kind":"url","group":"广告拦截","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanEasyListChina.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/GoogleCN.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/SteamCN.list","interval":86400},{"kind":"url","group":"下载","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/download-cdn.list","interval":86400},{"kind":"url","group":"AI","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/ai.list","interval":86400},{"kind":"url","group":"YouTube","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/YouTube.list","interval":86400},{"kind":"url","group":"美国节点","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GoogleVoice/GoogleVoice.list","interval":86400},{"kind":"url","group":"Google","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Google/Google.list","interval":86400},{"kind":"url","group":"Telegram","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Telegram.list","interval":86400},{"kind":"url","group":"Twitter","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Twitter/Twitter.list","interval":86400},{"kind":"url","group":"Discord","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Discord/Discord.list","interval":86400},{"kind":"url","group":"WhatsApp","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Whatsapp/Whatsapp.list","interval":86400},{"kind":"url","group":"GitHub","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/GitHub/GitHub.list","interval":86400},{"kind":"url","group":"Docker","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Docker/Docker.list","interval":86400},{"kind":"url","group":"Dev PKG","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/dev-pkg.list","interval":86400},{"kind":"url","group":"OneDrive","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/OneDrive.list","interval":86400},{"kind":"url","group":"Microsoft","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Microsoft.list","interval":86400},{"kind":"url","group":"Apple","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Apple.list","interval":86400},{"kind":"url","group":"TikTok","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/TikTok/TikTok.list","interval":86400},{"kind":"url","group":"Yahoo","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/yahoo.list","interval":86400},{"kind":"url","group":"Bahamut","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bahamut.list","interval":86400},{"kind":"url","group":"NETFLIX","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Netflix.list","interval":86400},{"kind":"url","group":"Disney+","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Disney/Disney.list","interval":86400},{"kind":"url","group":"Spotify","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Spotify/Spotify.list","interval":86400},{"kind":"url","group":"Twitch","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Twitch/Twitch.list","interval":86400},{"kind":"url","group":"Bangumi","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/bangumi.list","interval":86400},{"kind":"url","group":"PayPal","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/PayPal/PayPal.list","interval":86400},{"kind":"url","group":"Cloudflare","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/cloudflare.list","interval":86400},{"kind":"url","group":"默认代理","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Epic.list","interval":86400},{"kind":"url","group":"默认代理","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Speedtest/Speedtest.list","interval":86400},{"kind":"url","group":"下载","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/steam-download.list","interval":86400},{"kind":"url","group":"Steam","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Steam.list","interval":86400},{"kind":"url","group":"PlayStation","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Sony.list","interval":86400},{"kind":"url","group":"PlayStation","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/PlayStation/PlayStation.list","interval":86400},{"kind":"url","group":"Xbox","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Xbox/Xbox.list","interval":86400},{"kind":"url","group":"Nintendo","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Nintendo.list","interval":86400},{"kind":"url","group":"哔哩哔哩","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/BilibiliHMT.list","interval":86400},{"kind":"url","group":"哔哩哔哩","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/Ruleset/Bilibili.list","interval":86400},{"kind":"url","group":"国内媒体","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/ChinaMedia/ChinaMedia.list","interval":86400},{"kind":"url","group":"国内社交","url":"https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/wechat.list","interval":86400},{"kind":"url","group":"国内游戏","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Game/GameDownloadCN/GameDownloadCN.list","interval":86400},{"kind":"url","group":"国内CDN","url":"https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Alibaba/Alibaba.list","interval":86400},{"kind":"url","group":"国外媒体","url":"https://raw.githubusercontent.com/ddgksf2013/Filter/master/Streaming.list","interval":86400},{"kind":"url","group":"国外媒体","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyMedia.list","interval":86400},{"kind":"url","group":"默认代理","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ProxyGFWlist.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaDomain.list","interval":86400},{"kind":"url","group":"全球直连","url":"https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/ChinaCompanyIp.list","interval":86400},{"kind":"geoip","group":"全球直连","param":"CN"},{"kind":"final","group":"漏网之鱼"}]};
  var groups = [];
  var i;
  for (i = 0; i < spec.groups.length; i++) {
    groups.push(buildGroup(spec.groups[i], spec.exclude));
  }
  var providers = {};
  var rules = [];
  for (i = 0; i < spec.rules.length; i++) {
    var rule = spec.rules[i];
    if (rule.kind === "url") {
      var id = "labs" + i;
      providers[id] = {
        type: "http",
        behavior: "classical",
        format: "text",
        interval: rule.interval,
        url: rule.url,
        path: "./ruleset/" + id + ".list"
      };
      rules.push("RULE-SET," + id + "," + rule.group);
    } else if (rule.kind === "geoip") {
      rules.push("GEOIP," + rule.param + "," + rule.group);
    } else if (rule.kind === "final") {
      rules.push("MATCH," + rule.group);
    }
  }
  config["proxy-groups"] = groups;
  config["rule-providers"] = providers;
  config.rules = rules;
  config.mode = "rule";
  return config;
}

function stripNodeEmoji(config) {
  var list = config.proxies;
  if (!list || !list.length) {
    return;
  }
  var seen = {};
  var i;
  for (i = 0; i < list.length; i++) {
    var item = list[i];
    if (!item || typeof item.name !== "string") {
      continue;
    }
    var name = withoutEmoji(item.name);
    if (!name) {
      name = "节点";
    }
    var base = name;
    var n = 2;
    while (seen[name]) {
      name = base + " " + n;
      n++;
    }
    seen[name] = true;
    item.name = name;
  }
}

function withoutEmoji(name) {
  var out = "";
  var i = 0;
  while (i < name.length) {
    var code = name.charCodeAt(i);
    var cp = code;
    var width = 1;
    if (code >= 0xD800 && code <= 0xDBFF && i + 1 < name.length) {
      var next = name.charCodeAt(i + 1);
      if (next >= 0xDC00 && next <= 0xDFFF) {
        cp = (code - 0xD800) * 0x400 + (next - 0xDC00) + 0x10000;
        width = 2;
      }
    }
    if (isEmojiCode(cp)) {
      i += width;
      continue;
    }
    out += name.substr(i, width);
    i += width;
  }
  return out.replace(/[ \t]+/g, " ").replace(/^ | $/g, "");
}

function isEmojiCode(cp) {
  return cp === 0xFE0F || cp === 0xFE0E || cp === 0x200D || cp === 0x20E3 || (cp >= 0x2600 && cp <= 0x27BF) || (cp >= 0x2B00 && cp <= 0x2BFF) || cp >= 0x1F000;
}

function buildGroup(group, exclude) {
  var out = { name: group.name, type: group.type };
  if (group.icon) {
    out.icon = group.icon;
  }
  if (group.proxies && group.proxies.length) {
    out.proxies = group.proxies;
    return out;
  }
  out["include-all"] = true;
  if (group.regex) {
    out.filter = group.regex;
  }
  if (exclude) {
    out["exclude-filter"] = exclude;
  }
  out["empty-fallback"] = "DIRECT";
  if (group.type !== "select") {
    out.url = group.url || "http://www.gstatic.com/generate_204";
    out.interval = group.interval || 300;
    out.lazy = true;
    if (group.type === "url-test") {
      out.tolerance = group.tolerance || 50;
    }
  }
  return out;
}
