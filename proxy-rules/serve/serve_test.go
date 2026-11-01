package serve

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

const sampleSR = `[General]
bypass-system = true
dns-server = system
update-url = https://example.com/old

[Proxy]

[Proxy Group]
🤖 AI = select,DIRECT

[Rule]
RULE-SET,https://example.com/one.list,🎯 全球直连
RULE-SET,https://example.com/two.list,🤖 AI
GEOIP,CN,🎯 全球直连
FINAL,🐟 漏网之鱼

[Host]
`

func TestExpandShadowrocketInlinesInOrder(t *testing.T) {
	resetFetch(t)
	FetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/one.list":
			return "# c\nDOMAIN-SUFFIX,one.example # keep\nDOMAIN-SUFFIX,one.example\nPROCESS-NAME,v2ray\nIP-CIDR,1.2.3.0/24,no-resolve\n", nil
		case "https://example.com/two.list":
			return "DOMAIN,ai.example,DIRECT\nDOMAIN-KEYWORD,claude\n", nil
		default:
			t.Fatalf("unexpected %s", raw)
			return "", nil
		}
	}
	got, ok := expandShadowrocket(context.Background(), sampleSR)
	if !ok {
		t.Fatal("not expanded")
	}
	want := []string{
		srBanner,
		"DOMAIN-SUFFIX,one.example,🎯 全球直连",
		"IP-CIDR,1.2.3.0/24,🎯 全球直连,no-resolve",
		"DOMAIN,ai.example,🤖 AI",
		"DOMAIN-KEYWORD,claude,🤖 AI",
		"GEOIP,CN,🎯 全球直连",
		"FINAL,🐟 漏网之鱼",
	}
	assertOrder(t, got, want)
	if strings.Contains(got, "https://example.com/one.list") || strings.Contains(got, "PROCESS-NAME") || strings.Count(got, "DOMAIN-SUFFIX,one.example,") != 1 {
		t.Fatalf("remote or skipped rule leaked\n%s", got)
	}
}

func TestExpandShadowrocketKeepsRemoteOnFailure(t *testing.T) {
	resetFetch(t)
	FetchText = func(_ context.Context, raw string) (string, error) {
		if raw == "https://example.com/one.list" {
			return "DOMAIN-SUFFIX,one.example\n", nil
		}
		return "", fmt.Errorf("订阅下载失败")
	}
	got, ok := expandShadowrocket(context.Background(), sampleSR)
	if ok || strings.Contains(got, "DOMAIN-SUFFIX,one.example") || strings.Contains(got, srBanner) {
		t.Fatalf("partial inline\n%s", got)
	}
	if !strings.Contains(got, "https://example.com/two.list") {
		t.Fatalf("remote dropped\n%s", got)
	}
}

func TestShadowrocketMergesProxyAndDNS(t *testing.T) {
	resetFetch(t)
	t.Setenv("RULES_SR_URL", "https://example.com/sr.conf")
	t.Setenv("RULES_PUBLIC_BASE", "https://proxy-rules.vercel.app")
	FetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/sr.conf":
			return sampleSR, nil
		case "https://example.com/one.list":
			return "DOMAIN-SUFFIX,one.example\n", nil
		case "https://example.com/two.list":
			return "DOMAIN-SUFFIX,two.example\n", nil
		case "https://example.com/airport":
			return "[General]\ndns-server = 223.5.5.5\ndns-server = 127.0.0.1\n[Proxy]\n日本 = ss, example.com, 443, encrypt-method=aes-128-gcm, password=secret\npassphrase = hidden\n[Rule]\nDOMAIN,evil.example,REJECT\n", nil
		default:
			t.Fatalf("unexpected %s", raw)
			return "", nil
		}
	}
	req := httptest.NewRequest(http.MethodGet, "/api/sr?url=https%3A%2F%2Fexample.com%2Fairport", nil)
	rec := httptest.NewRecorder()
	Shadowrocket(rec, req)
	if rec.Code != http.StatusOK {
		t.Fatalf("status %d %s", rec.Code, rec.Body.String())
	}
	body := rec.Body.String()
	for _, want := range []string{
		"DOMAIN-SUFFIX,one.example,🎯 全球直连",
		"日本 = ss, example.com, 443, encrypt-method=aes-128-gcm, password=secret",
		"[Proxy Group]\n🤖 AI = select,DIRECT",
		"dns-server = 223.5.5.5",
		"update-url = https://proxy-rules.vercel.app/api/sr?url=https%3A%2F%2Fexample.com%2Fairport",
		"[Host]",
	} {
		if !strings.Contains(body, want) {
			t.Fatalf("missing %s\n%s", want, body)
		}
	}
	if strings.Contains(body, "127.0.0.1") || strings.Contains(body, "evil.example") || strings.Contains(body, "passphrase") || strings.Contains(body, "https://example.com/one.list") {
		t.Fatalf("copied unwanted content\n%s", body)
	}
}

func TestExpandFlClashInlinesRules(t *testing.T) {
	resetFetch(t)
	script := `function main(config) {
  var spec = {"exclude":"到期","groups":[{"name":"🤖 AI","type":"select","proxies":["DIRECT"]}],"rules":[{"kind":"url","group":"🤖 AI","url":"https://example.com/ai.list"},{"kind":"geoip","group":"🎯 全球直连","param":"cn"},{"kind":"final","group":"🐟 漏网之鱼"}]};
  return config;
}
function buildGroup(group, exclude) {
  return { name: group.name, type: group.type, exclude: exclude };
}
`
	FetchText = func(_ context.Context, raw string) (string, error) {
		if raw != "https://example.com/ai.list" {
			t.Fatalf("unexpected %s", raw)
		}
		return "DOMAIN-SUFFIX,openai.com\nPROCESS-NAME,v2ray\n", nil
	}
	got, ok := expandFlClash(context.Background(), script)
	if !ok {
		t.Fatal("not expanded")
	}
	for _, want := range []string{
		flBanner,
		`"name":"🤖 AI"`,
		`"proxies":["DIRECT"]`,
		`config["rule-providers"] = {};`,
		`DOMAIN-SUFFIX,openai.com,🤖 AI`,
		`GEOIP,CN,🎯 全球直连`,
		`MATCH,🐟 漏网之鱼`,
		"function buildGroup",
	} {
		if !strings.Contains(got, want) {
			t.Fatalf("missing %s\n%s", want, got)
		}
	}
	if strings.Contains(got, "https://example.com/ai.list") || strings.Contains(got, "PROCESS-NAME") || strings.Contains(got, "rule.interval") {
		t.Fatalf("remote provider leaked\n%s", got)
	}
	ai := strings.Index(got, "DOMAIN-SUFFIX,openai.com,🤖 AI")
	geo := strings.Index(got, "GEOIP,CN,🎯 全球直连")
	final := strings.Index(got, "MATCH,🐟 漏网之鱼")
	if ai < 0 || ai > geo || geo > final {
		t.Fatal("rule order")
	}
}

func TestRealClientsKeepOrder(t *testing.T) {
	resetFetch(t)
	files, err := rules.Render(filepath.Join(".."))
	if err != nil {
		t.Fatal(err)
	}
	sr := files["clients/shadowrocket.conf"]
	sections := splitSections(sr)
	var urls []string
	var policies []string
	for _, line := range sections["rule"] {
		raw, policy, ok := ruleSet(strings.TrimSpace(line))
		if !ok {
			continue
		}
		urls = append(urls, raw)
		policies = append(policies, policy)
	}
	if len(urls) < 10 {
		t.Fatalf("urls %d", len(urls))
	}
	FetchText = func(_ context.Context, raw string) (string, error) {
		for i, u := range urls {
			if raw == u {
				return fmt.Sprintf("DOMAIN-SUFFIX,u%d.example\n", i), nil
			}
		}
		t.Fatalf("unexpected %s", raw)
		return "", nil
	}
	got, ok := expandShadowrocket(context.Background(), sr)
	if !ok {
		t.Fatal("sr not expanded")
	}
	last := -1
	for i, policy := range policies {
		line := fmt.Sprintf("DOMAIN-SUFFIX,u%d.example,%s", i, policy)
		idx := strings.Index(got, line)
		if idx < 0 || idx < last {
			t.Fatalf("sr order %s", line)
		}
		last = idx
	}
	if !strings.Contains(got, "GEOIP,CN,🎯 全球直连") || !strings.Contains(got, "FINAL,🐟 漏网之鱼") || strings.Contains(got, "https://raw.githubusercontent.com/ACL4SSR/") {
		t.Fatal("sr shape")
	}

	ResetCache()
	script := files["clients/flclash.js"]
	spec, err := parseSpec(script)
	if err != nil {
		t.Fatal(err)
	}
	var flURLs []string
	for _, rule := range spec.Rules {
		if rule.Kind == "url" {
			flURLs = append(flURLs, rule.URL)
		}
	}
	FetchText = func(_ context.Context, raw string) (string, error) {
		for i, u := range flURLs {
			if raw == u {
				return fmt.Sprintf("DOMAIN-SUFFIX,f%d.example\n", i), nil
			}
		}
		t.Fatalf("unexpected %s", raw)
		return "", nil
	}
	out, ok := expandFlClash(context.Background(), script)
	if !ok {
		t.Fatal("flclash not expanded")
	}
	last = -1
	n := 0
	for _, rule := range spec.Rules {
		if rule.Kind != "url" {
			continue
		}
		line := fmt.Sprintf("DOMAIN-SUFFIX,f%d.example,%s", n, rule.Group)
		idx := strings.Index(out, line)
		if idx < 0 || idx < last {
			t.Fatalf("fl order %s", line)
		}
		last = idx
		n++
	}
	if !strings.Contains(out, "MATCH,🐟 漏网之鱼") || strings.Contains(out, "rule-providers") && strings.Contains(out, "type\":\"http\"") {
		t.Fatal("fl shape")
	}
	if strings.Contains(out, "https://raw.githubusercontent.com/ACL4SSR/") {
		t.Fatal("fl remote remained")
	}
}

func TestScreenRejectsLocal(t *testing.T) {
	if err := Screen("http://127.0.0.1/a"); err == nil {
		t.Fatal("accepted local")
	}
	if err := Screen("https://example.com/airport?token=1"); err != nil {
		t.Fatal(err)
	}
}

func resetFetch(t *testing.T) {
	t.Helper()
	orig := FetchText
	ResetCache()
	t.Cleanup(func() {
		FetchText = orig
		ResetCache()
	})
}

func assertOrder(t *testing.T, body string, want []string) {
	t.Helper()
	prev := -1
	for _, item := range want {
		idx := strings.Index(body, item)
		if idx < 0 || idx < prev {
			t.Fatalf("missing or unordered %q\n%s", item, body)
		}
		prev = idx
	}
}

func TestParseListFixesCIDRFamily(t *testing.T) {
	rules, ok := ParseList("IP-CIDR6,113.248.172.245/32,no-resolve\nIP6-CIDR,2001:db8::/32\nIP-CIDR,2001:db8:1::/48\n")
	if !ok || len(rules) != 3 {
		t.Fatalf("%v %#v", ok, rules)
	}
	if rules[0].Type != "IP-CIDR" || rules[0].Value != "113.248.172.245/32" || !rules[0].NoResolve {
		t.Fatalf("v4 %#v", rules[0])
	}
	if rules[1].Type != "IP-CIDR6" || rules[1].Value != "2001:db8::/32" {
		t.Fatalf("v6 %#v", rules[1])
	}
	if rules[2].Type != "IP-CIDR6" || rules[2].Value != "2001:db8:1::/48" {
		t.Fatalf("relabel %#v", rules[2])
	}
}
