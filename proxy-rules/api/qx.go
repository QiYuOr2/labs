package handler

import (
	"bufio"
	"context"
	"encoding/base64"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
	"unicode"
)

const parserURL = "https://raw.githubusercontent.com/KOP-XIAO/QuantumultX/master/Scripts/resource-parser.js"

// MergeQuantumultX copies DNS and nodes from subscription into base.
// Policies, filters, rewrites, and the certificate section of base are kept.
// sourceURL is used only when the subscription does not already contain nodes.
func MergeQuantumultX(base, subscription, sourceURL string) (string, error) {
	if strings.TrimSpace(base) == "" {
		return "", fmt.Errorf("规则配置是空的")
	}
	if err := screenURL(sourceURL); err != nil {
		return "", err
	}
	body := normalize(subscription)
	dns, local, remote := extract(body)
	if len(local) == 0 && len(remote) == 0 {
		if decoded, ok := decodeBase64(body); ok {
			dns2, local2, remote2 := extract(decoded)
			if len(dns) == 0 {
				dns = dns2
			}
			local, remote = local2, remote2
		}
	}
	if len(dns) == 0 {
		dns = clashDNS(body)
	}
	if len(local) == 0 && len(remote) == 0 {
		remote = []string{remoteLine(sourceURL)}
	}
	merged, err := replaceSection(base, "dns", strings.Join(dns, "\n"))
	if err != nil {
		return "", err
	}
	merged, err = replaceSection(merged, "server_local", strings.Join(local, "\n"))
	if err != nil {
		return "", err
	}
	merged, err = replaceSection(merged, "server_remote", strings.Join(remote, "\n"))
	if err != nil {
		return "", err
	}
	if len(remote) > 0 {
		merged, err = replaceSection(merged, "general", "resource_parser_url="+parserURL)
		if err != nil {
			return "", err
		}
	}
	return merged, nil
}

func extract(body string) (dns, local, remote []string) {
	sections := splitSections(body)
	if len(sections) > 0 {
		dns = filterDNS(sections["dns"])
		local = filterServers(sections["server_local"])
		remote = filterRemotes(sections["server_remote"])
		return dns, local, remote
	}
	return nil, filterServers(strings.Split(body, "\n")), nil
}

func splitSections(body string) map[string][]string {
	sections := make(map[string][]string)
	var name string
	found := false
	for _, line := range strings.Split(body, "\n") {
		trimmed := strings.TrimSpace(line)
		if isHeader(trimmed) {
			name = strings.ToLower(trimmed[1 : len(trimmed)-1])
			if _, ok := sections[name]; !ok {
				sections[name] = nil
			}
			found = true
			continue
		}
		if name != "" {
			sections[name] = append(sections[name], line)
		}
	}
	if !found {
		return nil
	}
	return sections
}

func isHeader(line string) bool {
	if len(line) < 3 || line[0] != '[' || line[len(line)-1] != ']' {
		return false
	}
	for _, r := range line[1 : len(line)-1] {
		if !unicode.IsLetter(r) && !unicode.IsDigit(r) && r != '_' && r != '-' {
			return false
		}
	}
	return true
}

func filterDNS(lines []string) []string {
	var out []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if keepDNS(line) {
			out = append(out, line)
		}
	}
	return out
}

func keepDNS(line string) bool {
	if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "//") {
		return false
	}
	if strings.Contains(line, "[") || strings.Contains(strings.ToLower(line), "passphrase") || strings.Contains(strings.ToLower(line), "p12") {
		return false
	}
	switch {
	case line == "no-ipv6" || line == "no-system" || line == "prefer-doh3":
		return true
	case strings.HasPrefix(line, "server="), strings.HasPrefix(line, "doh-server="), strings.HasPrefix(line, "doh3-server="):
		return dnsTargetOK(line)
	default:
		return false
	}
}

func dnsTargetOK(line string) bool {
	value := strings.TrimSpace(line[strings.IndexByte(line, '=')+1:])
	if value == "" || strings.ContainsAny(value, " \t") {
		return false
	}
	if strings.HasPrefix(line, "doh-server=") || strings.HasPrefix(line, "doh3-server=") {
		parsed, err := url.Parse(value)
		if err != nil || (parsed.Scheme != "https" && parsed.Scheme != "http") || parsed.Host == "" {
			return false
		}
		return hostNameAllowed(parsed.Hostname())
	}
	target := value
	if slash := strings.LastIndex(value, "/"); slash >= 0 {
		target = value[slash+1:]
	}
	host := target
	if h, _, err := net.SplitHostPort(target); err == nil {
		host = h
	}
	ip := net.ParseIP(host)
	return ip != nil && !rejectedIP(ip)
}

func filterServers(lines []string) []string {
	var out []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if isServerLine(line) {
			out = append(out, line)
		}
	}
	return out
}

func isServerLine(line string) bool {
	if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") || strings.Contains(line, "[") {
		return false
	}
	lower := strings.ToLower(line)
	if strings.Contains(lower, "passphrase") || strings.Contains(lower, "p12") {
		return false
	}
	for _, prefix := range []string{
		"shadowsocks=",
		"shadowsocksr=",
		"vmess=",
		"vless=",
		"trojan=",
		"http=",
		"https=",
		"socks5=",
		"socks5-tls=",
	} {
		if strings.HasPrefix(lower, prefix) {
			return true
		}
	}
	return false
}

func filterRemotes(lines []string) []string {
	var out []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") {
			continue
		}
		raw := line
		if comma := strings.IndexByte(line, ','); comma >= 0 {
			raw = strings.TrimSpace(line[:comma])
		}
		if err := screenURL(raw); err != nil {
			continue
		}
		out = append(out, line)
	}
	return out
}

func remoteLine(sourceURL string) string {
	return sourceURL + ", tag=subscription, update-interval=86400, opt-parser=true, enabled=true"
}

func clashDNS(body string) []string {
	scanner := bufio.NewScanner(strings.NewReader(body))
	var lines []string
	inDNS := false
	for scanner.Scan() {
		line := scanner.Text()
		trimmed := strings.TrimSpace(line)
		indent := len(line) - len(strings.TrimLeft(line, " "))
		if !inDNS {
			if trimmed == "dns:" && indent == 0 {
				inDNS = true
			}
			continue
		}
		if trimmed == "" || strings.HasPrefix(trimmed, "#") {
			continue
		}
		if indent == 0 {
			break
		}
		lines = append(lines, trimmed)
	}
	if len(lines) == 0 {
		return nil
	}
	var out []string
	mode := ""
	for _, line := range lines {
		switch {
		case line == "ipv6: false":
			out = append(out, "no-ipv6")
			mode = ""
		case line == "nameserver:" || line == "fallback:" || line == "default-nameserver:":
			mode = "list"
		case line == "nameserver-policy:":
			mode = "policy"
		case strings.HasPrefix(line, "- ") && mode == "list":
			if dnsLine, ok := clashServer(strings.TrimSpace(strings.TrimPrefix(line, "- "))); ok {
				out = append(out, dnsLine)
			}
		case mode == "policy" && strings.Contains(line, ":"):
			if policy, ok := clashPolicy(line); ok {
				out = append(out, policy)
			}
		default:
			if !strings.HasPrefix(line, "- ") && strings.HasSuffix(line, ":") {
				mode = ""
			}
		}
	}
	return unique(out)
}

func clashServer(value string) (string, bool) {
	value = strings.Trim(value, `"'`)
	if strings.HasPrefix(value, "https://") || strings.HasPrefix(value, "http://") {
		line := "doh-server=" + value
		if keepDNS(line) {
			return line, true
		}
		return "", false
	}
	line := "server=" + value
	if keepDNS(line) {
		return line, true
	}
	return "", false
}

func clashPolicy(line string) (string, bool) {
	key, value, ok := strings.Cut(line, ":")
	if !ok {
		return "", false
	}
	key = strings.Trim(strings.TrimSpace(key), `"'`)
	value = strings.Trim(strings.TrimSpace(value), `"'`)
	if key == "" || strings.Contains(key, "*") || strings.Contains(strings.ToLower(key), "geosite") {
		return "", false
	}
	key = strings.TrimPrefix(key, "+.")
	key = strings.TrimPrefix(key, ".")
	if strings.ContainsAny(key, " /") {
		return "", false
	}
	candidate := "server=/*." + key + "/" + value
	if keepDNS(candidate) {
		return candidate, true
	}
	return "", false
}

func unique(lines []string) []string {
	seen := make(map[string]struct{}, len(lines))
	var out []string
	for _, line := range lines {
		if _, ok := seen[line]; ok {
			continue
		}
		seen[line] = struct{}{}
		out = append(out, line)
	}
	return out
}

func decodeBase64(body string) (string, bool) {
	compact := strings.Map(func(r rune) rune {
		if r == '\n' || r == '\r' || r == '\t' || r == ' ' {
			return -1
		}
		return r
	}, body)
	if len(compact) < 16 || len(compact)%4 != 0 {
		return "", false
	}
	for _, r := range compact {
		switch {
		case r >= 'A' && r <= 'Z', r >= 'a' && r <= 'z', r >= '0' && r <= '9', r == '+', r == '/', r == '=':
		default:
			return "", false
		}
	}
	decoded, err := base64.StdEncoding.DecodeString(compact)
	if err != nil {
		return "", false
	}
	text := normalize(string(decoded))
	if strings.Contains(text, "[") || strings.Contains(text, "://") {
		return text, true
	}
	return "", false
}

func normalize(body string) string {
	body = strings.TrimPrefix(body, "\uFEFF")
	body = strings.ReplaceAll(body, "\r\n", "\n")
	body = strings.ReplaceAll(body, "\r", "\n")
	return body
}

func replaceSection(config, name, body string) (string, error) {
	lines := strings.Split(config, "\n")
	header := "[" + name + "]"
	start := -1
	for i, line := range lines {
		if strings.TrimSpace(line) == header {
			start = i
			break
		}
	}
	if start < 0 {
		return "", fmt.Errorf("规则配置里没有 %s", header)
	}
	end := len(lines)
	for i := start + 1; i < len(lines); i++ {
		if isHeader(strings.TrimSpace(lines[i])) {
			end = i
			break
		}
	}
	var b strings.Builder
	for i := 0; i <= start; i++ {
		b.WriteString(lines[i])
		b.WriteByte('\n')
	}
	if body != "" {
		b.WriteString(body)
		if !strings.HasSuffix(body, "\n") {
			b.WriteByte('\n')
		}
		b.WriteByte('\n')
	}
	for i := end; i < len(lines); i++ {
		b.WriteString(lines[i])
		if i != len(lines)-1 {
			b.WriteByte('\n')
		}
	}
	return b.String(), nil
}

const maxBody = 8 << 20

// ScreenURL reports whether raw is safe for this service to fetch.
// It allows public http(s) URLs and rejects local, private, and link-local targets.
func ScreenURL(raw string) error {
	return screenURL(raw)
}

func screenURL(raw string) error {
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Host == "" {
		return fmt.Errorf("订阅链接无效")
	}
	if parsed.Scheme != "https" && parsed.Scheme != "http" {
		return fmt.Errorf("订阅链接无效")
	}
	if strings.Contains(raw, ",") {
		return fmt.Errorf("订阅链接无效")
	}
	if !hostNameAllowed(parsed.Hostname()) {
		return fmt.Errorf("订阅链接无效")
	}
	if ip := net.ParseIP(parsed.Hostname()); ip != nil && rejectedIP(ip) {
		return fmt.Errorf("订阅链接无效")
	}
	return nil
}

func hostNameAllowed(host string) bool {
	host = strings.ToLower(strings.TrimSuffix(host, "."))
	if host == "" || host == "localhost" || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") {
		return false
	}
	switch host {
	case "metadata.google.internal", "metadata.google.com":
		return false
	default:
		return true
	}
}

func rejectedIP(ip net.IP) bool {
	if ip == nil || ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() {
		return true
	}
	ip4 := ip.To4()
	if ip4 == nil {
		return false
	}
	if ip4[0] == 0 {
		return true
	}
	// Carrier-grade NAT and cloud metadata live outside the private ranges.
	if ip4[0] == 100 && ip4[1]&0xc0 == 64 {
		return true
	}
	return false
}

// GetText downloads a public URL with a size cap.
// Redirects are checked again so a public URL cannot hop to a local address.
func GetText(ctx context.Context, raw string) (string, error) {
	if err := screenURL(raw); err != nil {
		return "", err
	}
	dialer := &net.Dialer{Timeout: 5 * time.Second}
	transport := &http.Transport{
		Proxy: nil,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}
			ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
			if err != nil {
				return nil, err
			}
			var last error
			for _, ip := range ips {
				if rejectedIP(ip.IP) {
					last = errors.New("地址不可用")
					continue
				}
				conn, err := dialer.DialContext(ctx, network, net.JoinHostPort(ip.IP.String(), port))
				if err == nil {
					return conn, nil
				}
				last = err
			}
			if last == nil {
				last = errors.New("地址不可用")
			}
			return nil, last
		},
	}
	client := &http.Client{
		Timeout:   8 * time.Second,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return errors.New("重定向过多")
			}
			return screenURL(req.URL.String())
		},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, raw, nil)
	if err != nil {
		return "", fmt.Errorf("订阅链接无效")
	}
	req.Header.Set("User-Agent", "labs-proxy-rules")
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("订阅下载失败")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("订阅下载失败")
	}
	payload, err := io.ReadAll(io.LimitReader(resp.Body, maxBody+1))
	if err != nil {
		return "", fmt.Errorf("订阅下载失败")
	}
	if len(payload) > maxBody {
		return "", fmt.Errorf("订阅内容过大")
	}
	return string(payload), nil
}

var fetchText = GetText

const defaultProfileURL = "https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/quantumultx.conf"

// Handler is the Vercel function entry. Quantumult X calls /api/qx?url=...
func Handler(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "只接受 GET", http.StatusMethodNotAllowed)
		return
	}
	raw := r.URL.Query().Get("url")
	if raw == "" {
		http.Error(w, "缺少 url", http.StatusBadRequest)
		return
	}
	if err := screenURL(raw); err != nil {
		http.Error(w, "订阅链接无效", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 8*time.Second)
	defer cancel()
	base, err := profile(ctx)
	if err != nil {
		http.Error(w, "规则配置下载失败", http.StatusBadGateway)
		return
	}
	subscription, err := fetchText(ctx, raw)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadGateway)
		return
	}
	merged, err := MergeQuantumultX(base, subscription, raw)
	if err != nil {
		http.Error(w, "合并失败", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodHead {
		return
	}
	_, _ = w.Write([]byte(merged))
}

var (
	profileMu   sync.Mutex
	profileBody string
	profileAt   time.Time
)

func profile(ctx context.Context) (string, error) {
	profileMu.Lock()
	defer profileMu.Unlock()
	if profileBody != "" && time.Since(profileAt) < 10*time.Minute {
		return profileBody, nil
	}
	body, err := fetchText(ctx, profileURL())
	if err != nil {
		if profileBody != "" {
			return profileBody, nil
		}
		return "", err
	}
	for _, name := range []string{"general", "dns", "server_remote", "server_local"} {
		if _, err := replaceSection(body, name, ""); err != nil {
			return "", err
		}
	}
	profileBody = body
	profileAt = time.Now()
	return body, nil
}

func profileURL() string {
	if value := os.Getenv("RULES_PROFILE_URL"); value != "" {
		return value
	}
	return defaultProfileURL
}
