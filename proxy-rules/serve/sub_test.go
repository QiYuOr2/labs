package serve

import (
	"context"
	"strings"
	"testing"

	"gopkg.in/yaml.v3"
)

func TestQuantumultXKeepsNativeAndDropsPrivate(t *testing.T) {
	body := `
[dns]
no-ipv6
server=223.5.5.5
server=127.0.0.1
[server_local]
shadowsocks=1.2.3.4:443, method=aes-128-gcm, password=secret, tag=日本 1
passphrase = hidden
[server_remote]
https://example.com/nodes, tag=extra, update-interval=86400, opt-parser=true, enabled=true
http://127.0.0.1/local, tag=bad, enabled=true
`
	local, remote, dns := NodesForQuantumultX(body)
	if len(local) != 1 || !strings.Contains(local[0], "password=secret") {
		t.Fatalf("local %#v", local)
	}
	if len(remote) != 1 || !strings.Contains(remote[0], "https://example.com/nodes") {
		t.Fatalf("remote %#v", remote)
	}
	joined := strings.Join(dns, "\n")
	if !strings.Contains(joined, "server=223.5.5.5") || strings.Contains(joined, "127.0.0.1") {
		t.Fatalf("dns %#v", dns)
	}
}

func TestCrossFormatNodes(t *testing.T) {
	clash := `
proxies:
  - name: 日本
    type: ss
    server: example.com
    port: 443
    cipher: aes-128-gcm
    password: secret
    udp: true
dns:
  ipv6: false
  nameserver:
    - 223.5.5.5
    - 10.0.0.1
`
	local, _, dns := NodesForQuantumultX(clash)
	if len(local) != 1 || !strings.Contains(local[0], "shadowsocks=example.com:443") || !strings.Contains(local[0], "tag=日本") {
		t.Fatalf("qx %#v", local)
	}
	if strings.Contains(strings.Join(dns, "\n"), "10.0.0.1") || !strings.Contains(strings.Join(dns, "\n"), "no-ipv6") {
		t.Fatalf("dns %#v", dns)
	}
	sr, srDNS := NodesForShadowrocket(clash)
	if len(sr) != 1 || !strings.Contains(sr[0], "日本 = ss, example.com, 443") {
		t.Fatalf("sr %#v", sr)
	}
	if srDNS != "dns-server = 223.5.5.5" {
		t.Fatalf("sr dns %q", srDNS)
	}
	proxies, remotes, clashDNS := ClashNodes(clash)
	if len(proxies) != 1 || proxies[0]["name"] != "日本" || len(remotes) != 0 {
		t.Fatalf("clash %#v %v", proxies, remotes)
	}
	if _, ok := clashDNS["nameserver"]; !ok {
		t.Fatalf("clash dns %#v", clashDNS)
	}

	qx := "[server_local]\nvmess=example.com:443, method=chacha20-poly1305, password=11111111-1111-1111-1111-111111111111, obfs=wss, obfs-uri=/v, obfs-host=example.com, tag=东京\n"
	sr, _ = NodesForShadowrocket(qx)
	if len(sr) != 1 || !strings.Contains(sr[0], "东京 = vmess, example.com, 443") || !strings.Contains(sr[0], "ws=true") {
		t.Fatalf("vmess sr %#v", sr)
	}
	proxies, _, _ = ClashNodes(qx)
	if len(proxies) != 1 || proxies[0]["type"] != "vmess" || proxies[0]["network"] != "ws" {
		t.Fatalf("vmess clash %#v", proxies)
	}
}

func TestClashProviderBecomesRemote(t *testing.T) {
	body := `
proxy-providers:
  Airport:
    type: http
    url: https://example.com/sub
    interval: 86400
proxies:
  - {name: 直连, type: direct}
`
	local, remote, _ := NodesForQuantumultX(body)
	if len(local) != 0 || len(remote) != 1 || !strings.HasPrefix(remote[0], "https://example.com/sub,") {
		t.Fatalf("local %#v remote %#v", local, remote)
	}
	proxies, remotes, _ := ClashNodes(body)
	if len(proxies) != 0 || len(remotes) != 1 {
		t.Fatalf("proxies %#v remotes %#v", proxies, remotes)
	}
}

func TestURIList(t *testing.T) {
	body := "ss://YWVzLTEyOC1nY206c2VjcmV0@example.com:443#japan\n"
	local, _, _ := NodesForQuantumultX(body)
	if len(local) != 1 || !strings.Contains(local[0], "method=aes-128-gcm") || !strings.Contains(local[0], "password=secret") || !strings.Contains(local[0], "tag=japan") {
		t.Fatalf("%#v", local)
	}
}

func TestRejectsHTML(t *testing.T) {
	if !LooksLikeHTML("<!DOCTYPE html><html></html>") {
		t.Fatal("html accepted")
	}
	local, remote, _ := NodesForQuantumultX("<html>nope</html>")
	if len(local) != 0 || len(remote) != 0 {
		t.Fatal("html parsed as nodes")
	}
}

func TestMemoryStoreOverwrites(t *testing.T) {
	store := NewMemoryStore()
	if err := store.Put(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "one"); err != nil {
		t.Fatal(err)
	}
	if err := store.Put(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa", "two"); err != nil {
		t.Fatal(err)
	}
	got, err := store.Get(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa")
	if err != nil || got != "two" {
		t.Fatalf("%q %v", got, err)
	}
	if _, err := store.Get(nil, "missing"); !IsNotFound(err) {
		t.Fatalf("err %v", err)
	}
	path, err := SubPath("flclash", "0123456789abcdef0123456789abcdef")
	if err != nil || path != "subs/flclash/0123456789abcdef0123456789abcdef" {
		t.Fatalf("%s %v", path, err)
	}
	if ValidID("ABC") || ValidID("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzzzz") {
		t.Fatal("bad id accepted")
	}
}

func TestBuildClashKeepsManualAI(t *testing.T) {
	resetFetch(t)
	t.Setenv("RULES_FLCLASH_URL", "https://example.com/flclash.js")
	FetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/flclash.js":
			return `function main(config) {
  var spec = {"exclude":"到期","groups":[{"name":"🤖 AI","type":"select","proxies":["🇯🇵 日本节点","DIRECT"]},{"name":"🇯🇵 日本节点","type":"select","regex":"(日本|JP)"},{"name":"♻️ 自动选择","type":"url-test","regex":".*","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50}],"rules":[{"kind":"url","group":"🤖 AI","url":"https://example.com/ai.list"},{"kind":"final","group":"🐟 漏网之鱼"}]};
  return config;
}
function buildGroup(group, exclude) { return group; }
`, nil
		case "https://example.com/ai.list":
			return "DOMAIN-SUFFIX,openai.com\n", nil
		default:
			t.Fatalf("unexpected %s", raw)
			return "", nil
		}
	}
	body := "proxies:\n  - {name: 日本1, type: ss, server: example.com, port: 443, cipher: aes-128-gcm, password: secret}\n"
	got, err := BuildClash(t.Context(), body)
	if err != nil {
		t.Fatal(err)
	}
	var doc clashDocument
	if err := yaml.Unmarshal([]byte(got), &doc); err != nil {
		t.Fatal(err)
	}
	if doc.AllowLan || len(doc.Proxies) != 1 || doc.Proxies[0]["password"] != "secret" {
		t.Fatalf("doc %#v", doc)
	}
	ai := doc.ProxyGroups[0]
	joined := strings.Join(stringList(ai["proxies"]), ",")
	if strings.Contains(joined, "自动选择") || strings.Contains(joined, "故障转移") || !strings.Contains(joined, "日本节点") {
		t.Fatalf("ai %#v", ai)
	}
	if len(doc.Rules) == 0 || doc.Rules[0] != "DOMAIN-SUFFIX,openai.com,🤖 AI" || doc.Rules[len(doc.Rules)-1] != "MATCH,🐟 漏网之鱼" {
		t.Fatalf("rules %#v", doc.Rules)
	}
	if strings.Contains(got, "allow-lan: true") {
		t.Fatal("lan opened")
	}
}
