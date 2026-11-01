# 订阅规则

规则在这个目录里维护。改 `config/all.ini` 或 `rules/` 后直接推送，GitHub Action 用 Go 生成三份配置并提交回同一个分支。不用在本地跑命令。推到 `main` 之后，客户端只填已经生成好的文件链接。没有在线转换，也不会把机场地址发给别人。

仓库里的静态文件只负责策略组和远程分流，不保存机场地址。要把名单展开进同一份配置，用文末的合并服务。

推到 `main` 之前，这些静态链接是 404：

- FlClash 覆写脚本：`https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/flclash.js`
- Quantumult X 配置：`https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/quantumultx.conf`
- Shadowrocket 配置：`https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/shadowrocket.conf`

这是独立的 Go module，需要 Go 1.24 或更新版本，不要加进 pnpm workspace。

## FlClash

覆写脚本不是节点订阅。节点订阅填机场链接。

1. 配置里添加机场订阅，更新到能看到节点。FlClash 0.8.85 及以上才有覆写脚本。Clash Verge 也认这份 `main(config)` 脚本。
2. 配置，扩展，脚本，从 URL 导入上面的 `flclash.js`，再关联到这份配置。只保存、不关联，不会生效。
3. 使用规则模式。脚本会把 `mode` 改成 `rule`。
4. 「🤖 AI」只有手动的日本、台湾、新加坡、美国、全部节点、DIRECT。没有香港，没有自动选择，没有故障转移，也没有「🚀 默认代理」。

脚本留下机场的节点和 `proxy-providers`，换掉策略组和规则。不改端口，也不打开 `allow-lan`。

静态 `flclash.js` 里的广告、AI、流媒体名单仍是远程文件。要展开进脚本里，用下面的「FlClash 展开」。

Clash 不能跑 Quantumult X 的重写脚本。去广告靠分流里的 REJECT。

## Quantumult X

1. 在「节点」里把机场订阅加为节点订阅，不要加为完整配置。
2. 下载 `quantumultx.conf` 作为配置文件。里面有策略组、远程分流和墨鱼去广告重写。`[server_remote]` 是空的。
3. 导入后节点如果还在，保持订阅开启。如果没了，再加一次机场节点订阅。不要把机场地址写进这个文件或仓库。
4. 不要把这份 conf 设成会反复覆盖整份配置的订阅。远程分流和重写自己更新。策略组改了，才需要重新下载 conf。
5. 重写要生效，打开 MitM 并信任证书。只有去广告，没有会员解锁、倍速或去水印。
6. 「🤖 AI」手动固定一个日本、台湾、新加坡或美国节点。

`qx/ad-rewrite.conf` 是重写来源，生成配置时会抄进去。也可以把里面每一行单独加到「重写」。`opt-parser=false` 是普通重写，`opt-parser=true` 要打开资源解析器。

## 合并服务

GitHub Actions 不能接这个请求。它只在推送后生成静态文件。订阅链接要作为参数传进来，并且要现拉现合并，所以这部分部署到 Vercel。

不想手写编码时，打开 `https://proxy.qiyuor2.me/`。只贴订阅链接时，编码在浏览器里完成，页面不会收到订阅。机场拒绝服务器拉取时，把本地保存的配置文件传上来，页面返回一个合并后的固定链接和二维码。

上传认 Quantumult X、Shadowrocket、Clash 三种配置，也认 `ss://`、`vmess://`、`trojan://`、`vless://`、`hysteria2://` 节点列表。同一份文件可以分别生成这三种配置，选哪个按钮就得到哪种。Quantumult X 的节点行写成 `trojan=host:443` 或 `trojan = host:443` 都可以。同一份文件里已经是那种格式时，节点行原样保留；不是时，只转换常见协议。Clash 里的 Reality、gRPC 这些原样留在 Clash 配置里，转成另外两个客户端时会丢掉认不了的节点。

上传后的链接只保存合并结果，不保存原始文件。节点正文不会跟着机场变，规则也不会跟着仓库变，要更新就再传一次。文件里如果只有订阅地址、没有节点正文，Quantumult X 和 Clash 会把那个地址留下来，由客户端自己拉；小火箭没有这种字段，需要节点正文。重开页面后，同一个浏览器会复用上次的链接，再传一次是覆盖，不用改客户端里的地址。不要的配置在结果旁边点删除，或把旧链接贴回输入框再删除。删除后这条链接失效。忘了链接时，到 Vercel Storage 里按前缀 `subs/` 删除对应文件，不要删整个 Blob store。

1. Vercel 项目 `proxy-rules` 连接这个仓库，Root Directory 是 `proxy-rules`。不要用仓库根目录，`go.mod` 在这一层。
2. Framework Preset 是 Other。入口是 `api/qx.go`，路由是 `/api/qx`。不要选 Go Server，这里没有 `main.go` 或 `cmd/server/main.go`。
3. 部署完成后，在 Quantumult X 里把下面的地址作为完整配置下载，不要加到节点订阅：

`https://proxy-rules.vercel.app/api/qx?url=<编码后的订阅链接>`

服务拉取已生成的 `quantumultx.conf`，再拉取 `url`。只填入订阅里的 DNS 和节点。策略组和证书段仍用仓库里的。分流名单会展开进同一份配置。重写仍是远程资源。

- `[filter_remote]` 的名单会在返回前下载，并按原顺序写入 `[filter_local]`。`DOMAIN-SUFFIX` 转成 `HOST-SUFFIX`，`IP-CIDR6` 转成 `IP6-CIDR`，策略用原来的 `force-policy`。
- 任一名单下载失败或内容不是规则时，这次不展开，仍返回原来的远程分流，避免打乱先后顺序。
- 重写不展开。脚本和 hostname 继续走 `[rewrite_remote]`。
- 订阅是 Quantumult X 配置时，采用其中的 `[dns]`、`[server_local]` 和 `[server_remote]`。
- 订阅是 Clash，而且没有 Quantumult X 节点行时，只转换 `dns` 里的 IP 和 DoH。节点写不进 Quantumult X 的行内格式，因此把原订阅链接放进 `[server_remote]`，节点仍由 Quantumult X 更新。
- 订阅里没有 DNS 时，`[dns]` 保持空白，Quantumult X 使用自己的默认 DNS。
- 本机、内网和云元数据地址会拒绝。
- 不写入 `passphrase` 或 `p12`。这是完整配置，Quantumult X 大约每 24 小时整份覆盖一次，覆盖后需要重新信任证书，或从旧配置贴回证书。
- 换订阅只改 `url`。不要把带订阅链接的地址写进仓库。Vercel 访问日志里会留下这条地址，用自己的账号部署。

静态的 `quantumultx.conf` 仍然可以单独下载。那种用法不会带上订阅。

## Shadowrocket

静态的 `shadowrocket.conf` 仍使用远程 `RULE-SET`。要一份已经展开的配置，填这个地址，不要填到节点订阅：

`https://proxy-rules.vercel.app/api/sr?url=<编码后的订阅链接>`

不带 `url` 时只展开分流，`[Proxy]` 仍是空的，节点继续在首页添加。

1. 带 `url` 时，如果订阅本身是小火箭配置，会抄其中的 `[Proxy]` 和 `dns-server`。策略组、规则和 `[Host]` 仍用仓库里的。
2. 订阅不是小火箭节点行时，不猜测协议，`[Proxy]` 保持空白。Clash 或 Base64 节点请仍在首页添加。
3. 配置里的 `update-url` 会改成上面的地址，所以以后更新仍走这份展开后的配置。
4. `[Rule]` 里的 `RULE-SET` 会下载并写成 `DOMAIN-SUFFIX`、`IP-CIDR` 这种本地规则，顺序和策略不变。任一名单失败时，这次仍返回原来的远程 `RULE-SET`。
5. 小火箭用不了 Quantumult X 那套重写。广告域名走「🚫 广告拦截」，默认 REJECT。

## FlClash 展开

静态脚本仍引用远程名单。展开后的覆写脚本是：

`https://proxy-rules.vercel.app/api/flclash`

1. 先导入机场订阅，再把这个地址填进覆写脚本并关联。它只替换策略组、规则和 `mode`，不改节点，也不打开 `allow-lan`。
2. 不想分两步时，在页面上选 Clash，上传任意一种配置。得到的是完整 Clash 配置，作为配置订阅导入，不要填进覆写脚本。`allow-lan` 固定关闭。「🤖 AI」仍然只有手动节点。
3. 名单写进 `config.rules`，`rule-providers` 置空。规则保持 Clash 的 `DOMAIN-SUFFIX` 写法，策略用原来的组名。
4. 任一名单下载失败时，这次仍返回原来的远程脚本。上传生成的完整配置也一样：名单失败时保留远程 `RULE-SET`，不打乱顺序。

## 策略组

三个客户端的策略名都不带 emoji，图标用 Qure Color。FlClash 和 Mihomo 写在 `icon`，Quantumult X 和 Shadowrocket 写在策略行末尾的 `img-url`。导入节点时会去掉名字里的 emoji，地区规则仍按剩下的文字匹配。

「🤖 AI」只有手动选择：日本、台湾、新加坡、美国、全部节点、DIRECT。没有香港，没有自动选择，没有故障转移，也没有「🚀 默认代理」。默认代理那一组里面带了自动选择和故障转移，AI 流量再跳进去就会换节点。

名单在 `rules/ai.list`，只收具体产品域名，例如 OpenAI、Claude、Google AI、Grok、Perplexity、Cursor、Copilot、Mistral、Groq、OpenRouter、Hugging Face、Midjourney、Suno、Poe。不收 `auth0`、`stripe`、`sentry`、`amazonaws`、`cloudflare`、`googleapis`、`www.bing.com` 这种会被大量无关网站命中的域名，也不收 DeepSeek、Kimi、豆包。

其他组的默认值：

- 广告拦截默认 REJECT。需要放行时再改成 DIRECT。
- Apple、国内媒体、国内社交、国内游戏、国内 CDN、下载、全球直连默认 DIRECT。
- Disney+ 和 TikTok 不放香港，也不放全局自动选择，只留日、台、新、美。
- PayPal 不放台湾。
- Bahamut 只有香港和台湾。
- YouTube、Netflix、Spotify、Telegram、Google 这些可以走默认代理。默认代理里才提供自动选择和故障转移。

地区正则按大小写分开写，不用 `(?i)`。Quantumult X 和 Shadowrocket 会解析失败。

## 去广告

分流里的广告规则顺序是：墨鱼 `Unbreak.list`、ACL4SSR `UnBan.list`，然后才是微软遥测、`BanAD`、`BanProgramAD`、`BanEasyListChina`。修正名单必须在拦截前面，否则登录和支付接口会被误杀。

流媒体在具体服务之后，还有墨鱼 `Streaming.list` 和 ACL4SSR `ProxyMedia.list`。哔哩哔哩写在国内媒体前面，避免被国内名单抢走。

Cats-Team 全量广告名单大约 7MB，默认不内联。确实要开时，去掉 `config/all.ini` 里 `AdRules` 那一行的分号，再重新生成。

墨鱼的开屏、彩云、知乎、YouTube、微博、高德、网易云、闲鱼、哔哩哔哩、百度网盘净化只进 Quantumult X 重写。不要再导入会员解锁、倍速或去水印。

大名单不复制进仓库。`all.ini` 里的 `86400` 是客户端缓存秒数。Action 不负责把 ACL4SSR 或墨鱼的名单再抓一遍，否则仓库会胀，更新也不会比客户端自己拉更快。

## 改规则

改 `config/all.ini` 或 `rules/` 后直接推送。Action 会跑测试和 `check`，再生成 `clients/` 里的三份配置并提交。拉一次远程就能看到新文件。客户端里更新对应链接。

Action 用仓库自带的 `GITHUB_TOKEN` 推送，这个推送不会再次触发 Action。分支如果禁止 Actions 写入，要在仓库设置里允许 GitHub Actions 推送。

只想在推送前本地看一眼：

```shell
go -C proxy-rules test ./...
go -C proxy-rules run ./cmd/render
go -C proxy-rules run ./cmd/check
```

已经在 `proxy-rules` 目录时，去掉 `-C proxy-rules`。`render -check` 只比较，不写文件。

`check` 会确认策略组都能对上、没有自己引用自己、AI 组仍是固定的那一行、Unbreak 在广告前面、哔哩哔哩在国内媒体前面，以及仓库里没有机场订阅或公共转换地址。
