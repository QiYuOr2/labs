package rules

import (
	"fmt"
	"net/url"
	"strings"
	"unicode"
)

const qureColor = "https://fastly.jsdelivr.net/gh/Koolson/Qure@master/IconSet/Color/"

// clashIcons maps the source group name to an icon URL.
// FlClash reads proxy-groups.icon. Quantumult X and Shadowrocket append the same
// URL as img-url. All three clients drop the emoji from the policy name.
var clashIcons = map[string]string{
	"🚀 默认代理":        qure("Proxy.png"),
	"🤖 AI":          qure("AI.png"),
	"🚫 广告拦截":        qure("Advertising.png"),
	"📹 YouTube":     qure("YouTube.png"),
	"🍀 Google":      qure("Google.png"),
	"📲 Telegram":    qure("Telegram.png"),
	"🐦 Twitter":     qure("Twitter.png"),
	"💬 Discord":     qure("Discord.png"),
	"📱 WhatsApp":    "https://fastly.jsdelivr.net/gh/Homarr-Labs/dashboard-icons@master/png/whatsapp.png",
	"🎥 NETFLIX":     qure("Netflix.png"),
	"🏰 Disney+":     qure("Disney+.png"),
	"🎧 Spotify":     qure("Spotify.png"),
	"🟣 Twitch":      qure("Twitch.png"),
	"📺 Bahamut":     qure("Bahamut.png"),
	"🎵 TikTok":      qure("TikTok.png"),
	"🌍 国外媒体":        qure("ForeignMedia.png"),
	"📺 哔哩哔哩":        qure("bilibili.png"),
	"🌏 国内媒体":        qure("DomesticMedia.png"),
	"🪟 Microsoft":   qure("Microsoft.png"),
	"🐬 OneDrive":    qure("OneDrive.png"),
	"🍎 Apple":       qure("Apple.png"),
	"👨‍💻 GitHub":    qure("GitHub.png"),
	"🐳 Docker":      "https://fastly.jsdelivr.net/gh/Homarr-Labs/dashboard-icons@master/png/docker.png",
	"📦 Dev PKG":     qure("Lab.png"),
	"☁️ Cloudflare": qure("Cloudflare.png"),
	"❗ Yahoo":       qure("Yahoo.png"),
	"✨ Bangumi":     qure("Bookpedia.png"),
	"💶 PayPal":      qure("PayPal.png"),
	"🎮 Steam":       qure("Steam.png"),
	"🔵 PlayStation": qure("PlayStation.png"),
	"🟢 Xbox":        qure("Xbox.png"),
	"🔴 Nintendo":    qure("Nintendo.png"),
	"⬇️ 下载":         qure("Download.png"),
	"🏠 国内CDN":       qure("Domestic.png"),
	"💬 国内社交":        qure("WeChat.png"),
	"🕹️ 国内游戏":       qure("Game.png"),
	"🐟 漏网之鱼":        qure("Final.png"),
	"🎯 全球直连":        qure("Direct.png"),
	"🇭🇰 香港节点":       qure("Hong_Kong.png"),
	"🇯🇵 日本节点":       qure("Japan.png"),
	"🇹🇼 台湾节点":       qure("Taiwan.png"),
	"🇸🇬 狮城节点":       qure("Singapore.png"),
	"🇺🇲 美国节点":       qure("United_States.png"),
	"🌐 全部节点":        qure("Global.png"),
	"♻️ 自动选择":       qure("Auto.png"),
	"♻️ 香港自动":       qure("Hong_Kong.png"),
	"♻️ 日本自动":       qure("Japan.png"),
	"♻️ 台湾自动":       qure("Taiwan.png"),
	"♻️ 狮城自动":       qure("Singapore.png"),
	"♻️ 美国自动":       qure("United_States.png"),
	"🔯 故障转移":        qure("Available.png"),
	"🔯 香港故转":        qure("Hong_Kong.png"),
	"🔯 日本故转":        qure("Japan.png"),
	"🔯 台湾故转":        qure("Taiwan.png"),
	"🔯 狮城故转":        qure("Singapore.png"),
	"🔯 美国故转":        qure("United_States.png"),
}

func qure(file string) string {
	// PathEscape leaves '+'. Some clients treat that as a space, so Disney+.png would miss.
	return qureColor + strings.ReplaceAll(url.PathEscape(file), "+", "%2B")
}

func clashIcon(name string) string {
	return clashIcons[name]
}

// clashName drops a leading emoji from a policy label.
func clashName(name string) string {
	if name == "DIRECT" || name == "REJECT" {
		return name
	}
	label := strings.TrimLeftFunc(name, func(r rune) bool {
		return !unicode.IsLetter(r) && !unicode.IsDigit(r)
	})
	label = strings.TrimSpace(label)
	if label == "" {
		return name
	}
	return label
}

func requireClashIcons(cfg Config) error {
	for _, group := range cfg.Groups {
		if clashIcon(group.Name) == "" {
			return fmt.Errorf("缺少 Clash 图标: %s", group.Name)
		}
	}
	return nil
}
