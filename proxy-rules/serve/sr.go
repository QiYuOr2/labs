package serve

import (
	"context"
	"net/http"
	"net/url"
	"os"
	"strings"
	"time"

	"github.com/QiYuOr2/labs/proxy-rules/internal/rules"
)

const (
	srBanner          = "# 分流名单已展开进 [Rule]，策略沿用原来的 RULE-SET。\n"
	defaultSRProfile  = "https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/shadowrocket.conf"
	defaultPublicBase = "https://proxy-rules.vercel.app"
	profileTTL        = 10 * time.Minute
)

// Shadowrocket writes one Shadowrocket config. Rule lists are inlined.
// A url query copies [Proxy] lines when the subscription is already a Shadowrocket config.
func Shadowrocket(w http.ResponseWriter, r *http.Request) {
	if !allowGET(w, r) {
		return
	}
	raw := r.URL.Query().Get("url")
	if raw != "" {
		if err := Screen(raw); err != nil {
			http.Error(w, "订阅链接无效", http.StatusBadRequest)
			return
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), 40*time.Second)
	defer cancel()
	base, err := LoadText(ctx, srProfileURL(), profileTTL)
	if err != nil {
		http.Error(w, "规则配置下载失败", http.StatusBadGateway)
		return
	}
	body, _ := expandShadowrocket(ctx, base)
	if raw != "" {
		subscription, err := LoadText(ctx, raw, time.Minute)
		if err != nil {
			http.Error(w, err.Error(), http.StatusBadGateway)
			return
		}
		body = mergeShadowrocket(body, subscription)
	} else {
		body = ensureShadowrocketLeak(body)
	}
	body = setUpdateURL(body, publicSR(raw))
	writeText(w, r, "text/plain; charset=utf-8", body)
}

func srProfileURL() string {
	if value := os.Getenv("RULES_SR_URL"); value != "" {
		return value
	}
	return defaultSRProfile
}

func publicBase() string {
	if value := os.Getenv("RULES_PUBLIC_BASE"); value != "" {
		return strings.TrimRight(value, "/")
	}
	return defaultPublicBase
}

func publicSR(raw string) string {
	base := publicBase() + "/api/sr"
	if raw == "" {
		return base
	}
	return base + "?url=" + url.QueryEscape(raw)
}

func expandShadowrocket(ctx context.Context, config string) (string, bool) {
	sections := splitSections(config)
	if sections == nil {
		return config, false
	}
	var refs []Ref
	type slot struct {
		remote int
		line   string
	}
	var slots []slot
	for _, line := range sections["rule"] {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if raw, policy, ok := ruleSet(line); ok {
			slots = append(slots, slot{remote: len(refs)})
			refs = append(refs, Ref{URL: raw, Policy: policy})
			continue
		}
		slots = append(slots, slot{remote: -1, line: line})
	}
	if len(refs) == 0 {
		return config, false
	}
	loaded, ok := LoadLists(ctx, refs)
	if !ok {
		return config, false
	}
	seen := make(map[string]struct{})
	var b strings.Builder
	for _, slot := range slots {
		if slot.remote < 0 {
			b.WriteString(slot.line)
			b.WriteByte('\n')
			continue
		}
		for _, rule := range loaded[slot.remote] {
			line := Format(rule, refs[slot.remote].Policy)
			if _, ok := seen[line]; ok {
				continue
			}
			seen[line] = struct{}{}
			b.WriteString(line)
			b.WriteByte('\n')
		}
	}
	body := strings.TrimRight(b.String(), "\n")
	if len(body) > 3_500_000 {
		return config, false
	}
	updated, err := replaceSection(config, "Rule", body)
	if err != nil {
		return config, false
	}
	if !strings.HasPrefix(updated, srBanner) {
		updated = srBanner + updated
	}
	return updated, true
}

func ruleSet(line string) (string, string, bool) {
	parts := splitCSV(line)
	if len(parts) < 3 || !strings.EqualFold(parts[0], "RULE-SET") {
		return "", "", false
	}
	raw := parts[1]
	policy := parts[len(parts)-1]
	if !strings.HasPrefix(raw, "https://") && !strings.HasPrefix(raw, "http://") {
		return "", "", false
	}
	if policy == "" || strings.EqualFold(policy, "RULE-SET") {
		return "", "", false
	}
	return raw, policy, true
}

func setUpdateURL(config, next string) string {
	lines := strings.Split(normalize(config), "\n")
	for i, line := range lines {
		if strings.HasPrefix(strings.TrimSpace(line), "update-url =") || strings.HasPrefix(strings.TrimSpace(line), "update-url=") {
			lines[i] = "update-url = " + next
		}
	}
	return strings.Join(lines, "\n")
}

func mergeShadowrocket(config, subscription string) string {
	proxies, dns := NodesForShadowrocket(subscription)
	if len(proxies) > 0 {
		if updated, err := replaceSection(config, "Proxy", strings.Join(proxies, "\n")); err == nil {
			config = updated
		}
	}
	config = ensureShadowrocketLeak(config)
	if dns != "" {
		config = appendSRDNS(config, dns)
	}
	return config
}

// ensureShadowrocketLeak puts the leak block back after a subscription merge.
// An existing key is kept. dns-server or fallback-dns-server set to the
// system token is replaced, because that token is the ISP resolver.
func ensureShadowrocketLeak(config string) string {
	config = ensureSRGeneral(config)
	return ensureSRRules(config)
}

func ensureSRGeneral(config string) string {
	lines := strings.Split(normalize(config), "\n")
	start, end := sectionSpan(lines, "[General]")
	if start < 0 {
		return config
	}
	body := append([]string{}, lines[start+1:end]...)
	doh := rules.DomesticDoH()
	keys := map[string]bool{}
	for i, line := range body {
		key := generalKey(line)
		if key == "" {
			continue
		}
		if (key == "dns-server" || key == "fallback-dns-server") && generalValueIsSystem(line) {
			body[i] = key + " = " + doh
			line = body[i]
		}
		keys[key] = true
	}
	var add []string
	for _, line := range rules.ShadowrocketLeakGeneral() {
		key := generalKey(line)
		if keys[key] {
			continue
		}
		add = append(add, line)
		keys[key] = true
	}
	if len(add) > 0 {
		body = insertBeforeTrailingBlanks(body, add)
	}
	return joinSection(lines, start, end, body)
}

func ensureSRRules(config string) string {
	if strings.Contains(strings.ToLower(config), "domain-keyword,stun,") {
		return config
	}
	lines := strings.Split(normalize(config), "\n")
	start, end := sectionSpan(lines, "[Rule]")
	if start < 0 {
		return config
	}
	body := append(append([]string{}, rules.ShadowrocketStunRules()...), lines[start+1:end]...)
	return joinSection(lines, start, end, body)
}

func appendSRDNS(config, dns string) string {
	_, value, ok := strings.Cut(dns, "=")
	if !ok {
		return config
	}
	var extra []string
	for _, part := range splitCSV(value) {
		if srDNSPartOK(part) {
			extra = append(extra, part)
		}
	}
	if len(extra) == 0 {
		return config
	}
	lines := strings.Split(normalize(config), "\n")
	for i, line := range lines {
		if generalKey(line) != "dns-server" {
			continue
		}
		_, current, ok := strings.Cut(line, "=")
		if !ok {
			continue
		}
		have := map[string]struct{}{}
		var parts []string
		for _, part := range splitCSV(current) {
			parts = append(parts, part)
			have[strings.ToLower(part)] = struct{}{}
		}
		for _, part := range extra {
			if _, ok := have[strings.ToLower(part)]; ok {
				continue
			}
			parts = append(parts, part)
			have[strings.ToLower(part)] = struct{}{}
		}
		lines[i] = "dns-server = " + strings.Join(parts, ",")
		return strings.Join(lines, "\n")
	}
	return config
}

func srDNSPartOK(part string) bool {
	if part == "" || strings.EqualFold(part, "system") {
		return false
	}
	lower := strings.ToLower(part)
	return !strings.Contains(lower, "localhost") && !strings.Contains(lower, "127.0.0.1") && !strings.Contains(lower, "0.0.0.0")
}

func generalValueIsSystem(line string) bool {
	_, value, ok := strings.Cut(line, "=")
	if !ok {
		return false
	}
	parts := splitCSV(value)
	if len(parts) == 0 {
		return false
	}
	for _, part := range parts {
		if !strings.EqualFold(part, "system") {
			return false
		}
	}
	return true
}

func generalKey(line string) string {
	trimmed := strings.TrimSpace(line)
	if trimmed == "" || strings.HasPrefix(trimmed, "#") || strings.HasPrefix(trimmed, ";") || strings.HasPrefix(trimmed, "//") {
		return ""
	}
	key, _, ok := strings.Cut(trimmed, "=")
	if !ok {
		return ""
	}
	return strings.ToLower(strings.TrimSpace(key))
}

func sectionSpan(lines []string, header string) (int, int) {
	start := -1
	end := len(lines)
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if strings.EqualFold(trimmed, header) {
			start = i
			continue
		}
		if start >= 0 && i > start && isHeader(trimmed) {
			return start, i
		}
	}
	return start, end
}

func joinSection(lines []string, start, end int, body []string) string {
	out := append([]string{}, lines[:start+1]...)
	out = append(out, body...)
	out = append(out, lines[end:]...)
	return strings.Join(out, "\n")
}

func insertBeforeTrailingBlanks(body, add []string) []string {
	i := len(body)
	for i > 0 && strings.TrimSpace(body[i-1]) == "" {
		i--
	}
	out := append([]string{}, body[:i]...)
	out = append(out, add...)
	out = append(out, body[i:]...)
	return out
}

func shadowrocketProxies(body string) []string {
	sections := splitSections(body)
	var lines []string
	if sections != nil {
		lines = sections["proxy"]
	} else {
		lines = strings.Split(normalize(body), "\n")
	}
	var out []string
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if shadowrocketProxy(line) {
			out = append(out, line)
		}
	}
	return out
}

func shadowrocketProxy(line string) bool {
	lower := strings.ToLower(line)
	if line == "" || strings.HasPrefix(line, "#") || strings.Contains(line, "[") || strings.Contains(lower, "passphrase") || strings.Contains(lower, "p12") {
		return false
	}
	_, rest, ok := strings.Cut(line, "=")
	if !ok {
		return false
	}
	rest = strings.ToLower(strings.TrimSpace(rest))
	for _, prefix := range []string{
		"ss,", "ssr,", "vmess,", "vless,", "trojan,", "http,", "https,",
		"socks5,", "socks5-tls,", "hysteria,", "hysteria2,", "wireguard,", "tuic,",
	} {
		if strings.HasPrefix(rest, prefix) {
			return true
		}
	}
	return false
}

func shadowrocketDNS(body string) string {
	sections := splitSections(body)
	if sections == nil {
		return ""
	}
	for _, line := range sections["general"] {
		line = strings.TrimSpace(line)
		if !strings.HasPrefix(strings.ToLower(line), "dns-server") {
			continue
		}
		if dnsAllowed(line) {
			return line
		}
	}
	return ""
}

func dnsAllowed(line string) bool {
	lower := strings.ToLower(line)
	if strings.Contains(lower, "localhost") || strings.Contains(lower, "127.0.0.1") || strings.Contains(lower, "0.0.0.0") {
		return false
	}
	return strings.Contains(line, "=") && strings.TrimSpace(strings.SplitN(line, "=", 2)[1]) != ""
}
