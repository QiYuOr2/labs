package rules

import (
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// Clash / mihomo field names follow the config reference:
// https://wiki.metacubex.one/config/dns/
// https://wiki.metacubex.one/config/inbound/tun/
// https://wiki.metacubex.one/config/rules/

const clashStunPolicy = "默认代理"

const (
	clashAliDoH    = "https://dns.alidns.com/dns-query"
	clashPubDoH    = "https://doh.pub/dns-query"
	clashCFDoH     = "https://1.1.1.1/dns-query"
	clashGoogleDoH = "https://dns.google/dns-query"
)

// clashUDPTypes are mihomo proxy types that can carry UDP.
// http and https are not in this list. socks5 is, because mihomo's socks5
// outbound speaks UDP when udp is true.
var clashUDPTypes = []string{
	"anytls",
	"hy2",
	"hysteria",
	"hysteria2",
	"socks5",
	"ss",
	"ssr",
	"trojan",
	"tuic",
	"vless",
	"vmess",
	"wireguard",
}

// Ports used by STUN and WebRTC. 3478 is TURN/STUN, 19302 is the common
// WebRTC STUN port, 5349 is STUN/TURN over TLS.
var clashStunPorts = []string{"3478", "19302", "5349"}

// Addresses that must keep a real answer: LAN names, captive-portal checks,
// and time sync. STUN names are intentionally absent so they stay inside
// fake-ip and follow the routing rules.
var clashFakeIPFilter = []string{
	"*.lan",
	"*.local",
	"*.localhost",
	"localhost",
	"*.home.arpa",
	"*.localdomain",
	"captive.apple.com",
	"*.msftconnecttest.com",
	"*.msftncsi.com",
	"www.msftconnecttest.com",
	"connectivitycheck.gstatic.com",
	"connectivitycheck.platform.hicloud.com",
	"connectivitycheck.platform.hihonorcloud.com",
	"detectportal.firefox.com",
	"time.apple.com",
	"time1.apple.com",
	"time2.apple.com",
	"time3.apple.com",
	"time4.apple.com",
	"time5.apple.com",
	"time6.apple.com",
	"time7.apple.com",
	"time.windows.com",
	"time.nist.gov",
	"pool.ntp.org",
	"*.pool.ntp.org",
	"ntp.aliyun.com",
	"ntp.tencent.com",
}

// ClashUDPCapable reports whether a Clash proxy type can carry UDP.
func ClashUDPCapable(typ string) bool {
	typ = strings.ToLower(strings.TrimSpace(typ))
	for _, item := range clashUDPTypes {
		if item == typ {
			return true
		}
	}
	return false
}

// ClashStunRules returns rules that keep STUN off DIRECT.
// The proxy rules come first. mihomo keeps matching a UDP flow when the
// chosen proxy has no udp support, so the same ports then go to REJECT
// instead of falling through to GEOIP,CN,DIRECT or MATCH.
func ClashStunRules() []string {
	out := []string{"DOMAIN-KEYWORD,stun," + clashStunPolicy}
	for _, port := range clashStunPorts {
		out = append(out, "AND,((NETWORK,UDP),(DST-PORT,"+port+")),"+clashStunPolicy)
	}
	for _, port := range clashStunPorts {
		out = append(out, "AND,((NETWORK,UDP),(DST-PORT,"+port+")),REJECT")
	}
	return out
}

// ClashDNSBase is the DNS block written into Clash profiles and the FlClash
// override. It replaces whatever the subscription shipped, including a
// system resolver. Subscription IP policies are layered on later.
func ClashDNSBase() map[string]any {
	policy := map[string]string{
		"geosite:cn":              clashAliDoH,
		"geosite:private":         clashAliDoH,
		"geosite:geolocation-!cn": clashCFDoH,
	}
	return map[string]any{
		"enable":                          true,
		"listen":                          "0.0.0.0:1053",
		"ipv6":                            false,
		"enhanced-mode":                   "fake-ip",
		"fake-ip-range":                   "198.18.0.1/16",
		"fake-ip-filter-mode":             "blacklist",
		"fake-ip-filter":                  append([]string(nil), clashFakeIPFilter...),
		"respect-rules":                   true,
		"use-hosts":                       true,
		"use-system-hosts":                true,
		"default-nameserver":              []string{"223.5.5.5", "119.29.29.29"},
		"nameserver":                      []string{clashAliDoH, clashPubDoH},
		"proxy-server-nameserver":         []string{clashAliDoH, clashPubDoH},
		"direct-nameserver":               []string{clashAliDoH, clashPubDoH},
		"fallback":                        []string{clashCFDoH, clashGoogleDoH},
		"direct-nameserver-follow-policy": false,
		"fallback-filter": map[string]any{
			"geoip":      true,
			"geoip-code": "CN",
		},
		"nameserver-policy": policy,
	}
}

// ClashTun is the TUN block. device is left unset because macOS only accepts
// a utun name and FlClash picks the interface itself. auto-redirect is
// Linux-only and is also left unset.
func ClashTun() map[string]any {
	return map[string]any{
		"enable":                true,
		"stack":                 "mixed",
		"auto-route":            true,
		"auto-detect-interface": true,
		"strict-route":          true,
		"dns-hijack":            []string{"any:53", "tcp://any:53"},
		"dns-mode":              "hijack",
		"route-exclude-address": []string{
			"192.168.0.0/16",
			"10.0.0.0/8",
			"172.16.0.0/12",
			"127.0.0.0/8",
		},
	}
}

// FlClashHelpers is the ES5 tail appended after buildGroup. expandFlClash
// keeps that tail, so the leak fixes survive the rewritten main().
func FlClashHelpers() string {
	var b strings.Builder
	b.WriteString("// fake-ip、tun 和 STUN。main 每次都调用，订阅里原来的 dns 会被换掉。\n")
	b.WriteString("function applyLeakFixes(config) {\n")
	b.WriteString("  config.ipv6 = false;\n")
	b.WriteString("  config.dns = clashDNS();\n")
	b.WriteString("  config.tun = clashTUN(config.tun);\n")
	b.WriteString("  enableProxyUDP(config.proxies);\n")
	b.WriteString("  enableProviderUDP(config[\"proxy-providers\"]);\n")
	b.WriteString("  var rules = [];\n")
	b.WriteString("  if (config.rules && config.rules.length) {\n")
	b.WriteString("    rules = dropStunRules(config.rules);\n")
	b.WriteString("  }\n")
	b.WriteString("  var stun = stunRules();\n")
	b.WriteString("  var merged = [];\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < stun.length; i++) {\n")
	b.WriteString("    merged.push(stun[i]);\n")
	b.WriteString("  }\n")
	b.WriteString("  for (i = 0; i < rules.length; i++) {\n")
	b.WriteString("    merged.push(rules[i]);\n")
	b.WriteString("  }\n")
	b.WriteString("  config.rules = merged;\n")
	b.WriteString("}\n\n")
	b.WriteString("function enableProxyUDP(list) {\n")
	b.WriteString("  if (!list || !list.length) {\n")
	b.WriteString("    return;\n")
	b.WriteString("  }\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < list.length; i++) {\n")
	b.WriteString("    var item = list[i];\n")
	b.WriteString("    if (!item || typeof item.type !== \"string\") {\n")
	b.WriteString("      continue;\n")
	b.WriteString("    }\n")
	b.WriteString("    if (!udpCapable(item.type)) {\n")
	b.WriteString("      continue;\n")
	b.WriteString("    }\n")
	b.WriteString("    if (item.udp === false) {\n")
	b.WriteString("      continue;\n")
	b.WriteString("    }\n")
	b.WriteString("    item.udp = true;\n")
	b.WriteString("  }\n")
	b.WriteString("}\n\n")
	b.WriteString("function enableProviderUDP(providers) {\n")
	b.WriteString("  if (!providers || typeof providers !== \"object\") {\n")
	b.WriteString("    return;\n")
	b.WriteString("  }\n")
	b.WriteString("  var name;\n")
	b.WriteString("  for (name in providers) {\n")
	b.WriteString("    if (!Object.prototype.hasOwnProperty.call(providers, name)) {\n")
	b.WriteString("      continue;\n")
	b.WriteString("    }\n")
	b.WriteString("    var item = providers[name];\n")
	b.WriteString("    if (item && item.proxies) {\n")
	b.WriteString("      enableProxyUDP(item.proxies);\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("}\n\n")
	b.WriteString("function udpCapable(type) {\n")
	b.WriteString("  var types = ")
	capable := make(map[string]any, len(clashUDPTypes))
	for _, typ := range clashUDPTypes {
		capable[typ] = true
	}
	b.WriteString(jsValue(capable, 2))
	b.WriteString(";\n")
	b.WriteString("  return types[type] === true;\n")
	b.WriteString("}\n\n")
	b.WriteString("function clashDNS() {\n")
	b.WriteString("  return ")
	b.WriteString(jsValue(ClashDNSBase(), 2))
	b.WriteString(";\n")
	b.WriteString("}\n\n")
	b.WriteString("function clashTUN(existing) {\n")
	b.WriteString("  var base = ")
	b.WriteString(jsValue(ClashTun(), 2))
	b.WriteString(";\n")
	b.WriteString("  var out = {};\n")
	b.WriteString("  var key;\n")
	b.WriteString("  if (existing && typeof existing === \"object\") {\n")
	b.WriteString("    for (key in existing) {\n")
	b.WriteString("      if (Object.prototype.hasOwnProperty.call(existing, key)) {\n")
	b.WriteString("        out[key] = existing[key];\n")
	b.WriteString("      }\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("  for (key in base) {\n")
	b.WriteString("    if (Object.prototype.hasOwnProperty.call(base, key)) {\n")
	b.WriteString("      out[key] = base[key];\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("  return out;\n")
	b.WriteString("}\n\n")
	b.WriteString("function stunRules() {\n")
	b.WriteString("  return ")
	b.WriteString(jsValue(ClashStunRules(), 2))
	b.WriteString(";\n")
	b.WriteString("}\n\n")
	b.WriteString("function dropStunRules(rules) {\n")
	b.WriteString("  var stun = stunRules();\n")
	b.WriteString("  var drop = {};\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < stun.length; i++) {\n")
	b.WriteString("    drop[stun[i]] = true;\n")
	b.WriteString("  }\n")
	b.WriteString("  var out = [];\n")
	b.WriteString("  for (i = 0; i < rules.length; i++) {\n")
	b.WriteString("    if (!drop[rules[i]]) {\n")
	b.WriteString("      out.push(rules[i]);\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("  return out;\n")
	b.WriteString("}\n")
	return b.String()
}

func jsValue(value any, indent int) string {
	switch item := value.(type) {
	case bool:
		if item {
			return "true"
		}
		return "false"
	case string:
		return strconv.Quote(item)
	case []string:
		return jsStringList(item, indent)
	case map[string]string:
		mapped := make(map[string]any, len(item))
		for key, val := range item {
			mapped[key] = val
		}
		return jsMap(mapped, indent)
	case map[string]any:
		return jsMap(item, indent)
	default:
		panic(fmt.Sprintf("clash js value %T", value))
	}
}

func jsStringList(items []string, indent int) string {
	if len(items) == 0 {
		return "[]"
	}
	pad := strings.Repeat(" ", indent)
	inner := strings.Repeat(" ", indent+2)
	var b strings.Builder
	b.WriteString("[\n")
	for i, item := range items {
		b.WriteString(inner)
		b.WriteString(strconv.Quote(item))
		if i+1 != len(items) {
			b.WriteByte(',')
		}
		b.WriteByte('\n')
	}
	b.WriteString(pad)
	b.WriteByte(']')
	return b.String()
}

func jsMap(value map[string]any, indent int) string {
	if len(value) == 0 {
		return "{}"
	}
	keys := make([]string, 0, len(value))
	for key := range value {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	pad := strings.Repeat(" ", indent)
	inner := indent + 2
	var b strings.Builder
	b.WriteString("{\n")
	for i, key := range keys {
		b.WriteString(strings.Repeat(" ", inner))
		b.WriteString(strconv.Quote(key))
		b.WriteString(": ")
		b.WriteString(jsValue(value[key], inner))
		if i+1 != len(keys) {
			b.WriteByte(',')
		}
		b.WriteByte('\n')
	}
	b.WriteString(pad)
	b.WriteByte('}')
	return b.String()
}
