package rules

import (
	"strings"
	"testing"
)

func TestClientLeakGuards(t *testing.T) {
	root := moduleRoot(t)
	files, err := Render(root)
	if err != nil {
		t.Fatal(err)
	}
	qx := files[fileQuantumultX]
	for _, want := range []string{
		"fallback_udp_policy=reject",
		"dns_exclusion_list = ",
		"*.cmpassport.com",
		"captive.apple.com",
		"no-system",
		"no-ipv6",
		"prefer-doh3",
		"doh-server=" + DomesticDoH(),
		"host-keyword, stun, 默认代理",
		"final, 漏网之鱼",
	} {
		if !strings.Contains(qx, want) {
			t.Fatalf("QX missing %s", want)
		}
	}
	for _, line := range strings.Split(qx, "\n") {
		trimmed := strings.TrimSpace(line)
		if strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, ";") || strings.HasPrefix(trimmed, "//") {
			continue
		}
		if strings.HasPrefix(strings.ToLower(trimmed), "udp_drop_list") {
			t.Fatalf("QX set udp_drop_list: %s", trimmed)
		}
	}
	if strings.Contains(qx, "server=/") && strings.Contains(qx, "/system") {
		t.Fatal("QX bound a domain to system DNS")
	}
	stun := strings.Index(qx, "host-keyword, stun, 默认代理")
	final := strings.Index(qx, "final, 漏网之鱼")
	if stun < 0 || final < 0 || stun > final {
		t.Fatal("QX stun filter is not before final")
	}

	sr := files[fileShadowrocket]
	for _, want := range []string{
		"dns-server = " + DomesticDoH(),
		"direct-dns-server = " + DomesticDoH(),
		"fallback-dns-server = " + DomesticDoH(),
		"proxy-dns-server = " + DomesticDoH(),
		"dns-direct-system = false",
		"always-real-ip = false",
		"hijack-dns = true",
		"udp-policy-not-supported-behaviour = REJECT",
		"block-quic = all-proxy",
		"DOMAIN-KEYWORD,stun,默认代理",
		"AND,((PROTOCOL,UDP),(DST-PORT,3478)),默认代理",
		"AND,((PROTOCOL,UDP),(DST-PORT,19302)),默认代理",
		"AND,((PROTOCOL,UDP),(DST-PORT,5349)),默认代理",
		"AND,((PROTOCOL,UDP),(DST-PORT,3478)),REJECT-DROP",
		"AND,((PROTOCOL,UDP),(DST-PORT,19302)),REJECT-DROP",
		"AND,((PROTOCOL,UDP),(DST-PORT,5349)),REJECT-DROP",
		"GEOIP,CN,全球直连",
		"FINAL,漏网之鱼",
	} {
		if !strings.Contains(sr, want) {
			t.Fatalf("Shadowrocket missing %s", want)
		}
	}
	for _, banned := range []string{
		"dns-server = system",
		"fallback-dns-server = system",
		"stun-response-ip",
		"compatibility-mode",
	} {
		if strings.Contains(sr, banned) {
			t.Fatalf("Shadowrocket contains %s", banned)
		}
	}
	keyword := strings.Index(sr, "DOMAIN-KEYWORD,stun,默认代理")
	geo := strings.Index(sr, "GEOIP,CN,全球直连")
	end := strings.Index(sr, "FINAL,漏网之鱼")
	if keyword < 0 || geo < 0 || end < 0 || keyword > geo || geo > end {
		t.Fatal("Shadowrocket STUN rules are not before GEOIP and FINAL")
	}
}
