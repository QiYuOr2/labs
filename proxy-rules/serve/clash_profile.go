package serve

import (
	"context"
	"fmt"
	"sort"
	"strconv"
	"strings"
)

// BuildClash merges an uploaded subscription into one Clash profile.
// Inline proxies win. A provider URL is kept only when the upload has no node body.
func BuildClash(ctx context.Context, subscription string) (string, error) {
	if LooksLikeHTML(subscription) {
		return "", fmt.Errorf("配置不是订阅")
	}
	proxies, remotes, dns := ClashNodes(subscription)
	if len(proxies) == 0 && len(remotes) == 0 {
		return "", fmt.Errorf("没有节点")
	}
	if len(proxies) > 0 {
		remotes = nil
	}
	base, err := LoadText(ctx, flclashProfileURL(), profileTTL)
	if err != nil {
		return "", fmt.Errorf("规则配置下载失败")
	}
	spec, err := parseSpec(base)
	if err != nil {
		return "", fmt.Errorf("规则配置下载失败")
	}
	rules, providers, inline := clashRuleLines(ctx, spec)
	if !inline {
		rules, providers = remoteClashRules(spec)
	}
	doc := clashDocument{
		MixedPort:      7890,
		AllowLan:       false,
		Mode:           "rule",
		LogLevel:       "info",
		IPv6:           false,
		DNS:            dns,
		Proxies:        proxies,
		ProxyProviders: clashProviders(remotes),
		ProxyGroups:    clashGroups(spec, len(remotes) > 0),
		RuleProviders:  providers,
		Rules:          rules,
	}
	if doc.Proxies == nil {
		doc.Proxies = []map[string]any{}
	}
	note := "# 节点来自上传的配置，分流用维护的规则。要换节点就重新上传。\n"
	if len(remotes) > 0 {
		note = "# 上传的文件里只有订阅地址，节点仍由客户端自己更新。分流用维护的规则。\n"
	}
	return note + emitClash(doc), nil
}

type clashDocument struct {
	MixedPort      int              `yaml:"mixed-port"`
	AllowLan       bool             `yaml:"allow-lan"`
	Mode           string           `yaml:"mode"`
	LogLevel       string           `yaml:"log-level"`
	IPv6           bool             `yaml:"ipv6"`
	DNS            map[string]any   `yaml:"dns,omitempty"`
	Proxies        []map[string]any `yaml:"proxies"`
	ProxyProviders map[string]any   `yaml:"proxy-providers,omitempty"`
	ProxyGroups    []map[string]any `yaml:"proxy-groups"`
	RuleProviders  map[string]any   `yaml:"rule-providers,omitempty"`
	Rules          []string         `yaml:"rules"`
}

func clashGroups(spec flSpec, providers bool) []map[string]any {
	out := make([]map[string]any, 0, len(spec.Groups))
	for _, group := range spec.Groups {
		item := map[string]any{"name": group.Name, "type": group.Type}
		if len(group.Proxies) > 0 {
			item["proxies"] = group.Proxies
			out = append(out, item)
			continue
		}
		item["include-all"] = true
		if providers {
			item["include-all-providers"] = true
		}
		if group.Regex != "" {
			item["filter"] = group.Regex
		}
		if spec.Exclude != "" {
			item["exclude-filter"] = spec.Exclude
		}
		item["empty-fallback"] = "DIRECT"
		if group.Type != "select" {
			check := group.URL
			if check == "" {
				check = "http://www.gstatic.com/generate_204"
			}
			interval := group.Interval
			if interval == 0 {
				interval = 300
			}
			item["url"] = check
			item["interval"] = interval
			item["lazy"] = true
			if group.Type == "url-test" {
				tolerance := group.Tolerance
				if tolerance == 0 {
					tolerance = 50
				}
				item["tolerance"] = tolerance
			}
		}
		out = append(out, item)
	}
	return out
}

func clashProviders(remotes []string) map[string]any {
	if len(remotes) == 0 {
		return nil
	}
	out := map[string]any{}
	for i, raw := range remotes {
		name := "airport"
		if i > 0 {
			name = fmt.Sprintf("airport-%d", i+1)
		}
		out[name] = map[string]any{
			"type":     "http",
			"url":      raw,
			"interval": 86400,
			"path":     "./proxy-providers/" + name + ".yaml",
			"override": map[string]any{"additional-prefix": ""},
			"health-check": map[string]any{
				"enable":   true,
				"url":      "http://www.gstatic.com/generate_204",
				"interval": 300,
			},
		}
	}
	return out
}

func clashRuleLines(ctx context.Context, spec flSpec) ([]string, map[string]any, bool) {
	var refs []Ref
	type slot struct {
		remote int
		line   string
	}
	var slots []slot
	for _, rule := range spec.Rules {
		switch rule.Kind {
		case "url":
			if rule.URL == "" || rule.Group == "" {
				return nil, nil, false
			}
			slots = append(slots, slot{remote: len(refs)})
			refs = append(refs, Ref{URL: rule.URL, Policy: rule.Group})
		case "geoip":
			param := strings.ToUpper(rule.Param)
			if len(param) != 2 || rule.Group == "" {
				return nil, nil, false
			}
			slots = append(slots, slot{remote: -1, line: "GEOIP," + param + "," + rule.Group})
		case "final":
			if rule.Group == "" {
				return nil, nil, false
			}
			slots = append(slots, slot{remote: -1, line: "MATCH," + rule.Group})
		default:
			return nil, nil, false
		}
	}
	if len(refs) == 0 {
		return nil, nil, false
	}
	loaded, ok := LoadLists(ctx, refs)
	if !ok {
		return nil, nil, false
	}
	seen := map[string]struct{}{}
	var rules []string
	for _, slot := range slots {
		if slot.remote < 0 {
			rules = append(rules, slot.line)
			continue
		}
		for _, rule := range loaded[slot.remote] {
			line := Format(rule, refs[slot.remote].Policy)
			if _, ok := seen[line]; ok {
				continue
			}
			seen[line] = struct{}{}
			rules = append(rules, line)
		}
	}
	if len(strings.Join(rules, "\n")) > 3_500_000 {
		return nil, nil, false
	}
	return rules, nil, true
}

func remoteClashRules(spec flSpec) ([]string, map[string]any) {
	providers := map[string]any{}
	var rules []string
	for i, rule := range spec.Rules {
		switch rule.Kind {
		case "url":
			id := fmt.Sprintf("labs%d", i)
			interval := rule.Interval
			if interval == 0 {
				interval = 86400
			}
			providers[id] = map[string]any{
				"type":     "http",
				"behavior": "classical",
				"format":   "text",
				"interval": interval,
				"url":      rule.URL,
				"path":     "./ruleset/" + id + ".list",
			}
			rules = append(rules, "RULE-SET,"+id+","+rule.Group)
		case "geoip":
			rules = append(rules, "GEOIP,"+strings.ToUpper(rule.Param)+","+rule.Group)
		case "final":
			rules = append(rules, "MATCH,"+rule.Group)
		}
	}
	return rules, providers
}

// MergedShadowrocket loads the maintained config, expands rules, and copies nodes.
func MergedShadowrocket(ctx context.Context, subscription, updateURL string) (string, error) {
	base, err := LoadText(ctx, srProfileURL(), profileTTL)
	if err != nil {
		return "", fmt.Errorf("规则配置下载失败")
	}
	body, _ := expandShadowrocket(ctx, base)
	return FinishShadowrocket(body, subscription, updateURL)
}

// FinishShadowrocket copies nodes and DNS into a Shadowrocket config.
// updateURL is written into update-url when it is not empty.
func FinishShadowrocket(config, subscription, updateURL string) (string, error) {
	if LooksLikeHTML(subscription) {
		return "", fmt.Errorf("配置不是订阅")
	}
	proxies, _ := NodesForShadowrocket(subscription)
	if len(proxies) == 0 {
		return "", fmt.Errorf("没有节点")
	}
	body := mergeShadowrocket(config, subscription)
	if updateURL != "" {
		body = setUpdateURL(body, updateURL)
	}
	return body, nil
}

func emitClash(doc clashDocument) string {
	var b strings.Builder
	b.WriteString("mixed-port: 7890\nallow-lan: false\nmode: rule\nlog-level: info\nipv6: false\n")
	if len(doc.DNS) > 0 {
		b.WriteString("dns:\n")
		writeMap(&b, doc.DNS, 2)
	}
	b.WriteString("proxies:\n")
	if len(doc.Proxies) == 0 {
		b.WriteString("  []\n")
	} else {
		writeMapList(&b, doc.Proxies, 2)
	}
	if len(doc.ProxyProviders) > 0 {
		b.WriteString("proxy-providers:\n")
		writeMap(&b, doc.ProxyProviders, 2)
	}
	b.WriteString("proxy-groups:\n")
	writeMapList(&b, doc.ProxyGroups, 2)
	if len(doc.RuleProviders) > 0 {
		b.WriteString("rule-providers:\n")
		writeMap(&b, doc.RuleProviders, 2)
	}
	b.WriteString("rules:\n")
	for _, rule := range doc.Rules {
		b.WriteString("  - ")
		b.WriteString(yamlString(rule))
		b.WriteByte('\n')
	}
	return b.String()
}

func writeMap(b *strings.Builder, value map[string]any, indent int) {
	keys := make([]string, 0, len(value))
	for key := range value {
		keys = append(keys, key)
	}
	sort.Strings(keys)
	pad := strings.Repeat(" ", indent)
	for _, key := range keys {
		writeKV(b, pad, key, value[key], indent)
	}
}

func writeMapList(b *strings.Builder, items []map[string]any, indent int) {
	pad := strings.Repeat(" ", indent)
	for _, item := range items {
		keys := make([]string, 0, len(item))
		for key := range item {
			keys = append(keys, key)
		}
		sort.Strings(keys)
		if len(keys) == 0 {
			b.WriteString(pad)
			b.WriteString("- {}\n")
			continue
		}
		b.WriteString(pad)
		b.WriteString("- ")
		b.WriteString(keys[0])
		b.WriteString(": ")
		if complexValue(item[keys[0]]) {
			b.WriteByte('\n')
			writeComplex(b, item[keys[0]], indent+4)
		} else {
			b.WriteString(yamlScalar(item[keys[0]]))
			b.WriteByte('\n')
		}
		inner := strings.Repeat(" ", indent+2)
		for _, key := range keys[1:] {
			writeKV(b, inner, key, item[key], indent+2)
		}
	}
}

func writeKV(b *strings.Builder, pad, key string, value any, indent int) {
	b.WriteString(pad)
	b.WriteString(key)
	b.WriteString(":")
	if complexValue(value) {
		b.WriteByte('\n')
		writeComplex(b, value, indent+2)
		return
	}
	b.WriteByte(' ')
	b.WriteString(yamlScalar(value))
	b.WriteByte('\n')
}

func writeComplex(b *strings.Builder, value any, indent int) {
	switch item := value.(type) {
	case map[string]any:
		writeMap(b, item, indent)
	case []map[string]any:
		writeMapList(b, item, indent)
	case []string:
		pad := strings.Repeat(" ", indent)
		for _, line := range item {
			b.WriteString(pad)
			b.WriteString("- ")
			b.WriteString(yamlString(line))
			b.WriteByte('\n')
		}
	case []any:
		pad := strings.Repeat(" ", indent)
		for _, line := range item {
			if complexValue(line) {
				b.WriteString(pad)
				b.WriteString("- \n")
				writeComplex(b, line, indent+2)
				continue
			}
			b.WriteString(pad)
			b.WriteString("- ")
			b.WriteString(yamlScalar(line))
			b.WriteByte('\n')
		}
	default:
		b.WriteString(strings.Repeat(" ", indent))
		b.WriteString(yamlScalar(value))
		b.WriteByte('\n')
	}
}

func complexValue(value any) bool {
	switch value.(type) {
	case map[string]any, []map[string]any, []string, []any:
		return true
	default:
		return false
	}
}

func yamlScalar(value any) string {
	switch item := value.(type) {
	case string:
		return yamlString(item)
	case bool:
		if item {
			return "true"
		}
		return "false"
	case int:
		return strconv.Itoa(item)
	case int64:
		return strconv.FormatInt(item, 10)
	case float64:
		if item == float64(int(item)) {
			return strconv.Itoa(int(item))
		}
		return strconv.FormatFloat(item, 'f', -1, 64)
	default:
		return yamlString(fmt.Sprint(item))
	}
}

func yamlString(value string) string {
	if value == "" {
		return `""`
	}
	if yamlPlain(value) {
		return value
	}
	var b strings.Builder
	b.WriteByte('"')
	for _, r := range value {
		switch r {
		case '\\', '"':
			b.WriteByte('\\')
			b.WriteRune(r)
		case '\n':
			b.WriteString(`\n`)
		default:
			b.WriteRune(r)
		}
	}
	b.WriteByte('"')
	return b.String()
}

func yamlPlain(value string) bool {
	if strings.TrimSpace(value) != value || value == "" {
		return false
	}
	switch strings.ToLower(value) {
	case "true", "false", "null", "yes", "no", "~":
		return false
	}
	if _, err := strconv.Atoi(value); err == nil {
		return false
	}
	if strings.ContainsAny(value, ":#{}[],&*!|>%@`'\"\\") || strings.Contains(value, "\t") {
		return false
	}
	if strings.HasPrefix(value, "-") || strings.HasPrefix(value, "?") {
		return false
	}
	return true
}
