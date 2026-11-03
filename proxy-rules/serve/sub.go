package serve

import (
	"encoding/base64"
	"encoding/json"
	"net"
	"net/url"
	"strconv"
	"strings"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
	"gopkg.in/yaml.v3"
)

const maxProxies = 2000

type proxy struct {
	Name        string
	Type        string
	Server      string
	Port        int
	Password    string
	Cipher      string
	UUID        string
	Network     string
	Path        string
	Host        string
	SNI         string
	TLS         bool
	UDP         bool
	UDPSet      bool // the source said whether UDP is on or off
	SkipCert    bool
	Flow        string
	PublicKey   string
	ShortID     string
	Fingerprint string
	Alpn        string
	Protocol    string
	ProtoParam  string
	Obfs        string
	ObfsParam   string
	RawQX       string
	RawSR       string
	RawClash    map[string]any
}

type bundle struct {
	qxLocal  []string
	qxRemote []string
	qxDNS    []string
	srProxy  []string
	srDNS    string
	proxies  []proxy
	remotes  []string
	clashDNS map[string]any
	html     bool
}

// NodesForQuantumultX returns Quantumult X server lines, remote lines, and DNS lines.
// Native Quantumult X text is kept. Shadowrocket, Clash, and URI lists are converted.
func NodesForQuantumultX(body string) (local, remote, dns []string) {
	b := parseBundle(body)
	if len(b.qxLocal) > 0 {
		for _, line := range b.qxLocal {
			local = append(local, ensureQXUDPRelay(line))
		}
		return local, b.qxRemote, b.qxDNS
	}
	for _, item := range b.proxies {
		if line, ok := item.qx(); ok {
			local = append(local, line)
		}
	}
	if len(local) == 0 {
		remote = b.qxRemote
	}
	return local, remote, b.qxDNS
}

// NodesForShadowrocket returns Shadowrocket proxy lines and one dns-server line.
func NodesForShadowrocket(body string) (proxies []string, dns string) {
	b := parseBundle(body)
	if len(b.srProxy) > 0 {
		return b.srProxy, b.srDNS
	}
	for _, item := range b.proxies {
		if line, ok := item.sr(); ok {
			proxies = append(proxies, line)
		}
	}
	if b.srDNS != "" {
		dns = b.srDNS
	} else {
		dns = dnsServerLine(b.qxDNS)
	}
	return proxies, dns
}

// ClashNodes returns Clash proxy maps, provider URLs, and a safe DNS map.
func ClashNodes(body string) (proxies []map[string]any, remotes []string, dns map[string]any) {
	b := parseBundle(body)
	for _, item := range b.proxies {
		if mapped, ok := item.clash(); ok {
			proxies = append(proxies, mapped)
		}
	}
	remotes = append(remotes, b.remotes...)
	if len(b.qxRemote) > 0 {
		remotes = append(remotes, remoteURLs(b.qxRemote)...)
	}
	if len(b.clashDNS) > 0 {
		dns = b.clashDNS
	} else if len(b.qxDNS) > 0 {
		dns = qxToClashDNS(b.qxDNS)
	}
	return proxies, uniqueStrings(remotes), dns
}

// LooksLikeHTML reports a document that should not be stored.
func LooksLikeHTML(body string) bool {
	return parseBundle(body).html
}

func parseBundle(body string) bundle {
	body = strings.TrimSpace(normalize(body))
	if body == "" {
		return bundle{}
	}
	if looksHTML(body) {
		return bundle{html: true}
	}
	if b, ok := parseDocument(body); ok {
		return finalizeNodes(b)
	}
	if decoded, ok := decodeText(body); ok && !looksHTML(decoded) {
		if b, ok := parseDocument(decoded); ok {
			return finalizeNodes(b)
		}
		body = decoded
	}
	if b, ok := parseURIs(body); ok {
		return finalizeNodes(b)
	}
	return bundle{}
}

// finalizeNodes drops emoji from node names and keeps server tags in step with them.
// Quantumult X matches a policy member to the tag text, so the two have to stay equal.
func finalizeNodes(b bundle) bundle {
	seen := map[string]bool{}
	for i := range b.proxies {
		name := b.proxies[i].Name
		if name == "" {
			name = "节点"
		}
		base := name
		if seen[name] {
			n := 2
			for seen[base+" "+strconv.Itoa(n)] {
				n++
			}
			name = base + " " + strconv.Itoa(n)
		}
		seen[name] = true
		b.proxies[i].Name = name
		if b.proxies[i].RawQX != "" {
			b.proxies[i].RawQX = replaceQXTag(b.proxies[i].RawQX, name)
		}
		if b.proxies[i].RawSR != "" {
			b.proxies[i].RawSR = replaceSRName(b.proxies[i].RawSR, name)
		}
	}
	if len(b.qxLocal) > 0 {
		b.qxLocal = b.qxLocal[:0]
		for _, item := range b.proxies {
			if item.RawQX != "" {
				b.qxLocal = append(b.qxLocal, item.RawQX)
			}
		}
	}
	if len(b.srProxy) > 0 {
		b.srProxy = b.srProxy[:0]
		for _, item := range b.proxies {
			if item.RawSR != "" {
				b.srProxy = append(b.srProxy, item.RawSR)
			}
		}
	}
	return b
}

func replaceQXTag(line, name string) string {
	parts := strings.Split(line, ",")
	for i, part := range parts {
		eq := strings.Index(part, "=")
		if eq < 0 || !strings.EqualFold(strings.TrimSpace(part[:eq]), "tag") {
			continue
		}
		parts[i] = part[:eq+1] + name
		return strings.Join(parts, ",")
	}
	return line
}

func replaceSRName(line, name string) string {
	eq := strings.Index(line, "=")
	if eq < 0 {
		return line
	}
	return name + " =" + line[eq+1:]
}

func parseDocument(body string) (bundle, bool) {
	sections := splitSections(body)
	if sections != nil && isQXDoc(sections) {
		return parseQX(sections), true
	}
	if sections != nil && isSRDoc(sections) {
		return parseSR(sections), true
	}
	if isClashDoc(body) {
		return parseClash(body), true
	}
	if lines := headerlessQX(body); len(lines) > 0 {
		var b bundle
		for _, line := range lines {
			if item, ok := parseQXProxy(line); ok {
				b.proxies = append(b.proxies, item)
				b.qxLocal = append(b.qxLocal, line)
			}
		}
		return b, len(b.qxLocal) > 0
	}
	if lines := headerlessSR(body); len(lines) > 0 {
		var b bundle
		for _, line := range lines {
			if item, ok := parseSRProxy(line); ok {
				b.proxies = append(b.proxies, item)
				b.srProxy = append(b.srProxy, line)
			}
		}
		return b, len(b.srProxy) > 0
	}
	return bundle{}, false
}

func isQXDoc(sections map[string][]string) bool {
	for _, name := range []string{"server_local", "server_remote", "filter_remote", "filter_local", "policy", "rewrite_remote", "mitm", "dns"} {
		if _, ok := sections[name]; ok {
			return true
		}
	}
	return false
}

func isSRDoc(sections map[string][]string) bool {
	for _, name := range []string{"proxy", "proxy group", "rule"} {
		if _, ok := sections[name]; ok {
			return true
		}
	}
	return false
}

func isClashDoc(body string) bool {
	for _, line := range strings.Split(body, "\n") {
		switch strings.TrimSpace(line) {
		case "proxies:", "proxy-providers:", "proxy-groups:":
			return true
		}
	}
	return false
}

func parseQX(sections map[string][]string) bundle {
	var b bundle
	for _, line := range sections["server_local"] {
		line = strings.TrimSpace(line)
		if item, ok := parseQXProxy(line); ok {
			item.RawQX = line
			b.proxies = append(b.proxies, item)
			b.qxLocal = append(b.qxLocal, line)
		}
	}
	for _, line := range sections["server_remote"] {
		line = strings.TrimSpace(line)
		if remote, ok := cleanRemote(line); ok {
			b.qxRemote = append(b.qxRemote, remote)
		}
	}
	b.qxDNS = filterQXDNS(sections["dns"])
	b.remotes = remoteURLs(b.qxRemote)
	return b
}

func parseSR(sections map[string][]string) bundle {
	var b bundle
	for _, line := range sections["proxy"] {
		line = strings.TrimSpace(line)
		if !shadowrocketProxy(line) {
			continue
		}
		if item, ok := parseSRProxy(line); ok {
			item.RawSR = line
			b.proxies = append(b.proxies, item)
			b.srProxy = append(b.srProxy, line)
		}
	}
	for _, line := range sections["general"] {
		line = strings.TrimSpace(line)
		if strings.HasPrefix(strings.ToLower(line), "dns-server") && dnsAllowed(line) {
			b.srDNS = line
			b.qxDNS = srDNSToQX(line)
			break
		}
	}
	return b
}

func parseClash(body string) bundle {
	var doc struct {
		Proxies   []map[string]any `yaml:"proxies"`
		Providers map[string]any   `yaml:"proxy-providers"`
		DNS       map[string]any   `yaml:"dns"`
	}
	if err := yaml.Unmarshal([]byte(body), &doc); err != nil {
		return bundle{}
	}
	var b bundle
	for _, item := range doc.Proxies {
		if len(b.proxies) >= maxProxies {
			break
		}
		proxy, ok := parseClashProxy(item)
		if !ok {
			continue
		}
		b.proxies = append(b.proxies, proxy)
	}
	for _, raw := range doc.Providers {
		mapped, ok := raw.(map[string]any)
		if !ok {
			continue
		}
		kind, _ := asString(mapped["type"])
		link, _ := asString(mapped["url"])
		if !strings.EqualFold(kind, "http") && kind != "" {
			continue
		}
		if err := Screen(link); err != nil {
			continue
		}
		b.remotes = append(b.remotes, link)
	}
	b.remotes = uniqueStrings(b.remotes)
	for _, link := range b.remotes {
		b.qxRemote = append(b.qxRemote, remoteLine(link, len(b.qxRemote)))
	}
	b.clashDNS = cleanClashDNS(doc.DNS)
	b.qxDNS = clashToQXDNS(b.clashDNS)
	return b
}

func headerlessQX(body string) []string {
	if strings.Contains(body, "[") {
		return nil
	}
	var out []string
	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		if item, ok := parseQXProxy(line); ok {
			out = append(out, item.RawQX)
		}
	}
	return out
}

func headerlessSR(body string) []string {
	if strings.Contains(body, "[") {
		return nil
	}
	var out []string
	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		if shadowrocketProxy(line) {
			out = append(out, line)
		}
	}
	return out
}

func parseQXProxy(line string) (proxy, bool) {
	if !qxServerLine(line) {
		return proxy{}, false
	}
	head, rest, _ := strings.Cut(line, "=")
	typ := strings.ToLower(strings.TrimSpace(head))
	rest = strings.TrimSpace(rest)
	serverPart, optText, _ := strings.Cut(rest, ",")
	host, port, ok := splitHostPort(strings.TrimSpace(serverPart))
	if !ok || !hostOK(host) || !portOK(port) {
		return proxy{}, false
	}
	opts := optMap(optText)
	item := proxy{Type: qxType(typ), Server: host, Port: port, RawQX: line, Name: cleanName(opts["tag"])}
	if item.Name == "" {
		item.Name = "节点"
	}
	item.Password = cleanValue(opts["password"])
	item.Cipher = cleanValue(opts["method"])
	item.UUID = item.Password
	item.Network = "tcp"
	item.UDP = boolOpt(opts["udp-relay"])
	_, item.UDPSet = opts["udp-relay"]
	item.TLS = boolOpt(opts["over-tls"]) || boolOpt(opts["tls"]) || boolOpt(opts["tls13"])
	if raw, ok := opts["tls-verification"]; ok {
		item.SkipCert = !boolOpt(raw)
	}
	item.SNI = first(opts["tls-host"], opts["obfs-host"], opts["sni"])
	item.Host = cleanValue(opts["obfs-host"])
	item.Path = cleanValue(opts["obfs-uri"])
	switch strings.ToLower(opts["obfs"]) {
	case "ws", "wss":
		item.Network = "ws"
		item.TLS = item.TLS || strings.EqualFold(opts["obfs"], "wss")
	case "http":
		item.Obfs = "http"
		item.ObfsParam = item.Host
	case "tls":
		item.Obfs = "tls"
		item.ObfsParam = item.Host
	}
	item.Protocol = cleanValue(opts["ssr-protocol"])
	item.ProtoParam = cleanValue(opts["ssr-protocol-param"])
	if item.Protocol != "" {
		item.Obfs = cleanValue(opts["obfs"])
		item.ObfsParam = item.Host
	}
	if typ == "https" || typ == "socks5-tls" {
		item.TLS = true
	}
	if typ == "http" || typ == "https" || typ == "socks5" || typ == "socks5-tls" {
		item.UUID = cleanValue(opts["username"])
	}
	return item, true
}

func parseSRProxy(line string) (proxy, bool) {
	name, rest, ok := strings.Cut(line, "=")
	if !ok {
		return proxy{}, false
	}
	parts := splitCSV(rest)
	if len(parts) < 3 {
		return proxy{}, false
	}
	typ := strings.ToLower(parts[0])
	host := parts[1]
	port, err := strconv.Atoi(parts[2])
	if err != nil || !hostOK(host) || !portOK(port) {
		return proxy{}, false
	}
	opts := map[string]string{}
	var positional []string
	for _, part := range parts[3:] {
		key, value, found := strings.Cut(part, "=")
		if !found {
			positional = append(positional, part)
			continue
		}
		opts[strings.ToLower(strings.TrimSpace(key))] = strings.TrimSpace(value)
	}
	item := proxy{Name: cleanName(name), Type: srType(typ), Server: host, Port: port, RawSR: strings.TrimSpace(line)}
	if item.Name == "" {
		item.Name = "节点"
	}
	item.Password = cleanValue(first(opts["password"], ""))
	item.Cipher = cleanValue(first(opts["encrypt-method"], opts["method"]))
	item.UUID = cleanValue(first(opts["username"], opts["uuid"], opts["id"]))
	item.Network = "tcp"
	item.TLS = boolOpt(opts["tls"]) || boolOpt(opts["over-tls"])
	item.UDP = boolOpt(opts["udp-relay"])
	_, item.UDPSet = opts["udp-relay"]
	item.SNI = cleanValue(first(opts["sni"], opts["peer"], opts["tls-host"]))
	item.Path = cleanValue(first(opts["ws-path"], opts["path"]))
	item.Host = headerHost(opts["ws-headers"])
	if item.Host == "" {
		item.Host = cleanValue(opts["obfs-host"])
	}
	if boolOpt(opts["ws"]) || strings.EqualFold(opts["obfs"], "websocket") || strings.EqualFold(opts["net"], "ws") {
		item.Network = "ws"
	}
	item.Protocol = cleanValue(opts["protocol"])
	item.ProtoParam = cleanValue(opts["protocol-param"])
	item.Obfs = cleanValue(opts["obfs"])
	item.ObfsParam = cleanValue(first(opts["obfs-param"], opts["obfs-host"]))
	item.PublicKey = cleanValue(first(opts["reality-public-key"], opts["public-key"]))
	item.ShortID = cleanValue(first(opts["reality-short-id"], opts["short-id"]))
	item.Flow = cleanValue(opts["flow"])
	item.SkipCert = boolOpt(opts["skip-cert-verify"]) || boolOpt(opts["allowInsecure"])
	if len(positional) > 0 && item.UUID == "" {
		item.UUID = cleanValue(positional[0])
	}
	if len(positional) > 1 && item.Password == "" {
		item.Password = cleanValue(positional[1])
	}
	if item.Type == "http" && item.TLS {
		item.TLS = true
	}
	if typ == "https" || typ == "socks5-tls" {
		item.TLS = true
	}
	return item, true
}

func parseClashProxy(raw map[string]any) (proxy, bool) {
	typ, _ := asString(raw["type"])
	typ = strings.ToLower(strings.TrimSpace(typ))
	switch typ {
	case "", "direct", "reject", "reject-drop", "compatible", "pass", "selector", "url-test", "urltest", "fallback", "load-balance", "relay":
		return proxy{}, false
	}
	name, _ := asString(raw["name"])
	server, _ := asString(raw["server"])
	port, ok := asInt(raw["port"])
	if !ok || !hostOK(server) || !portOK(port) {
		return proxy{}, false
	}
	item := proxy{Name: cleanName(name), Type: typ, Server: server, Port: port, RawClash: cloneMap(raw)}
	if item.Name == "" {
		item.Name = "节点"
	}
	item.Password, _ = asString(raw["password"])
	item.Password = cleanValue(item.Password)
	item.Cipher, _ = asString(raw["cipher"])
	item.Cipher = cleanValue(item.Cipher)
	item.UUID, _ = asString(raw["uuid"])
	item.UUID = cleanValue(item.UUID)
	item.Network, _ = asString(raw["network"])
	item.Network = strings.ToLower(cleanValue(item.Network))
	if item.Network == "" {
		item.Network = "tcp"
	}
	item.SNI, _ = asString(raw["sni"])
	if item.SNI == "" {
		item.SNI, _ = asString(raw["servername"])
	}
	item.SNI = cleanValue(item.SNI)
	item.Flow, _ = asString(raw["flow"])
	item.Flow = cleanValue(item.Flow)
	item.TLS, _ = asBool(raw["tls"])
	item.UDP, _ = asBool(raw["udp"])
	_, item.UDPSet = raw["udp"]
	item.SkipCert, _ = asBool(raw["skip-cert-verify"])
	item.Protocol, _ = asString(raw["protocol"])
	item.ProtoParam, _ = asString(raw["protocol-param"])
	item.Obfs, _ = asString(raw["obfs"])
	item.ObfsParam, _ = asString(raw["obfs-param"])
	if ws, ok := raw["ws-opts"].(map[string]any); ok {
		item.Path, _ = asString(ws["path"])
		item.Path = cleanValue(item.Path)
		if headers, ok := ws["headers"].(map[string]any); ok {
			item.Host, _ = asString(headers["Host"])
			if item.Host == "" {
				item.Host, _ = asString(headers["host"])
			}
			item.Host = cleanValue(item.Host)
		}
	}
	if reality, ok := raw["reality-opts"].(map[string]any); ok {
		item.PublicKey, _ = asString(reality["public-key"])
		item.ShortID, _ = asString(reality["short-id"])
		item.PublicKey = cleanValue(item.PublicKey)
		item.ShortID = cleanValue(item.ShortID)
	}
	item.Fingerprint, _ = asString(raw["client-fingerprint"])
	item.Fingerprint = cleanValue(item.Fingerprint)
	if item.Network == "ws" || item.Network == "grpc" || item.PublicKey != "" {
		item.TLS = item.TLS || item.PublicKey != "" || item.SNI != ""
	}
	return item, true
}

func (p proxy) qx() (string, bool) {
	if p.RawQX != "" {
		return p.RawQX, true
	}
	if !hostOK(p.Server) || !portOK(p.Port) {
		return "", false
	}
	opts := make([][2]string, 0, 8)
	add := func(k, v string) {
		if v != "" {
			opts = append(opts, [2]string{k, v})
		}
	}
	var typ string
	switch p.Type {
	case "ss":
		if p.Cipher == "" || p.Password == "" || p.Obfs == "grpc" {
			return "", false
		}
		typ = "shadowsocks"
		add("method", p.Cipher)
		add("password", p.Password)
		if p.Obfs == "http" || p.Obfs == "tls" {
			add("obfs", p.Obfs)
			add("obfs-host", p.ObfsParam)
		}
		if p.qxUDPRelay() {
			add("udp-relay", "true")
		}
	case "ssr":
		if p.Cipher == "" || p.Password == "" || p.Protocol == "" || p.Obfs == "" {
			return "", false
		}
		typ = "shadowsocksr"
		add("method", p.Cipher)
		add("password", p.Password)
		add("ssr-protocol", p.Protocol)
		add("ssr-protocol-param", p.ProtoParam)
		add("obfs", p.Obfs)
		add("obfs-host", p.ObfsParam)
	case "vmess":
		if p.UUID == "" || p.Network == "grpc" || p.PublicKey != "" {
			return "", false
		}
		typ = "vmess"
		method := p.Cipher
		if method == "" || strings.EqualFold(method, "auto") {
			method = "chacha20-poly1305"
		}
		add("method", method)
		add("password", p.UUID)
		if p.Network == "ws" {
			obfs := "ws"
			if p.TLS {
				obfs = "wss"
			}
			add("obfs", obfs)
			add("obfs-uri", p.Path)
			add("obfs-host", first(p.Host, p.SNI))
		} else if p.TLS {
			add("obfs", "over-tls")
			add("tls-host", p.SNI)
		}
		if p.qxUDPRelay() {
			add("udp-relay", "true")
		}
	case "vless":
		if p.UUID == "" || p.Network == "grpc" || p.PublicKey != "" {
			return "", false
		}
		typ = "vless"
		add("method", "none")
		add("password", p.UUID)
		if p.Network == "ws" {
			obfs := "ws"
			if p.TLS {
				obfs = "wss"
			}
			add("obfs", obfs)
			add("obfs-uri", p.Path)
			add("obfs-host", first(p.Host, p.SNI))
		} else if p.TLS {
			add("obfs", "over-tls")
			add("tls-host", p.SNI)
		}
		if p.qxUDPRelay() {
			add("udp-relay", "true")
		}
	case "trojan":
		if p.Password == "" {
			return "", false
		}
		typ = "trojan"
		add("password", p.Password)
		add("over-tls", "true")
		add("tls-host", p.SNI)
		if p.Network == "ws" {
			add("obfs", "wss")
			add("obfs-uri", p.Path)
			add("obfs-host", first(p.Host, p.SNI))
		}
		if p.qxUDPRelay() {
			add("udp-relay", "true")
		}
		if p.SkipCert {
			add("tls-verification", "false")
		}
	case "http":
		typ = "http"
		if p.TLS {
			typ = "https"
		}
		add("username", p.UUID)
		add("password", p.Password)
		if p.TLS {
			add("over-tls", "true")
			add("tls-host", p.SNI)
		}
		if p.SkipCert {
			add("tls-verification", "false")
		}
	case "socks5":
		typ = "socks5"
		if p.TLS {
			typ = "socks5-tls"
		}
		add("username", p.UUID)
		add("password", p.Password)
	case "hysteria2":
		if p.Password == "" {
			return "", false
		}
		typ = "hysteria2"
		add("password", p.Password)
		add("tls-host", p.SNI)
		if p.SkipCert {
			add("tls-verification", "false")
		}
	default:
		return "", false
	}
	return qxLine(typ, p.Server, p.Port, opts, p.Name), true
}

func (p proxy) sr() (string, bool) {
	if p.RawSR != "" {
		return p.RawSR, true
	}
	if !hostOK(p.Server) || !portOK(p.Port) {
		return "", false
	}
	opts := make([][2]string, 0, 8)
	add := func(k, v string) {
		if v != "" {
			opts = append(opts, [2]string{k, v})
		}
	}
	var typ string
	switch p.Type {
	case "ss":
		if p.Cipher == "" || p.Password == "" {
			return "", false
		}
		typ = "ss"
		add("encrypt-method", p.Cipher)
		add("password", p.Password)
		if p.UDP {
			add("udp-relay", "true")
		}
		if p.Obfs == "http" || p.Obfs == "tls" {
			add("obfs", p.Obfs)
			add("obfs-host", p.ObfsParam)
		}
	case "ssr":
		if p.Cipher == "" || p.Password == "" || p.Protocol == "" || p.Obfs == "" {
			return "", false
		}
		typ = "ssr"
		add("encrypt-method", p.Cipher)
		add("password", p.Password)
		add("protocol", p.Protocol)
		add("protocol-param", p.ProtoParam)
		add("obfs", p.Obfs)
		add("obfs-param", p.ObfsParam)
	case "vmess":
		if p.UUID == "" || p.Network == "grpc" || p.PublicKey != "" {
			return "", false
		}
		typ = "vmess"
		add("username", p.UUID)
		if p.TLS {
			add("tls", "true")
		}
		add("vmess-aead", "true")
		if p.Network == "ws" {
			add("ws", "true")
			add("ws-path", p.Path)
			if p.Host != "" {
				add("ws-headers", "Host:"+p.Host)
			}
		}
		if p.UDP {
			add("udp-relay", "true")
		}
	case "vless":
		if p.UUID == "" || (p.Network == "grpc" && p.PublicKey == "") {
			return "", false
		}
		typ = "vless"
		add("username", p.UUID)
		add("tls", "true")
		if p.Network == "ws" {
			add("ws", "true")
			add("ws-path", p.Path)
			if p.Host != "" {
				add("ws-headers", "Host:"+p.Host)
			}
		}
		add("sni", p.SNI)
		if p.PublicKey != "" {
			add("reality", "true")
			add("reality-public-key", p.PublicKey)
			add("reality-short-id", p.ShortID)
		}
		if p.UDP {
			add("udp-relay", "true")
		}
	case "trojan":
		if p.Password == "" {
			return "", false
		}
		typ = "trojan"
		add("password", p.Password)
		add("tls", "true")
		add("sni", p.SNI)
		if p.Network == "ws" {
			add("ws", "true")
			add("ws-path", p.Path)
			if p.Host != "" {
				add("ws-headers", "Host:"+p.Host)
			}
		}
		if p.UDP {
			add("udp-relay", "true")
		}
		if p.SkipCert {
			add("skip-cert-verify", "true")
		}
	case "http":
		typ = "http"
		if p.TLS {
			typ = "https"
		}
		return srPositional(p.Name, typ, p.Server, p.Port, []string{p.UUID, p.Password}), true
	case "socks5":
		typ = "socks5"
		if p.TLS {
			typ = "socks5-tls"
		}
		return srPositional(p.Name, typ, p.Server, p.Port, []string{p.UUID, p.Password}), true
	case "hysteria2":
		if p.Password == "" {
			return "", false
		}
		typ = "hysteria2"
		add("password", p.Password)
		add("sni", p.SNI)
		add("udp-relay", "true")
		if p.SkipCert {
			add("skip-cert-verify", "true")
		}
	case "tuic":
		if p.UUID == "" || p.Password == "" {
			return "", false
		}
		typ = "tuic"
		add("uuid", p.UUID)
		add("password", p.Password)
		add("sni", p.SNI)
		add("udp-relay", "true")
		add("alpn", first(p.Alpn, "h3"))
	default:
		return "", false
	}
	return srLine(p.Name, typ, p.Server, p.Port, opts), true
}

func (p proxy) clash() (map[string]any, bool) {
	if p.RawClash != nil {
		out := cloneMap(p.RawClash)
		out["name"] = p.Name
		if udp, ok := p.clashUDP(); ok {
			out["udp"] = udp
		}
		return out, true
	}
	if !hostOK(p.Server) || !portOK(p.Port) {
		return nil, false
	}
	out := map[string]any{"name": p.Name, "server": p.Server, "port": p.Port}
	switch p.Type {
	case "ss":
		if p.Cipher == "" || p.Password == "" {
			return nil, false
		}
		out["type"] = "ss"
		out["cipher"] = p.Cipher
		out["password"] = p.Password
		if p.Obfs == "http" || p.Obfs == "tls" {
			out["plugin"] = "obfs"
			opts := map[string]any{"mode": p.Obfs}
			if p.ObfsParam != "" {
				opts["host"] = p.ObfsParam
			}
			out["plugin-opts"] = opts
		}
	case "ssr":
		if p.Cipher == "" || p.Password == "" || p.Protocol == "" || p.Obfs == "" {
			return nil, false
		}
		out["type"] = "ssr"
		out["cipher"] = p.Cipher
		out["password"] = p.Password
		out["protocol"] = p.Protocol
		out["protocol-param"] = p.ProtoParam
		out["obfs"] = p.Obfs
		out["obfs-param"] = p.ObfsParam
	case "vmess":
		if p.UUID == "" || p.Network == "grpc" || p.PublicKey != "" {
			return nil, false
		}
		out["type"] = "vmess"
		out["uuid"] = p.UUID
		out["alterId"] = 0
		out["cipher"] = "auto"
		if p.TLS {
			out["tls"] = true
		}
		if p.Network == "ws" {
			out["network"] = "ws"
			ws := map[string]any{}
			if p.Path != "" {
				ws["path"] = p.Path
			}
			if p.Host != "" {
				ws["headers"] = map[string]any{"Host": p.Host}
			}
			if len(ws) > 0 {
				out["ws-opts"] = ws
			}
		}
		if p.SNI != "" {
			out["servername"] = p.SNI
		}
	case "vless":
		if p.UUID == "" || (p.Network == "grpc" && p.PublicKey == "") {
			return nil, false
		}
		out["type"] = "vless"
		out["uuid"] = p.UUID
		out["tls"] = true
		if p.Network == "ws" || p.Network == "grpc" || p.Network == "tcp" {
			out["network"] = p.Network
		}
		if p.SNI != "" {
			out["servername"] = p.SNI
		}
		if p.Flow != "" {
			out["flow"] = p.Flow
		}
		if p.PublicKey != "" {
			out["reality-opts"] = map[string]any{"public-key": p.PublicKey, "short-id": p.ShortID}
			if p.Fingerprint != "" {
				out["client-fingerprint"] = p.Fingerprint
			}
		}
		if p.Network == "ws" {
			ws := map[string]any{}
			if p.Path != "" {
				ws["path"] = p.Path
			}
			if p.Host != "" {
				ws["headers"] = map[string]any{"Host": p.Host}
			}
			if len(ws) > 0 {
				out["ws-opts"] = ws
			}
		}
	case "trojan":
		if p.Password == "" {
			return nil, false
		}
		out["type"] = "trojan"
		out["password"] = p.Password
		if p.SNI != "" {
			out["sni"] = p.SNI
		}
		if p.Network == "ws" {
			out["network"] = "ws"
			ws := map[string]any{}
			if p.Path != "" {
				ws["path"] = p.Path
			}
			if p.Host != "" {
				ws["headers"] = map[string]any{"Host": p.Host}
			}
			if len(ws) > 0 {
				out["ws-opts"] = ws
			}
		}
		if p.SkipCert {
			out["skip-cert-verify"] = true
		}
	case "http", "socks5":
		out["type"] = p.Type
		if p.TLS {
			out["tls"] = true
		}
		if p.UUID != "" {
			out["username"] = p.UUID
		}
		if p.Password != "" {
			out["password"] = p.Password
		}
	case "hysteria2":
		if p.Password == "" {
			return nil, false
		}
		out["type"] = "hysteria2"
		out["password"] = p.Password
		if p.SNI != "" {
			out["sni"] = p.SNI
		}
		if p.SkipCert {
			out["skip-cert-verify"] = true
		}
	case "tuic":
		if p.UUID == "" || p.Password == "" {
			return nil, false
		}
		out["type"] = "tuic"
		out["uuid"] = p.UUID
		out["password"] = p.Password
		if p.SNI != "" {
			out["sni"] = p.SNI
		}
		out["alpn"] = []string{first(p.Alpn, "h3")}
	default:
		return nil, false
	}
	if udp, ok := p.clashUDP(); ok {
		out["udp"] = udp
	}
	return out, true
}

func parseURIs(body string) (bundle, bool) {
	var b bundle
	seen := false
	for _, line := range strings.Split(body, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		item, ok := parseURI(line)
		if !ok {
			continue
		}
		seen = true
		if len(b.proxies) < maxProxies {
			b.proxies = append(b.proxies, item)
		}
	}
	return b, seen
}

func parseURI(line string) (proxy, bool) {
	parsed, err := url.Parse(line)
	if err != nil || parsed.Scheme == "" {
		return proxy{}, false
	}
	switch strings.ToLower(parsed.Scheme) {
	case "ss":
		return parseSSURI(parsed)
	case "vmess":
		return parseVMessURI(line)
	case "trojan":
		return parseUserURI(parsed, "trojan")
	case "vless":
		return parseUserURI(parsed, "vless")
	case "hysteria2", "hy2":
		return parseUserURI(parsed, "hysteria2")
	default:
		return proxy{}, false
	}
}

func parseSSURI(parsed *url.URL) (proxy, bool) {
	name := fragmentName(parsed)
	host := parsed.Hostname()
	port, _ := strconv.Atoi(parsed.Port())
	var method, password string
	if parsed.User != nil {
		user := parsed.User.Username()
		if decoded, err := base64.RawStdEncoding.DecodeString(user); err == nil && strings.Contains(string(decoded), ":") {
			method, password, _ = strings.Cut(string(decoded), ":")
		} else if decoded, err := base64.StdEncoding.DecodeString(padBase64(user)); err == nil && strings.Contains(string(decoded), ":") {
			method, password, _ = strings.Cut(string(decoded), ":")
		} else {
			method = user
			password, _ = parsed.User.Password()
		}
	} else {
		payload := parsed.Host
		if decoded, ok := decodeText(payload); ok {
			method, password, host, port = splitSSLegacy(decoded)
		}
	}
	if !hostOK(host) || !portOK(port) || method == "" || password == "" {
		return proxy{}, false
	}
	return proxy{Name: name, Type: "ss", Server: host, Port: port, Cipher: cleanValue(method), Password: cleanValue(password)}, true
}

func splitSSLegacy(decoded string) (method, password, host string, port int) {
	method, rest, ok := strings.Cut(decoded, ":")
	if !ok {
		return
	}
	password, hostport, ok := strings.Cut(rest, "@")
	if !ok {
		return
	}
	host, portText, ok := strings.Cut(hostport, ":")
	if !ok {
		return
	}
	port, _ = strconv.Atoi(portText)
	return method, password, host, port
}

func parseVMessURI(line string) (proxy, bool) {
	raw := strings.TrimPrefix(line, "vmess://")
	raw = strings.TrimPrefix(raw, "VMess://")
	if i := strings.IndexAny(raw, "#?"); i >= 0 {
		raw = raw[:i]
	}
	// decodeText only accepts a whole subscription document. A vmess link is
	// base64 of one JSON object, which does not contain those markers.
	decoded, ok := decodeBase64(raw)
	if !ok {
		return proxy{}, false
	}
	var doc struct {
		Name string `json:"ps"`
		Add  string `json:"add"`
		Port any    `json:"port"`
		ID   string `json:"id"`
		Net  string `json:"net"`
		Host string `json:"host"`
		Path string `json:"path"`
		TLS  string `json:"tls"`
		SNI  string `json:"sni"`
	}
	if json.Unmarshal([]byte(decoded), &doc) != nil {
		return proxy{}, false
	}
	port, ok := asInt(doc.Port)
	if !ok || !hostOK(doc.Add) || !portOK(port) || doc.ID == "" {
		return proxy{}, false
	}
	item := proxy{
		Name: cleanName(doc.Name), Type: "vmess", Server: doc.Add, Port: port,
		UUID: cleanValue(doc.ID), Network: strings.ToLower(doc.Net), Path: cleanValue(doc.Path),
		Host: cleanValue(doc.Host), SNI: cleanValue(doc.SNI), TLS: strings.EqualFold(doc.TLS, "tls"),
	}
	if item.Name == "" {
		item.Name = "节点"
	}
	if item.Network == "" {
		item.Network = "tcp"
	}
	if item.SNI == "" {
		item.SNI = item.Host
	}
	return item, true
}

func parseUserURI(parsed *url.URL, typ string) (proxy, bool) {
	host := parsed.Hostname()
	port, _ := strconv.Atoi(parsed.Port())
	secret := ""
	if parsed.User != nil {
		secret = parsed.User.Username()
	}
	if !hostOK(host) || !portOK(port) || secret == "" {
		return proxy{}, false
	}
	query := parsed.Query()
	item := proxy{
		Name: fragmentName(parsed), Type: typ, Server: host, Port: port,
		Password: cleanValue(secret), UUID: cleanValue(secret),
		Network: strings.ToLower(query.Get("type")), Path: cleanValue(query.Get("path")),
		Host:      cleanValue(first(query.Get("host"), query.Get("sni"))),
		SNI:       cleanValue(first(query.Get("sni"), query.Get("peer"))),
		TLS:       query.Get("security") == "tls" || query.Get("security") == "reality" || typ == "trojan" || typ == "hysteria2",
		PublicKey: cleanValue(query.Get("pbk")), ShortID: cleanValue(query.Get("sid")),
		Flow: cleanValue(query.Get("flow")), Fingerprint: cleanValue(query.Get("fp")),
		SkipCert: query.Get("allowInsecure") == "1" || query.Get("insecure") == "1",
	}
	if item.Network == "" {
		item.Network = "tcp"
	}
	if item.Name == "" {
		item.Name = "节点"
	}
	return item, true
}

func fragmentName(parsed *url.URL) string {
	name, err := url.QueryUnescape(parsed.Fragment)
	if err != nil {
		name = parsed.Fragment
	}
	name = cleanName(name)
	if name == "" {
		return "节点"
	}
	return name
}

func qxServerLine(line string) bool {
	lower := strings.ToLower(strings.TrimSpace(line))
	if lower == "" || strings.HasPrefix(lower, "#") || strings.HasPrefix(lower, ";") || strings.Contains(lower, "[") {
		return false
	}
	if strings.Contains(lower, "passphrase") || strings.Contains(lower, "p12") {
		return false
	}
	head, _, ok := strings.Cut(lower, "=")
	if !ok {
		return false
	}
	switch strings.TrimSpace(head) {
	// anytls has to be recognized here. Native lines are copied through, and a
	// type rejected by this function never reaches ensureQXUDPRelay.
	case "shadowsocks", "shadowsocksr", "vmess", "vless", "trojan", "anytls", "http", "https", "socks5", "socks5-tls", "hysteria2", "hysteria":
		return true
	default:
		return false
	}
}

func qxType(typ string) string {
	switch typ {
	case "shadowsocks":
		return "ss"
	case "shadowsocksr":
		return "ssr"
	case "https":
		return "http"
	case "socks5-tls":
		return "socks5"
	case "hysteria":
		return "hysteria2"
	default:
		return typ
	}
}

func srType(typ string) string {
	switch typ {
	case "https":
		return "http"
	case "socks5-tls":
		return "socks5"
	case "hy2", "hysteria":
		return "hysteria2"
	default:
		return typ
	}
}

// qxUDPRelay reports whether a converted node gets udp-relay=true.
// The source wins when it says on or off. When it says nothing (ss://, vmess://,
// trojan://, vless:// links, or Clash without udp), UDP is turned on, because
// Quantumult X treats a missing udp-relay as off and sends UDP to
// fallback_udp_policy instead of the node, which breaks games and WebRTC.
func (p proxy) qxUDPRelay() bool {
	return p.UDP || !p.UDPSet
}

// clashUDP is the udp flag written into a Clash proxy.
// UDP-capable types default to true when the source says nothing, because a
// missing udp makes mihomo skip that proxy for UDP and keep matching.
// An explicit false stays false. http and any other type are left untouched.
func (p proxy) clashUDP() (bool, bool) {
	if !rules.ClashUDPCapable(p.Type) {
		return false, false
	}
	if p.UDPSet && !p.UDP {
		return false, true
	}
	return true, true
}

// qxUDPTypes are the Quantumult X server types that the official sample.conf
// shows with udp-relay=true. http, https, socks5 and socks5-tls are always
// udp-relay=false there, so they are left alone.
var qxUDPTypes = map[string]bool{
	"shadowsocks": true,
	"vmess":       true,
	"vless":       true,
	"trojan":      true,
	"anytls":      true,
}

// ensureQXUDPRelay adds udp-relay=true to a native Quantumult X server line
// that does not say anything about UDP. An explicit udp-relay=false is kept.
// ShadowsocksR lines (shadowsocks with ssr-protocol) are left alone.
func ensureQXUDPRelay(line string) string {
	head, rest, ok := strings.Cut(line, "=")
	if !ok || !qxUDPTypes[strings.ToLower(strings.TrimSpace(head))] {
		return line
	}
	parts := strings.Split(rest, ",")
	tagAt := -1
	for i, part := range parts {
		key, _, found := strings.Cut(part, "=")
		if !found {
			continue
		}
		switch strings.ToLower(strings.TrimSpace(key)) {
		case "udp-relay", "ssr-protocol":
			return line
		case "tag":
			if tagAt < 0 {
				tagAt = i
			}
		}
	}
	if tagAt < 0 {
		return strings.TrimRight(line, " ") + ", udp-relay=true"
	}
	out := make([]string, 0, len(parts)+1)
	out = append(out, parts[:tagAt]...)
	out = append(out, " udp-relay=true")
	out = append(out, parts[tagAt:]...)
	return head + "=" + strings.Join(out, ",")
}

func qxLine(typ, host string, port int, opts [][2]string, tag string) string {
	var b strings.Builder
	b.WriteString(typ)
	b.WriteByte('=')
	b.WriteString(host)
	b.WriteByte(':')
	b.WriteString(strconv.Itoa(port))
	for _, opt := range opts {
		b.WriteString(", ")
		b.WriteString(opt[0])
		b.WriteByte('=')
		b.WriteString(opt[1])
	}
	b.WriteString(", tag=")
	b.WriteString(cleanName(tag))
	return b.String()
}

func srLine(name, typ, host string, port int, opts [][2]string) string {
	var b strings.Builder
	b.WriteString(cleanName(name))
	b.WriteString(" = ")
	b.WriteString(typ)
	b.WriteString(", ")
	b.WriteString(host)
	b.WriteString(", ")
	b.WriteString(strconv.Itoa(port))
	for _, opt := range opts {
		b.WriteString(", ")
		b.WriteString(opt[0])
		b.WriteByte('=')
		b.WriteString(opt[1])
	}
	return b.String()
}

func srPositional(name, typ, host string, port int, fields []string) string {
	var b strings.Builder
	b.WriteString(cleanName(name))
	b.WriteString(" = ")
	b.WriteString(typ)
	b.WriteString(", ")
	b.WriteString(host)
	b.WriteString(", ")
	b.WriteString(strconv.Itoa(port))
	for _, field := range fields {
		if field == "" {
			continue
		}
		b.WriteString(", ")
		b.WriteString(field)
	}
	return b.String()
}

func optMap(text string) map[string]string {
	out := map[string]string{}
	for _, part := range strings.Split(text, ",") {
		part = strings.TrimSpace(part)
		key, value, ok := strings.Cut(part, "=")
		if !ok {
			continue
		}
		out[strings.ToLower(strings.TrimSpace(key))] = strings.TrimSpace(value)
	}
	return out
}

func splitHostPort(spec string) (string, int, bool) {
	if strings.HasPrefix(spec, "[") {
		end := strings.Index(spec, "]")
		if end < 0 || end+2 >= len(spec) || spec[end+1] != ':' {
			return "", 0, false
		}
		port, err := strconv.Atoi(spec[end+2:])
		if err != nil {
			return "", 0, false
		}
		return spec[1:end], port, true
	}
	host, portText, ok := strings.Cut(spec, ":")
	if !ok {
		return "", 0, false
	}
	if strings.Count(spec, ":") > 1 {
		i := strings.LastIndex(spec, ":")
		host, portText = spec[:i], spec[i+1:]
	}
	port, err := strconv.Atoi(portText)
	if err != nil {
		return "", 0, false
	}
	return host, port, true
}

func cleanRemote(line string) (string, bool) {
	if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") {
		return "", false
	}
	raw := line
	if comma := strings.IndexByte(line, ','); comma >= 0 {
		raw = strings.TrimSpace(line[:comma])
	}
	if err := Screen(raw); err != nil {
		return "", false
	}
	return line, true
}

func remoteURLs(lines []string) []string {
	var out []string
	for _, line := range lines {
		raw := line
		if comma := strings.IndexByte(line, ','); comma >= 0 {
			raw = strings.TrimSpace(line[:comma])
		}
		if err := Screen(raw); err == nil {
			out = append(out, raw)
		}
	}
	return uniqueStrings(out)
}

func remoteLine(raw string, n int) string {
	tag := "airport"
	if n > 0 {
		tag = "airport-" + strconv.Itoa(n+1)
	}
	return raw + ", tag=" + tag + ", update-interval=86400, opt-parser=true, enabled=true"
}

func filterQXDNS(lines []string) []string {
	var out []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if acceptDNS(line) {
			out = append(out, line)
		}
	}
	return out
}

func acceptDNS(line string) bool {
	if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "//") {
		return false
	}
	lower := strings.ToLower(line)
	if strings.Contains(line, "[") || strings.Contains(lower, "passphrase") || strings.Contains(lower, "p12") {
		return false
	}
	switch {
	case line == "no-ipv6" || line == "no-system" || line == "prefer-doh3":
		return true
	case strings.HasPrefix(line, "server="):
		return dnsServerValue(strings.TrimSpace(strings.TrimPrefix(line, "server=")))
	case strings.HasPrefix(line, "doh-server="), strings.HasPrefix(line, "doh3-server="):
		return dnsDoHValue(strings.TrimSpace(line[strings.IndexByte(line, '=')+1:]))
	case strings.HasPrefix(line, "alias="):
		return dnsAliasValue(strings.TrimSpace(strings.TrimPrefix(line, "alias=")))
	default:
		return false
	}
}

func dnsServerValue(value string) bool {
	if value == "" || strings.ContainsAny(value, " \t") {
		return false
	}
	if strings.HasPrefix(value, "/") {
		pattern, target, ok := strings.Cut(strings.TrimPrefix(value, "/"), "/")
		if !ok || strings.Contains(target, "/") || !dnsName(pattern) {
			return false
		}
		if target == "system" {
			return true
		}
		return publicIP(target)
	}
	return publicIP(value)
}

func publicIP(target string) bool {
	host := target
	if h, _, err := net.SplitHostPort(target); err == nil {
		host = h
	}
	ip := net.ParseIP(host)
	return ip != nil && !rejectedIP(ip)
}

func dnsDoHValue(value string) bool {
	if value == "" {
		return false
	}
	urls := 0
	for _, part := range strings.Split(value, ",") {
		part = strings.TrimSpace(part)
		if part == "" {
			return false
		}
		if strings.HasPrefix(part, "https://") || strings.HasPrefix(part, "http://") {
			if Screen(part) != nil {
				return false
			}
			urls++
			continue
		}
		key, raw, ok := strings.Cut(part, "=")
		if !ok {
			return false
		}
		key = strings.ToLower(strings.TrimSpace(key))
		raw = strings.TrimSpace(raw)
		switch key {
		case "exclude", "include", "tag":
			if raw == "" || strings.ContainsAny(raw, " \t") {
				return false
			}
		case "exclude-from":
			if Screen(raw) != nil {
				return false
			}
		default:
			return false
		}
	}
	return urls > 0
}

func dnsAliasValue(value string) bool {
	if !strings.HasPrefix(value, "/") || strings.ContainsAny(value, " \t") {
		return false
	}
	left, right, ok := strings.Cut(strings.TrimPrefix(value, "/"), "/")
	if !ok || strings.Contains(right, "/") {
		return false
	}
	return dnsName(left) && dnsName(right)
}

func dnsName(pattern string) bool {
	if pattern == "" || len(pattern) > 253 || strings.ContainsAny(pattern, " \t/?#@") {
		return false
	}
	body := pattern
	if strings.HasPrefix(body, "*.") {
		body = strings.TrimPrefix(body, "*.")
	}
	if body == "" || strings.Contains(body, "*") || strings.HasPrefix(body, ".") || strings.HasSuffix(body, ".") || strings.Contains(body, "..") {
		return false
	}
	for _, r := range body {
		switch {
		case r >= 'a' && r <= 'z', r >= 'A' && r <= 'Z', r >= '0' && r <= '9', r == '.', r == '-', r == '_':
		default:
			return false
		}
	}
	return true
}

func srDNSToQX(line string) []string {
	_, value, ok := strings.Cut(line, "=")
	if !ok {
		return nil
	}
	var out []string
	for _, part := range strings.Split(value, ",") {
		part = strings.TrimSpace(part)
		if part == "" || strings.EqualFold(part, "system") {
			continue
		}
		if strings.HasPrefix(part, "https://") || strings.HasPrefix(part, "http://") {
			candidate := "doh-server=" + part
			if acceptDNS(candidate) {
				out = append(out, candidate)
			}
			continue
		}
		candidate := "server=" + part
		if acceptDNS(candidate) {
			out = append(out, candidate)
		}
	}
	return out
}

func dnsServerLine(lines []string) string {
	var parts []string
	for _, line := range lines {
		switch {
		case strings.HasPrefix(line, "server="):
			value := strings.TrimPrefix(line, "server=")
			if strings.Contains(value, "/") {
				continue
			}
			parts = append(parts, value)
		case strings.HasPrefix(line, "doh-server="), strings.HasPrefix(line, "doh3-server="):
			parts = append(parts, line[strings.IndexByte(line, '=')+1:])
		}
	}
	if len(parts) == 0 {
		return ""
	}
	return "dns-server = " + strings.Join(parts, ", ")
}

func cleanClashDNS(raw map[string]any) map[string]any {
	if len(raw) == 0 {
		return nil
	}
	out := map[string]any{}
	if v, ok := asBool(raw["ipv6"]); ok && !v {
		out["ipv6"] = false
	}
	if mode, ok := asString(raw["enhanced-mode"]); ok && (mode == "fake-ip" || mode == "redir-host") {
		out["enhanced-mode"] = mode
	}
	if cidr, ok := asString(raw["fake-ip-range"]); ok {
		if _, _, err := net.ParseCIDR(cidr); err == nil {
			out["fake-ip-range"] = cidr
		}
	}
	if filters := stringList(raw["fake-ip-filter"]); len(filters) > 0 {
		out["fake-ip-filter"] = filters
	}
	if v, ok := asBool(raw["respect-rules"]); ok {
		out["respect-rules"] = v
	}
	for _, key := range []string{"nameserver", "fallback", "default-nameserver", "proxy-server-nameserver"} {
		if list := dnsList(raw[key]); len(list) > 0 {
			out[key] = list
		}
	}
	if policy := dnsPolicy(raw["nameserver-policy"]); len(policy) > 0 {
		out["nameserver-policy"] = policy
	}
	if len(out) == 0 {
		return nil
	}
	out["enable"] = true
	return out
}

func clashToQXDNS(raw map[string]any) []string {
	if len(raw) == 0 {
		return nil
	}
	var out []string
	if v, ok := raw["ipv6"].(bool); ok && !v {
		out = append(out, "no-ipv6")
	}
	for _, key := range []string{"nameserver", "fallback", "default-nameserver"} {
		for _, item := range dnsList(raw[key]) {
			if strings.HasPrefix(item, "https://") || strings.HasPrefix(item, "http://") {
				out = append(out, "doh-server="+item)
				continue
			}
			out = append(out, "server="+item)
		}
	}
	for domain, server := range dnsPolicy(raw["nameserver-policy"]) {
		out = append(out, "server=/*."+domain+"/"+server)
	}
	return uniqueStrings(out)
}

func qxToClashDNS(lines []string) map[string]any {
	if len(lines) == 0 {
		return nil
	}
	out := map[string]any{"enable": true}
	var servers []string
	policy := map[string]string{}
	for _, line := range lines {
		switch {
		case line == "no-ipv6":
			out["ipv6"] = false
		case strings.HasPrefix(line, "doh-server="), strings.HasPrefix(line, "doh3-server="):
			servers = append(servers, line[strings.IndexByte(line, '=')+1:])
		case strings.HasPrefix(line, "server="):
			value := strings.TrimPrefix(line, "server=")
			if strings.HasPrefix(value, "/*.") && strings.Count(value, "/") >= 2 {
				rest := strings.TrimPrefix(value, "/*.")
				domain, server, ok := strings.Cut(rest, "/")
				if ok && domain != "" && net.ParseIP(server) != nil {
					policy[domain] = server
				}
				continue
			}
			servers = append(servers, value)
		}
	}
	if len(servers) > 0 {
		out["nameserver"] = servers
	}
	if len(policy) > 0 {
		out["nameserver-policy"] = policy
	}
	if len(out) == 1 {
		return nil
	}
	return out
}

func dnsList(raw any) []string {
	var out []string
	for _, item := range stringList(raw) {
		if strings.HasPrefix(item, "https://") || strings.HasPrefix(item, "http://") {
			if Screen(item) == nil {
				out = append(out, item)
			}
			continue
		}
		if acceptDNS("server=" + item) {
			out = append(out, item)
		}
	}
	return out
}

func dnsPolicy(raw any) map[string]string {
	mapped := map[string]any{}
	switch src := raw.(type) {
	case map[string]any:
		mapped = src
	case map[string]string:
		for key, value := range src {
			mapped[key] = value
		}
	default:
		return nil
	}
	out := map[string]string{}
	for key, value := range mapped {
		server, ok := asString(value)
		if !ok {
			continue
		}
		domain := strings.TrimSpace(key)
		domain = strings.Trim(domain, "'\"")
		lower := strings.ToLower(domain)
		if strings.Contains(lower, "geosite") || strings.Contains(domain, "*") || strings.Contains(domain, ",") {
			continue
		}
		domain = strings.TrimPrefix(domain, "+.")
		domain = strings.TrimPrefix(domain, ".")
		if domain == "" || strings.ContainsAny(domain, " /") {
			continue
		}
		if !acceptDNS("server="+server) && Screen(server) != nil {
			continue
		}
		if strings.HasPrefix(server, "https://") || strings.HasPrefix(server, "http://") {
			continue
		}
		out[domain] = server
	}
	return out
}

func stringList(raw any) []string {
	switch list := raw.(type) {
	case []any:
		var out []string
		for _, item := range list {
			if text, ok := asString(item); ok {
				text = strings.Trim(strings.TrimSpace(text), "'\"")
				if text != "" {
					out = append(out, text)
				}
			}
		}
		return out
	case []string:
		return list
	default:
		return nil
	}
}

func looksHTML(body string) bool {
	head := strings.ToLower(strings.TrimSpace(body))
	if len(head) > 240 {
		head = head[:240]
	}
	return strings.Contains(head, "<!doctype") || strings.Contains(head, "<html")
}

func decodeText(body string) (string, bool) {
	compact := compactBase64(body)
	if len(compact) < 16 {
		return "", false
	}
	decoded, ok := decodeBase64(compact)
	if !ok {
		return "", false
	}
	text := normalize(decoded)
	if strings.Contains(text, "[") || strings.Contains(text, "://") || strings.Contains(text, "proxies:") || strings.Contains(text, "server=") {
		return text, true
	}
	return "", false
}

func decodeBase64(raw string) (string, bool) {
	compact := compactBase64(raw)
	if compact == "" {
		return "", false
	}
	for _, r := range compact {
		switch {
		case r >= 'A' && r <= 'Z', r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '+', r == '/', r == '=', r == '-', r == '_':
		default:
			return "", false
		}
	}
	decoded, err := base64.StdEncoding.DecodeString(padBase64(compact))
	if err != nil {
		decoded, err = base64.RawStdEncoding.DecodeString(strings.TrimRight(compact, "="))
	}
	if err != nil {
		decoded, err = base64.URLEncoding.DecodeString(padBase64(compact))
	}
	if err != nil || len(decoded) == 0 {
		return "", false
	}
	return string(decoded), true
}

func compactBase64(raw string) string {
	return strings.Map(func(r rune) rune {
		if r == '\n' || r == '\r' || r == '\t' || r == ' ' {
			return -1
		}
		return r
	}, strings.TrimSpace(raw))
}

func padBase64(s string) string {
	if pad := len(s) % 4; pad != 0 {
		s += strings.Repeat("=", 4-pad)
	}
	return s
}

func cleanName(name string) string {
	name = strings.TrimSpace(name)
	name = strings.ReplaceAll(name, "\n", "")
	name = strings.ReplaceAll(name, "\r", "")
	name = strings.ReplaceAll(name, ",", " ")
	name = strings.ReplaceAll(name, "=", " ")
	name = strings.ReplaceAll(name, "[", "")
	name = strings.ReplaceAll(name, "]", "")
	name = stripEmoji(name)
	name = strings.Join(strings.Fields(name), " ")
	runes := []rune(name)
	if len(runes) > 80 {
		name = string(runes[:80])
	}
	if name == "" {
		return ""
	}
	return name
}

func stripEmoji(name string) string {
	return strings.Map(func(r rune) rune {
		if r == 0xFE0F || r == 0xFE0E || r == 0x200D || r == 0x20E3 || (r >= 0x2600 && r <= 0x27BF) || (r >= 0x2B00 && r <= 0x2BFF) || r >= 0x1F000 {
			return -1
		}
		return r
	}, name)
}

func cleanValue(value string) string {
	value = strings.TrimSpace(value)
	value = strings.ReplaceAll(value, "\n", "")
	value = strings.ReplaceAll(value, "\r", "")
	value = strings.ReplaceAll(value, ",", "")
	return value
}

func hostOK(host string) bool {
	host = strings.TrimSuffix(strings.TrimSpace(host), ".")
	if host == "" || strings.ContainsAny(host, " \t/#?\\") {
		return false
	}
	lower := strings.ToLower(host)
	if lower == "localhost" || strings.HasSuffix(lower, ".localhost") || strings.HasSuffix(lower, ".local") {
		return false
	}
	if ip := net.ParseIP(host); ip != nil {
		if ip.IsLoopback() || ip.IsUnspecified() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() {
			return false
		}
		if ip4 := ip.To4(); ip4 != nil && ip4[0] == 169 && ip4[1] == 254 && ip4[2] == 169 && ip4[3] == 254 {
			return false
		}
	}
	return true
}

func portOK(port int) bool { return port > 0 && port <= 65535 }

func boolOpt(value string) bool {
	switch strings.ToLower(strings.TrimSpace(value)) {
	case "1", "true", "yes", "on":
		return true
	default:
		return false
	}
}

func headerHost(value string) string {
	value = strings.TrimSpace(value)
	lower := strings.ToLower(value)
	if strings.HasPrefix(lower, "host:") {
		return cleanValue(value[5:])
	}
	return ""
}

func first(values ...string) string {
	for _, value := range values {
		if strings.TrimSpace(value) != "" {
			return value
		}
	}
	return ""
}

func uniqueStrings(lines []string) []string {
	seen := map[string]struct{}{}
	var out []string
	for _, line := range lines {
		if line == "" {
			continue
		}
		if _, ok := seen[line]; ok {
			continue
		}
		seen[line] = struct{}{}
		out = append(out, line)
	}
	return out
}

func cloneMap(src map[string]any) map[string]any {
	out := make(map[string]any, len(src))
	for key, value := range src {
		out[key] = value
	}
	return out
}

func asString(value any) (string, bool) {
	switch v := value.(type) {
	case string:
		return strings.TrimSpace(v), true
	case int:
		return strconv.Itoa(v), true
	case int64:
		return strconv.FormatInt(v, 10), true
	case uint64:
		return strconv.FormatUint(v, 10), true
	case float64:
		if v == float64(int(v)) {
			return strconv.Itoa(int(v)), true
		}
		return strconv.FormatFloat(v, 'f', -1, 64), true
	default:
		return "", false
	}
}

func asInt(value any) (int, bool) {
	switch v := value.(type) {
	case int:
		return v, true
	case int64:
		return int(v), true
	case uint64:
		return int(v), true
	case float64:
		return int(v), true
	case json.Number:
		n, err := v.Int64()
		return int(n), err == nil
	case string:
		n, err := strconv.Atoi(strings.TrimSpace(v))
		return n, err == nil
	default:
		return 0, false
	}
}

func asBool(value any) (bool, bool) {
	switch v := value.(type) {
	case bool:
		return v, true
	case string:
		return boolOpt(v), v != ""
	default:
		return false, false
	}
}
