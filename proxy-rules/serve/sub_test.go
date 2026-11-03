package serve

import (
	"context"
	"encoding/base64"
	"strings"
	"testing"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
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
	stun := rules.ClashStunRules()
	if len(doc.Rules) < len(stun)+2 || strings.Join(doc.Rules[:len(stun)], "\n") != strings.Join(stun, "\n") {
		t.Fatalf("rules %#v", doc.Rules)
	}
	if doc.Rules[len(stun)] != "DOMAIN-SUFFIX,openai.com,AI" || doc.Rules[len(doc.Rules)-1] != "MATCH,漏网之鱼" {
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
	if decoded["geosite:cn"] == "" || decoded["geosite:geolocation-!cn"] == "" {
		t.Fatalf("policy %#v", decoded)
	}
	dns := root.Content[0]
	if got := findMapping(dns, "dns", "enhanced-mode"); got == nil || got.Value != "fake-ip" {
		t.Fatalf("enhanced-mode %#v", got)
	}
	if got := findMapping(dns, "dns", "respect-rules"); got == nil || got.Value != "true" {
		t.Fatalf("respect-rules %#v", got)
	}
	if got := findMapping(dns, "dns", "fake-ip-range"); got == nil || got.Value != "198.18.0.1/16" {
		t.Fatalf("fake-ip-range %#v", got)
	}
	for _, key := range []string{"nameserver", "fallback", "default-nameserver", "proxy-server-nameserver", "direct-nameserver"} {
		for _, server := range scalarList(findMapping(dns, "dns", key)) {
			if server == "system" || strings.HasPrefix(server, "dhcp://") {
				t.Fatalf("%s uses %s\n%s", key, server, dnsSection(got))
			}
		}
	}
	direct := scalarList(findMapping(dns, "dns", "direct-nameserver"))
	if len(direct) != 2 || direct[0] != "https://dns.alidns.com/dns-query" {
		t.Fatalf("direct-nameserver %#v", direct)
	}
	if !strings.Contains(got, `"geosite:geolocation-!cn"`) {
		t.Fatalf("geosite key was not quoted\n%s", dnsSection(got))
	}
	if tun := findMapping(dns, "tun", "enable"); tun == nil || tun.Value != "true" {
		t.Fatalf("tun %#v", tun)
	}
	if mode := findMapping(dns, "tun", "dns-mode"); mode == nil || mode.Value != "hijack" {
		t.Fatalf("dns-mode %#v", mode)
	}
}

func scalarList(node *yaml.Node) []string {
	if node == nil || node.Kind != yaml.SequenceNode {
		return nil
	}
	out := make([]string, 0, len(node.Content))
	for _, item := range node.Content {
		out = append(out, item.Value)
	}
	return out
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

func TestClashUDPDefault(t *testing.T) {
	body := "proxies:\n" +
		"  - {name: Unset, type: ss, server: example.com, port: 443, cipher: aes-128-gcm, password: pwd}\n" +
		"  - {name: Off, type: vmess, server: example.com, port: 443, uuid: 11111111-1111-1111-1111-111111111111, udp: false}\n" +
		"  - {name: On, type: trojan, server: example.com, port: 443, password: pwd, udp: true}\n" +
		"  - {name: Web, type: http, server: example.com, port: 80}\n" +
		"  - {name: Sock, type: socks5, server: example.com, port: 1080}\n" +
		"  - {name: HY, type: hysteria2, server: example.com, port: 443, password: pwd}\n" +
		"  - {name: SSR, type: ssr, server: example.com, port: 443, cipher: chacha20, password: pwd, protocol: auth_chain_b, obfs: tls1.2_ticket_fastauth}\n"
	proxies, _, _ := ClashNodes(body)
	got := map[string]map[string]any{}
	for _, item := range proxies {
		name, _ := item["name"].(string)
		got[name] = item
	}
	for _, name := range []string{"Unset", "On", "Sock", "HY", "SSR"} {
		if got[name]["udp"] != true {
			t.Errorf("%s udp = %#v", name, got[name]["udp"])
		}
	}
	if got["Off"]["udp"] != false {
		t.Fatalf("Off %#v", got["Off"])
	}
	if _, ok := got["Web"]["udp"]; ok {
		t.Fatalf("http gained udp %#v", got["Web"])
	}
	uri, _, _ := ClashNodes("ss://YWVzLTEyOC1nY206cHdk@example.com:443#SS\n")
	if len(uri) != 1 || uri[0]["udp"] != true || uri[0]["type"] != "ss" {
		t.Fatalf("uri %#v", uri)
	}
}

func TestEnsureClashDNSDropsSystem(t *testing.T) {
	dns := ensureClashDNS(map[string]any{
		"enable":     false,
		"nameserver": []any{"system", "dhcp://en0"},
		"nameserver-policy": map[string]any{
			"example.com": "1.1.1.1",
			"geosite:cn":  "system",
			"lan.example": "dhcp://system",
		},
	})
	if dns["enhanced-mode"] != "fake-ip" || dns["respect-rules"] != true {
		t.Fatalf("%#v", dns)
	}
	policy := dns["nameserver-policy"].(map[string]string)
	if policy["example.com"] != "1.1.1.1" || policy["geosite:cn"] != "https://dns.alidns.com/dns-query" {
		t.Fatalf("policy %#v", policy)
	}
	if _, ok := policy["lan.example"]; ok {
		t.Fatalf("dhcp policy kept %#v", policy)
	}
	for _, key := range []string{"nameserver", "fallback", "direct-nameserver", "proxy-server-nameserver", "default-nameserver"} {
		for _, server := range dns[key].([]string) {
			if server == "system" || strings.Contains(server, "dhcp://") {
				t.Fatalf("%s %s", key, server)
			}
		}
	}
}

func TestEnsureQXUDPRelay(t *testing.T) {
	cases := []struct{ in, want string }{
		{"shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, tag=A", "shadowsocks=example.com:443, method=aes-128-gcm, password=pwd, udp-relay=true, tag=A"},
		{"trojan = example.com:443, password=pwd, over-tls=true, tag=B", "trojan = example.com:443, password=pwd, over-tls=true, udp-relay=true, tag=B"},
		{"vless=example.com:443, method=none, password=id, obfs=over-tls", "vless=example.com:443, method=none, password=id, obfs=over-tls, udp-relay=true"},
		{"vmess=example.com:443, method=none, password=id, udp-relay=false, tag=C", "vmess=example.com:443, method=none, password=id, udp-relay=false, tag=C"},
		{"vmess=example.com:443, method=none, password=id, udp-relay=true, tag=C2", "vmess=example.com:443, method=none, password=id, udp-relay=true, tag=C2"},
		{"anytls=example.com:443, password=pwd, over-tls=true, tls-host=edge.example, tag=G", "anytls=example.com:443, password=pwd, over-tls=true, tls-host=edge.example, udp-relay=true, tag=G"},
		{"http=example.com:80, username=u, password=p, tag=D", "http=example.com:80, username=u, password=p, tag=D"},
		{"https=example.com:443, username=u, password=p, tag=H", "https=example.com:443, username=u, password=p, tag=H"},
		{"socks5=example.com:80, tag=E", "socks5=example.com:80, tag=E"},
		{"socks5-tls=example.com:443, tag=S", "socks5-tls=example.com:443, tag=S"},
		{"shadowsocksr=example.com:443, method=chacha20, password=pwd, tag=R", "shadowsocksr=example.com:443, method=chacha20, password=pwd, tag=R"},
		{"shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, obfs=tls1.2_ticket_fastauth, tag=F", "shadowsocks=example.com:443, method=chacha20, password=pwd, ssr-protocol=auth_chain_b, obfs=tls1.2_ticket_fastauth, tag=F"},
	}
	for _, c := range cases {
		if got := ensureQXUDPRelay(c.in); got != c.want {
			t.Errorf("ensureQXUDPRelay(%q)\n got %q\nwant %q", c.in, got, c.want)
		}
	}
}

func TestQXUDPRelayForConvertedNodes(t *testing.T) {
	vmess := base64.StdEncoding.EncodeToString([]byte(`{"ps":"VM","add":"example.com","port":"443","id":"11111111-1111-1111-1111-111111111111","net":"tcp"}`))
	uris := "ss://YWVzLTEyOC1nY206cHdk@example.com:443#SS\n" +
		"trojan://pwd@example.com:443?sni=edge.example#TR\n" +
		"vless://11111111-1111-1111-1111-111111111111@example.com:443?security=tls&sni=edge.example#VL\n" +
		"vmess://" + vmess + "#VM\n"
	local, _, _ := NodesForQuantumultX(uris)
	if len(local) != 4 {
		t.Fatalf("want 4 nodes, got %d: %v", len(local), local)
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
		"  - {name: SSOff, type: ss, server: example.com, port: 443, cipher: aes-128-gcm, password: pwd, udp: false}\n" +
		"  - {name: VM, type: vmess, server: example.com, port: 443, uuid: 11111111-1111-1111-1111-111111111111}\n" +
		"  - {name: VL, type: vless, server: example.com, port: 443, uuid: 11111111-1111-1111-1111-111111111111}\n" +
		"  - {name: Web, type: http, server: example.com, port: 80}\n" +
		"  - {name: SecureWeb, type: http, server: example.com, port: 443, tls: true, username: u, password: p}\n" +
		"  - {name: Sock, type: socks5, server: example.com, port: 1080}\n" +
		"  - {name: SSR, type: ssr, server: example.com, port: 443, cipher: chacha20, password: pwd, protocol: auth_chain_b, obfs: tls1.2_ticket_fastauth}\n"
	local, _, _ = NodesForQuantumultX(clash)
	got := map[string]bool{}
	for _, line := range local {
		tag := line[strings.LastIndex(line, "tag=")+4:]
		got[tag] = strings.Contains(line, "udp-relay=true")
	}
	want := map[string]bool{
		"On": true, "Off": false, "Unset": true, "SSOff": false,
		"VM": true, "VL": true, "Web": false, "SecureWeb": false, "Sock": false, "SSR": false,
	}
	if len(got) != len(want) {
		t.Fatalf("tags %#v\nlines %v", got, local)
	}
	for tag, on := range want {
		if v, ok := got[tag]; !ok || v != on {
			t.Errorf("%s: udp-relay=true is %v, want %v (lines %v)", tag, v, on, local)
		}
	}
}

func TestNativeAnyTLSAndUntouchedTypes(t *testing.T) {
	body := "[server_local]\n" +
		"anytls=example.com:443, password=pwd, over-tls=true, tls-host=edge.example, tag=A\n" +
		"anytls=example.com:443, password=pwd, udp-relay=false, tag=B\n" +
		"https=example.com:443, username=u, password=p, tag=C\n" +
		"socks5-tls=example.com:443, username=u, password=p, tag=D\n" +
		"vmess=example.com:443, method=none, password=id, udp-relay=true, tag=E\n"
	local, _, _ := NodesForQuantumultX(body)
	want := []string{
		"anytls=example.com:443, password=pwd, over-tls=true, tls-host=edge.example, udp-relay=true, tag=A",
		"anytls=example.com:443, password=pwd, udp-relay=false, tag=B",
		"https=example.com:443, username=u, password=p, tag=C",
		"socks5-tls=example.com:443, username=u, password=p, tag=D",
		"vmess=example.com:443, method=none, password=id, udp-relay=true, tag=E",
	}
	if strings.Join(local, "\n") != strings.Join(want, "\n") {
		t.Fatalf("got %v\nwant %v", local, want)
	}
}

func TestShadowrocketUDPDefault(t *testing.T) {
	native := "[Proxy]\n" +
		"Plain = ss, example.com, 443, encrypt-method=aes-128-gcm, password=pwd\n" +
		"Off = trojan, example.com, 443, password=pwd, udp-relay=false\n" +
		"Web = http, example.com, 80, user, pwd\n" +
		"HY = hysteria2, example.com, 443, password=pwd\n" +
		"Keep = hysteria2, example.com, 443, password=pwd, udp=0\n"
	proxies, _ := NodesForShadowrocket(native)
	got := map[string]string{}
	for _, line := range proxies {
		name, _, _ := strings.Cut(line, "=")
		got[strings.TrimSpace(name)] = line
	}
	if !strings.Contains(got["Plain"], "udp-relay=true") {
		t.Fatalf("unset ss: %s", got["Plain"])
	}
	if !strings.Contains(got["HY"], "udp-relay=true") {
		t.Fatalf("unset hysteria2: %s", got["HY"])
	}
	if strings.Contains(got["Off"], "udp-relay=true") || !strings.Contains(got["Off"], "udp-relay=false") {
		t.Fatalf("explicit off: %s", got["Off"])
	}
	if strings.Contains(got["Web"], "udp-relay") {
		t.Fatalf("http gained udp: %s", got["Web"])
	}
	if strings.Contains(got["Keep"], "udp-relay") || !strings.Contains(got["Keep"], "udp=0") {
		t.Fatalf("udp=0 rewritten: %s", got["Keep"])
	}

	clash := "proxies:\n" +
		"  - {name: Off, type: hysteria2, server: example.com, port: 443, password: pwd, udp: false}\n" +
		"  - {name: Web, type: http, server: example.com, port: 80}\n" +
		"  - {name: Sock, type: socks5, server: example.com, port: 1080}\n"
	converted, _ := NodesForShadowrocket(clash)
	foundOff := false
	for _, line := range converted {
		if strings.Contains(line, "udp-relay") {
			t.Fatalf("explicit off or non-udp type gained relay: %s", line)
		}
		if strings.HasPrefix(line, "Off =") {
			foundOff = true
		}
	}
	if !foundOff {
		t.Fatalf("hysteria2 with udp false was dropped: %v", converted)
	}
}
