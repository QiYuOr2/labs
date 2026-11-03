package rules

import (
	"strings"
	"testing"
)

func TestClashDNSBaseIsFakeIP(t *testing.T) {
	dns := ClashDNSBase()
	if dns["enable"] != true || dns["enhanced-mode"] != "fake-ip" || dns["fake-ip-range"] != "198.18.0.1/16" {
		t.Fatalf("dns %#v", dns)
	}
	if dns["respect-rules"] != true || dns["fake-ip-filter-mode"] != "blacklist" {
		t.Fatalf("dns mode %#v", dns)
	}
	if _, ok := dns["prefer-h3"]; ok {
		t.Fatal("prefer-h3 is set; the dns docs say not to combine it with respect-rules")
	}
	for _, key := range []string{"nameserver", "fallback", "default-nameserver", "proxy-server-nameserver", "direct-nameserver"} {
		for _, server := range dns[key].([]string) {
			if server == "system" || strings.HasPrefix(server, "dhcp://") {
				t.Fatalf("%s uses %s", key, server)
			}
		}
	}
	policy := dns["nameserver-policy"].(map[string]string)
	if policy["geosite:cn"] != clashAliDoH || policy["geosite:geolocation-!cn"] != clashCFDoH {
		t.Fatalf("policy %#v", policy)
	}
	for _, filter := range dns["fake-ip-filter"].([]string) {
		if strings.Contains(strings.ToLower(filter), "stun") {
			t.Fatalf("fake-ip-filter contains %s", filter)
		}
	}
	tun := ClashTun()
	if tun["enable"] != true || tun["stack"] != "mixed" || tun["dns-mode"] != "hijack" {
		t.Fatalf("tun %#v", tun)
	}
	hijack := tun["dns-hijack"].([]string)
	if len(hijack) != 2 || hijack[0] != "any:53" || hijack[1] != "tcp://any:53" {
		t.Fatalf("dns-hijack %#v", hijack)
	}
	if _, ok := tun["device"]; ok {
		t.Fatal("tun device is set")
	}
	if _, ok := tun["auto-redirect"]; ok {
		t.Fatal("auto-redirect is set")
	}
}

func TestClashStunRulesStayOffDirect(t *testing.T) {
	rules := ClashStunRules()
	if len(rules) != 7 || rules[0] != "DOMAIN-KEYWORD,stun,默认代理" {
		t.Fatalf("%#v", rules)
	}
	for _, port := range clashStunPorts {
		if !containsString(rules, "AND,((NETWORK,UDP),(DST-PORT,"+port+")),默认代理") {
			t.Fatalf("missing proxy rule for %s in %#v", port, rules)
		}
		if !containsString(rules, "AND,((NETWORK,UDP),(DST-PORT,"+port+")),REJECT") {
			t.Fatalf("missing reject rule for %s in %#v", port, rules)
		}
	}
	for _, rule := range rules {
		if strings.Contains(rule, ",DIRECT") {
			t.Fatalf("stun rule %s", rule)
		}
	}
}

func TestClashUDPCapable(t *testing.T) {
	for _, typ := range []string{"ss", "ssr", "vmess", "vless", "trojan", "hysteria", "hysteria2", "hy2", "tuic", "anytls", "wireguard", "socks5"} {
		if !ClashUDPCapable(typ) {
			t.Fatalf("%s should carry udp", typ)
		}
	}
	for _, typ := range []string{"http", "https", "direct", ""} {
		if ClashUDPCapable(typ) {
			t.Fatalf("%s should not gain udp", typ)
		}
	}
}

func TestFlClashHelpersMatchGoData(t *testing.T) {
	body := FlClashHelpers()
	if strings.Count(body, "function applyLeakFixes") != 1 {
		t.Fatal("applyLeakFixes")
	}
	if strings.Contains(body, `"system"`) || strings.Contains(body, "dhcp://") {
		t.Fatal("helper points DNS at the system resolver")
	}
	for _, rule := range ClashStunRules() {
		if !strings.Contains(body, strconvQuote(rule)) {
			t.Fatalf("helper missing %s", rule)
		}
	}
	if !strings.Contains(body, `"enhanced-mode": "fake-ip"`) || !strings.Contains(body, `"198.18.0.1/16"`) {
		t.Fatal("helper dns")
	}
	if strings.Contains(body, "const ") || strings.Contains(body, "=>") {
		t.Fatal("helper is not ES5")
	}
}

func containsString(items []string, want string) bool {
	for _, item := range items {
		if item == want {
			return true
		}
	}
	return false
}

func strconvQuote(value string) string {
	return `"` + value + `"`
}
