package handler

import (
	"context"
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
	t.Cleanup(func() {
		fetchText = orig
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
	if !strings.Contains(rec.Body.String(), "vmess=example.com:443") || !strings.Contains(rec.Body.String(), "no-ipv6") {
		t.Fatalf("body:\n%s", rec.Body.String())
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
