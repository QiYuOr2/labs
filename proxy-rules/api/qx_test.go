package handler

import (
	"context"
	"fmt"
	"net/http"
	"net/http/httptest"
	"path/filepath"
	"strings"
	"testing"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
)

const baseProfile = `# banner

[general]

[dns]

[policy]
static=🤖 AI, direct

[server_remote]

[server_local]

[filter_remote]
https://example.com/rules.list, tag=labs-01, force-policy=🎯 全球直连, update-interval=86400, opt-parser=true, enabled=true

[filter_local]
final, 🐟 漏网之鱼

[rewrite_remote]
https://example.com/ad.conf, tag=ad, update-interval=86400, opt-parser=false, enabled=true

[rewrite_local]

[mitm]
skip_validating_cert = true
hostname = -testflight.apple.com
`

func TestMergeQuantumultXKeepsRules(t *testing.T) {
	subscription := `
[dns]
no-ipv6
server=223.5.5.5
server=127.0.0.1
# comment
[policy]
static=bad, direct
[server_local]
shadowsocks=1.2.3.4:443, method=aes-128-gcm, password=secret, tag=日本 1
passphrase = hidden
[server_remote]
https://example.com/nodes, tag=extra, update-interval=86400, opt-parser=true, enabled=true
http://127.0.0.1/local, tag=bad, enabled=true
[mitm]
passphrase = hidden
p12 = hidden
hostname = evil.example
`
	got, err := MergeQuantumultX(baseProfile, subscription, "https://example.com/airport")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{
		"[dns]\nno-ipv6\nserver=223.5.5.5\n",
		"static=🤖 AI, direct",
		"shadowsocks=1.2.3.4:443, method=aes-128-gcm, password=secret, tag=日本 1",
		"https://example.com/nodes, tag=extra, update-interval=86400, opt-parser=true, enabled=true",
		"https://example.com/rules.list, tag=labs-01",
		"https://example.com/ad.conf, tag=ad",
		"hostname = -testflight.apple.com",
		"resource_parser_url=",
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("missing %q\n%s", want, got)
		}
	}
	for _, banned := range []string{"static=bad", "server=127.0.0.1", "127.0.0.1/local", "passphrase", "p12", "evil.example", "https://example.com/airport"} {
		if strings.Contains(got, banned) {
			t.Fatalf("kept %q\n%s", banned, got)
		}
	}
}

func TestMergeFallsBackToSubscriptionURL(t *testing.T) {
	subscription := `
dns:
  ipv6: false
  nameserver:
    - 223.5.5.5
    - https://dns.alidns.com/dns-query
    - 10.0.0.1
  nameserver-policy:
    '+.icloud.com': 119.29.29.29
proxies:
  - name: a
    type: ss
`
	got, err := MergeQuantumultX(baseProfile, subscription, "https://example.com/airport")
	if err != nil {
		t.Fatal(err)
	}
	for _, want := range []string{
		"no-ipv6",
		"server=223.5.5.5",
		"doh-server=https://dns.alidns.com/dns-query",
		"server=/*.icloud.com/119.29.29.29",
		"https://example.com/airport, tag=subscription, update-interval=86400, opt-parser=true, enabled=true",
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("missing %q\n%s", want, got)
		}
	}
	if strings.Contains(got, "10.0.0.1") || strings.Contains(got, "type=ss") {
		t.Fatalf("copied unsupported clash content\n%s", got)
	}
}

func TestMergeDecodesBase64Profile(t *testing.T) {
	encoded := "W2Ruc10Kbm8taXB2NgpzZXJ2ZXI9MjIzLjUuNS41Cgpbc2VydmVyX2xvY2FsXQp0cm9qYW49ZXhhbXBsZS5jb206NDQzLCBwYXNzd29yZD1zZWNyZXQsIHRhZz3ml6XmnKw="
	got, err := MergeQuantumultX(baseProfile, encoded, "https://example.com/airport")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(got, "trojan=example.com:443, password=secret, tag=日本") || !strings.Contains(got, "server=223.5.5.5") {
		t.Fatalf("decoded profile was not merged\n%s", got)
	}
	if strings.Contains(got, "tag=subscription") {
		t.Fatal("fallback remote added beside decoded nodes")
	}
}

func TestMergeRealProfile(t *testing.T) {
	root := filepath.Join("..")
	files, err := rules.Render(root)
	if err != nil {
		t.Fatal(err)
	}
	base := files["clients/quantumultx.conf"]
	got, err := MergeQuantumultX(base, "[dns]\nno-system\nserver=119.29.29.29\n", "https://example.com/airport")
	if err != nil {
		t.Fatal(err)
	}
	if !strings.Contains(got, "server=119.29.29.29") || !strings.Contains(got, "static=🤖 AI,") {
		t.Fatalf("real profile merge changed shape\n%s", got[:400])
	}
	if strings.Contains(got, "passphrase =") || strings.Contains(got, "p12 =") {
		t.Fatal("certificate material appeared")
	}
}

func TestScreenURL(t *testing.T) {
	rejected := []string{
		"",
		"ftp://example.com/a",
		"file:///etc/passwd",
		"https://localhost/a",
		"https://printer.local/a",
		"http://127.0.0.1/a",
		"http://10.1.2.3/a",
		"http://192.168.1.1/a",
		"http://169.254.169.254/latest",
		"http://[::1]/a",
		"http://100.64.0.1/a",
		"https://example.com/a,b",
	}
	for _, raw := range rejected {
		if err := ScreenURL(raw); err == nil {
			t.Fatalf("accepted %s", raw)
		}
	}
	if err := ScreenURL("https://example.com/airport?token=1"); err != nil {
		t.Fatal(err)
	}
}

func TestHandlerMerge(t *testing.T) {
	orig := fetchText
	resetRuleCache()
	t.Cleanup(func() {
		fetchText = orig
		resetRuleCache()
		profileMu.Lock()
		profileBody = ""
		profileAt = profileAt.Add(-timeHour)
		profileMu.Unlock()
	})
	t.Setenv("RULES_PROFILE_URL", "https://example.com/profile")
	fetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/profile":
			return baseProfile, nil
		case "https://example.com/rules.list":
			return "# comment\nDOMAIN-SUFFIX,example.com\nPROCESS-NAME,v2ray\nIP-CIDR,1.2.3.0/24,no-resolve\n", nil
		case "https://example.com/airport":
			return "[dns]\nno-ipv6\n[server_local]\nvmess=example.com:443, method=chacha20-ietf-poly1305, password=secret, tag=日本\n", nil
		default:
			t.Fatalf("unexpected fetch %s", raw)
			return "", nil
		}
	}
	req := httptest.NewRequest(http.MethodGet, "/api/qx?url=https%3A%2F%2Fexample.com%2Fairport", nil)
	rec := httptest.NewRecorder()
	Handler(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d body %s", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	if !strings.Contains(body, "vmess=example.com:443") || !strings.Contains(body, "no-ipv6") {
		t.Fatalf("body:\n%s", body)
	}
	if !strings.Contains(body, "HOST-SUFFIX,example.com,🎯 全球直连") || !strings.Contains(body, "IP-CIDR,1.2.3.0/24,🎯 全球直连,no-resolve") {
		t.Fatalf("rules were not inlined:\n%s", body)
	}
	if strings.Contains(body, "https://example.com/rules.list") || strings.Contains(body, "PROCESS-NAME") {
		t.Fatalf("remote filter or skipped rule remained:\n%s", body)
	}
	if !strings.Contains(body, "https://example.com/ad.conf") {
		t.Fatalf("rewrite remote was removed:\n%s", body)
	}
	if rec.Header().Get("Cache-Control") != "no-store" {
		t.Fatalf("cache header %q", rec.Header().Get("Cache-Control"))
	}

	rejected := httptest.NewRequest(http.MethodGet, "/api/qx?url=http%3A%2F%2F127.0.0.1%2Fa", nil)
	rec = httptest.NewRecorder()
	Handler(rec, rejected)
	if rec.Code != http.StatusBadRequest {
		t.Fatalf("private url status %d", rec.Code)
	}
}

const timeHour = 60 * 60 * 1e9

func TestExpandFiltersInlinesInOrder(t *testing.T) {
	resetRuleCache()
	t.Cleanup(resetRuleCache)
	orig := fetchText
	t.Cleanup(func() { fetchText = orig })
	profile := `
[filter_remote]
https://example.com/one.list, tag=labs-01, force-policy=🎯 全球直连, update-interval=86400, opt-parser=true, enabled=true
https://example.com/two.list, tag=labs-02, force-policy=🤖 AI, update-interval=86400, opt-parser=true, enabled=true
https://example.com/off.list, tag=labs-03, force-policy=🚫 广告拦截, enabled=false

[filter_local]
final, 🐟 漏网之鱼

[rewrite_remote]
https://example.com/ad.conf, tag=ad, enabled=true
`
	fetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/one.list":
			return "# c\nDOMAIN-SUFFIX,one.example # keep\nDOMAIN-SUFFIX,one.example\nPROCESS-NAME,v2ray\nIP-CIDR6,2001:db8::/32,no-resolve\nGEOIP,cn,DIRECT\n", nil
		case "https://example.com/two.list":
			return "DOMAIN,ai.example.com,DIRECT\nDOMAIN-KEYWORD,claude\n", nil
		default:
			t.Fatalf("unexpected fetch %s", raw)
			return "", nil
		}
	}
	got := expandFilters(context.Background(), profile)
	want := []string{
		expandedFilterBanner,
		"HOST-SUFFIX,one.example,🎯 全球直连",
		"IP6-CIDR,2001:db8::/32,🎯 全球直连,no-resolve",
		"GEOIP,CN,🎯 全球直连",
		"HOST,ai.example.com,🤖 AI",
		"HOST-KEYWORD,claude,🤖 AI",
		"final, 🐟 漏网之鱼",
		"https://example.com/ad.conf",
	}
	for i, item := range want {
		if !strings.Contains(got, item) {
			t.Fatalf("missing %q\n%s", item, got)
		}
		if i > 0 && strings.Index(got, want[i-1]) > strings.Index(got, item) {
			t.Fatalf("order broken at %q\n%s", item, got)
		}
	}
	if strings.Contains(got, "https://example.com/one.list") || strings.Contains(got, "PROCESS-NAME") || strings.Count(got, "HOST-SUFFIX,one.example") != 1 {
		t.Fatalf("filter remote leaked or duplicate kept\n%s", got)
	}
}

func TestExpandFiltersKeepsRemoteWhenOneListFails(t *testing.T) {
	resetRuleCache()
	t.Cleanup(resetRuleCache)
	orig := fetchText
	t.Cleanup(func() { fetchText = orig })
	profile := `
[filter_remote]
https://example.com/one.list, tag=labs-01, force-policy=🎯 全球直连, update-interval=86400, opt-parser=true, enabled=true
https://example.com/two.list, tag=labs-02, force-policy=🤖 AI, update-interval=86400, opt-parser=true, enabled=true

[filter_local]
final, 🐟 漏网之鱼
`
	fetchText = func(_ context.Context, raw string) (string, error) {
		if raw == "https://example.com/one.list" {
			return "DOMAIN-SUFFIX,one.example\n", nil
		}
		return "", fmt.Errorf("订阅下载失败")
	}
	got := expandFilters(context.Background(), profile)
	if strings.Contains(got, "HOST-SUFFIX,one.example") || strings.Contains(got, expandedFilterBanner) {
		t.Fatalf("partial inline reordered rules\n%s", got)
	}
	if !strings.Contains(got, "https://example.com/two.list") {
		t.Fatalf("remote rules were dropped\n%s", got)
	}
}

func TestExpandFiltersRejectsHTML(t *testing.T) {
	resetRuleCache()
	t.Cleanup(resetRuleCache)
	orig := fetchText
	t.Cleanup(func() { fetchText = orig })
	profile := `
[filter_remote]
https://example.com/rules.list, tag=labs-01, force-policy=🎯 全球直连, opt-parser=false, enabled=true

[filter_local]
final, 🐟 漏网之鱼
`
	fetchText = func(context.Context, string) (string, error) {
		return "<!DOCTYPE html><html></html>", nil
	}
	got := expandFilters(context.Background(), profile)
	if !strings.Contains(got, "https://example.com/rules.list") || strings.Contains(got, expandedFilterBanner) {
		t.Fatalf("html was inlined\n%s", got)
	}
}

func TestExpandRealProfile(t *testing.T) {
	resetRuleCache()
	t.Cleanup(resetRuleCache)
	orig := fetchText
	t.Cleanup(func() { fetchText = orig })
	files, err := rules.Render(filepath.Join(".."))
	if err != nil {
		t.Fatal(err)
	}
	base := files["clients/quantumultx.conf"]
	sections := splitSections(base)
	refs, ok := parseRemoteRefs(sections["filter_remote"])
	if !ok || len(refs) < 10 {
		t.Fatalf("refs %d ok %v", len(refs), ok)
	}
	fetchText = func(_ context.Context, raw string) (string, error) {
		for i, ref := range refs {
			if raw == ref.url {
				return fmt.Sprintf("DOMAIN-SUFFIX,u%d.example\nIP-CIDR,10.%d.0.0/16,no-resolve\n", i, i%200), nil
			}
		}
		t.Fatalf("unexpected fetch %s", raw)
		return "", nil
	}
	got := expandFilters(context.Background(), base)
	last := -1
	for i, ref := range refs {
		line := fmt.Sprintf("HOST-SUFFIX,u%d.example,%s", i, ref.policy)
		idx := strings.Index(got, line)
		if idx < 0 || idx < last {
			t.Fatalf("missing or unordered %s", line)
		}
		last = idx
	}
	for _, want := range []string{
		"static=🤖 AI,",
		"final, 🐟 漏网之鱼",
		"https://ddgksf2013.top/rewrite/StartUpAds.conf",
		"[server_remote]",
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("missing %s", want)
		}
	}
	if strings.Contains(got, "https://raw.githubusercontent.com/ACL4SSR/ACL4SSR/master/Clash/BanAD.list") {
		t.Fatal("filter remote remained")
	}
}
