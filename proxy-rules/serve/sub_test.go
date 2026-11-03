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
	if err := store.Delete(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"); err != nil {
		t.Fatal(err)
	}
	if _, err := store.Get(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"); !IsNotFound(err) {
		t.Fatalf("deleted %v", err)
	}
	if err := store.Delete(nil, "subs/qx/aaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa"); err != nil {
		t.Fatal(err)
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
  var spec = {"exclude":"到期","groups":[{"name":"AI","type":"select","icon":"https://example.com/ai.png","proxies":["日本节点","DIRECT"]},{"name":"日本节点","type":"select","regex":"(日本|JP)"},{"name":"自动选择","type":"url-test","regex":".*","url":"http://www.gstatic.com/generate_204","interval":300,"tolerance":50}],"rules":[{"kind":"url","group":"AI","url":"https://example.com/ai.list"},{"kind":"final","group":"漏网之鱼"}]};
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
	if len(doc.Rules) == 0 || doc.Rules[0] != "DOMAIN-SUFFIX,openai.com,AI" || doc.Rules[len(doc.Rules)-1] != "MATCH,漏网之鱼" {
		t.Fatalf("rules %#v", doc.Rules)
	}
	if doc.ProxyGroups[0]["icon"] != "https://example.com/ai.png" {
		t.Fatalf("icon %#v", doc.ProxyGroups[0]["icon"])
	}
	if strings.Contains(got, "allow-lan: true") {
		t.Fatal("lan opened")
	}
}

func TestSpacedQuantumultXFeedsThreeClients(t *testing.T) {
	body := "[dns]\nno-system\nserver=223.5.5.5\n[server_local]\n" +
		"trojan = example.com:443, password=secret, over-tls=true, tls-host=edge.example, udp-relay=true, tls-verification=false, tag=日本 01\n" +
		"shadowsocks = 1.2.3.4:8443, method=aes-128-gcm, password=secret, tag=大阪\n"
	local, remote, dns := NodesForQuantumultX(body)
	if len(local) != 2 || len(remote) != 0 {
		t.Fatalf("local %#v remote %#v", local, remote)
	}
	if !strings.HasPrefix(local[0], "trojan = example.com:443,") || !strings.Contains(local[0], "tls-verification=false") || !strings.Contains(local[0], "tag=日本 01") {
		t.Fatalf("qx trojan %#v", local[0])
	}
	if !strings.HasPrefix(local[1], "shadowsocks = 1.2.3.4:8443,") {
		t.Fatalf("qx ss %#v", local[1])
	}
	joined := strings.Join(dns, "\n")
	if !strings.Contains(joined, "no-system") || !strings.Contains(joined, "server=223.5.5.5") {
		t.Fatalf("dns %#v", dns)
	}

	sr, srDNS := NodesForShadowrocket(body)
	if len(sr) != 2 || !strings.Contains(sr[0], "日本 01 = trojan, example.com, 443") || !strings.Contains(sr[0], "password=secret") || !strings.Contains(sr[0], "sni=edge.example") || !strings.Contains(sr[0], "skip-cert-verify=true") || !strings.Contains(sr[0], "udp-relay=true") {
		t.Fatalf("sr %#v", sr)
	}
	if !strings.Contains(sr[1], "大阪 = ss, 1.2.3.4, 8443") {
		t.Fatalf("sr ss %#v", sr[1])
	}
	if !strings.Contains(srDNS, "223.5.5.5") {
		t.Fatalf("sr dns %q", srDNS)
	}

	proxies, remotes, clashDNS := ClashNodes(body)
	if len(proxies) != 2 || len(remotes) != 0 {
		t.Fatalf("clash %#v remotes %#v", proxies, remotes)
	}
	got := proxies[0]
	if got["type"] != "trojan" || got["server"] != "example.com" || got["password"] != "secret" || got["sni"] != "edge.example" || got["skip-cert-verify"] != true || got["udp"] != true {
		t.Fatalf("clash trojan %#v", got)
	}
	if proxies[1]["type"] != "ss" || proxies[1]["server"] != "1.2.3.4" {
		t.Fatalf("clash ss %#v", proxies[1])
	}
	names, _ := clashDNS["nameserver"].([]string)
	if len(names) != 1 || names[0] != "223.5.5.5" {
		t.Fatalf("clash dns %#v", clashDNS)
	}

	clash := "proxies:\n  - {name: 日本, type: trojan, server: example.com, port: 443, password: secret, sni: edge.example, skip-cert-verify: true, udp: true}\n"
	back, _, _ := NodesForQuantumultX(clash)
	if len(back) != 1 || !strings.Contains(back[0], "trojan=example.com:443") || !strings.Contains(back[0], "tls-verification=false") || !strings.Contains(back[0], "tag=日本") {
		t.Fatalf("back %#v", back)
	}
	srBack, _ := NodesForShadowrocket(clash)
	if len(srBack) != 1 || !strings.Contains(srBack[0], "skip-cert-verify=true") {
		t.Fatalf("sr back %#v", srBack)
	}
}

func TestQuantumultXKeepsSubscriptionDNS(t *testing.T) {
	body := "[dns]\n" +
		"no-system\n" +
		"server=223.5.5.5\n" +
		"server=10.0.0.1\n" +
		"server=/*.example.com/1.1.1.1\n" +
		"server=/example.com/system\n" +
		"doh-server=https://dns.alidns.com/dns-query, https://doh.pub/dns-query\n" +
		"alias=/dns.example/doh.example\n" +
		"alias=not a host\n" +
		"[server_local]\n" +
		"trojan = example.com:443, password=secret, tag=日本\n"
	_, _, dns := NodesForQuantumultX(body)
	joined := strings.Join(dns, "\n")
	for _, want := range []string{
		"no-system",
		"server=223.5.5.5",
		"server=/*.example.com/1.1.1.1",
		"server=/example.com/system",
		"doh-server=https://dns.alidns.com/dns-query, https://doh.pub/dns-query",
		"alias=/dns.example/doh.example",
	} {
		if !strings.Contains(joined, want) {
			t.Fatalf("missing %s\n%#v", want, dns)
		}
	}
	if strings.Contains(joined, "10.0.0.1") || strings.Contains(joined, "not a host") {
		t.Fatalf("kept unsafe dns %#v", dns)
	}
}

func TestClashNameserverPolicyIsMapping(t *testing.T) {
	resetFetch(t)
	t.Setenv("RULES_FLCLASH_URL", "https://example.com/flclash.js")
	FetchText = func(_ context.Context, raw string) (string, error) {
		switch raw {
		case "https://example.com/flclash.js":
			return `function main(config) {
  var spec = {"groups":[{"name":"漏网之鱼","type":"select","proxies":["DIRECT"]}],"rules":[{"kind":"final","group":"漏网之鱼"}]};
  return config;
}
`, nil
		default:
			t.Fatalf("unexpected %s", raw)
			return "", nil
		}
	}
	body := "[dns]\nserver=/*.example.com/1.1.1.1\n[server_local]\nshadowsocks=example.com:443, method=aes-128-gcm, password=secret, tag=日本\n"
	got, err := BuildClash(t.Context(), body)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(got, "map[") {
		t.Fatalf("nameserver-policy was written as text\n%s", dnsSection(got))
	}
	var root yaml.Node
	if err := yaml.Unmarshal([]byte(got), &root); err != nil {
		t.Fatal(err)
	}
	policy := findMapping(root.Content[0], "dns", "nameserver-policy")
	if policy == nil || policy.Kind != yaml.MappingNode {
		kind := 0
		if policy != nil {
			kind = int(policy.Kind)
		}
		t.Fatalf("pipeline must contain YAML mapping, has %d\n%s", kind, dnsSection(got))
	}
	var decoded map[string]string
	if err := policy.Decode(&decoded); err != nil {
		t.Fatal(err)
	}
	if decoded["example.com"] != "1.1.1.1" {
		t.Fatalf("policy %#v", decoded)
	}
}

func dnsSection(body string) string {
	start := strings.Index(body, "dns:\n")
	if start < 0 {
		return body
	}
	rest := body[start:]
	if end := strings.Index(rest, "\nproxies:"); end >= 0 {
		return rest[:end]
	}
	return rest
}

func findMapping(node *yaml.Node, keys ...string) *yaml.Node {
	current := node
	for _, key := range keys {
		if current == nil || current.Kind != yaml.MappingNode {
			return nil
		}
		var next *yaml.Node
		for i := 0; i+1 < len(current.Content); i += 2 {
			if current.Content[i].Value == key {
				next = current.Content[i+1]
				break
			}
		}
		current = next
	}
	return current
}

func TestStripEmojiFromNodeNames(t *testing.T) {
	if cleanName("🇯🇵 Japan | 01") != "Japan | 01" || cleanName("香港-1") != "香港-1" || cleanName("⚡️HK 01") != "HK 01" {
		t.Fatalf("cleanName %q %q %q", cleanName("🇯🇵 Japan | 01"), cleanName("香港-1"), cleanName("⚡️HK 01"))
	}
	body := "[server_local]\n" +
		"trojan=example.com:443, password=secret, tag=🇯🇵 Japan | 01\n" +
		"trojan=example.com:443, password=secret, tag=🇯🇵 Japan | 01\n" +
		"trojan=example.com:443, password=secret, tag=香港-1\n"
	local, _, _ := NodesForQuantumultX(body)
	if len(local) != 3 || !strings.Contains(local[0], "tag=Japan | 01") || strings.Contains(local[0], "🇯🇵") || !strings.HasSuffix(local[1], "tag=Japan | 01 2") || !strings.Contains(local[2], "tag=香港-1") {
		t.Fatalf("qx tags %v", local)
	}
	proxies, _ := NodesForShadowrocket("[Proxy]\n🇯🇵 Japan | 01 = trojan, example.com, 443, password=secret\n")
	if len(proxies) != 1 || !strings.HasPrefix(proxies[0], "Japan | 01 = trojan,") || strings.Contains(proxies[0], "🇯🇵") {
		t.Fatalf("sr %v", proxies)
	}
}

func TestEnsureQXUDPRelay(t *testing.T) {
	cases := []struct{ in, want string }{
		{"shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, tag=A", "shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, udp-relay=true, tag=A"},
		{"trojan = example.com:443, password=pwd, over-tls=true, tag=B", "trojan = example.com:443, password=pwd, over-tls=true, udp-relay=true, tag=B"},
		{"vless=example.com:443, method=none, password=id, obfs=over-tls", "vless=example.com:443, method=none, password=id, obfs=over-tls, udp-relay=true"},
		{"vmess=example.com:443, method=none, password=id, udp-relay=false, tag=C", "vmess=example.com:443, method=none, password=id, udp-relay=false, tag=C"},
		{"http=example.com:80, username=u, password=p, tag=D", "http=example.com:80, username=u, password=p, tag=D"},
		{"socks5=example.com:80, tag=E", "socks5=example.com:80, tag=E"},
		{"shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, obfs=tls1.2_ticket_fastauth, tag=F", "shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, obfs=tls1.2_ticket_fastauth, tag=F"},
	}
	for _, c := range cases {
		if got := ensureQXUDPRelay(c.in); got != c.want {
			t.Errorf("ensureQXUDPRelay(%q)\n got %q\nwant %q", c.in, got, c.want)
		}
	}
}

func TestQXUDPRelayForConvertedNodes(t *testing.T) {
	uris := "ss://YWVzLTEyOC1nY206cHdk@example.com:443#SS\n" +
		"trojan://pwd@example.com:443?sni=edge.example#TR\n" +
		"vless://11111111-1111-1111-1111-111111111111@example.com:443?security=tls&sni=edge.example#VL\n"
	local, _, _ := NodesForQuantumultX(uris)
	if len(local) != 3 {
		t.Fatalf("want 3 nodes, got %d: %v", len(local), local)
	}
	for _, line := range local {
		if !strings.Contains(line, "udp-relay=true") {
			t.Errorf("missing udp-relay=true: %s", line)
		}
	}

	clash := "proxies:\n" +
		"  - {name: On, type: trojan, server: example.com, port: 443, password: pwd, udp: true}\n" +
		"  - {name: Off, type: trojan, server: example.com, port: 443, password: pwd, udp: false}\n" +
		"  - {name: Unset, type: ss, server: example.com, port: 443, cipher: aes-128-gcm, password: pwd}\n" +
		"  - {name: Web, type: http, server: example.com, port: 80}\n"
	local, _, _ = NodesForQuantumultX(clash)
	got := map[string]bool{}
	for _, line := range local {
		tag := line[strings.LastIndex(line, "tag=")+4:]
		got[tag] = strings.Contains(line, "udp-relay=true")
	}
	want := map[string]bool{"On": true, "Off": false, "Unset": true, "Web": false}
	for tag, on := range want {
		if v, ok := got[tag]; !ok || v != on {
			t.Errorf("%s: udp-relay=true is %v, want %v (lines %v)", tag, v, on, local)
		}
	}
}
