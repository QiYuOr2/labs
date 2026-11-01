package rules

import (
	"bytes"
	"encoding/json"
	"errors"
	"fmt"
	"os"
	"path/filepath"
	"strings"
)

const rawBase = "https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/"

const (
	fileFlClash      = "clients/flclash.js"
	fileQuantumultX  = "clients/quantumultx.conf"
	fileShadowrocket = "clients/shadowrocket.conf"
)

// ClientFiles are the converted configs published from main.
func ClientFiles() []string {
	return []string{fileFlClash, fileQuantumultX, fileShadowrocket}
}

// Render converts config/all.ini into the three client files.
func Render(root string) (map[string]string, error) {
	ini, err := readSource(root, filepath.Join("config", "all.ini"))
	if err != nil {
		return nil, err
	}
	aiList, err := readSource(root, filepath.Join("rules", "ai.list"))
	if err != nil {
		return nil, err
	}
	cfg, err := validateSource(ini, aiList)
	if err != nil {
		return nil, err
	}
	rewrites, err := readRewrites(root)
	if err != nil {
		return nil, err
	}
	if _, err := readSource(root, filepath.Join("rules", "geoip-cn.list")); err != nil {
		return nil, err
	}
	return buildClients(cfg, rewrites), nil
}

// Write stores rendered client files under root.
func Write(root string, files map[string]string) error {
	for _, name := range ClientFiles() {
		body, ok := files[name]
		if !ok {
			return fmt.Errorf("缺少生成内容: %s", name)
		}
		path := filepath.Join(root, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			return err
		}
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			return fmt.Errorf("写入 %s: %w", name, err)
		}
	}
	return nil
}

// Same reports whether the files on disk match a render.
func Same(root string, files map[string]string) error {
	for _, name := range ClientFiles() {
		body, ok := files[name]
		if !ok {
			return fmt.Errorf("缺少生成内容: %s", name)
		}
		path := filepath.Join(root, filepath.FromSlash(name))
		data, err := os.ReadFile(path)
		if err != nil {
			if errors.Is(err, os.ErrNotExist) {
				return fmt.Errorf("%s 还没生成。推送后 Action 会生成；本地预览可运行 go -C proxy-rules run ./cmd/render", name)
			}
			return fmt.Errorf("读取 %s: %w", name, err)
		}
		if !bytes.Equal(data, []byte(body)) {
			return fmt.Errorf("%s 和源文件不一致。推送后 Action 会生成；本地预览可运行 go -C proxy-rules run ./cmd/render", name)
		}
	}
	return nil
}

func readSource(root, rel string) (string, error) {
	path := filepath.Join(root, filepath.FromSlash(rel))
	data, err := os.ReadFile(path)
	if err != nil {
		if errors.Is(err, os.ErrNotExist) {
			return "", fmt.Errorf("找不到 %s", filepath.ToSlash(rel))
		}
		return "", fmt.Errorf("读取 %s: %w", filepath.ToSlash(rel), err)
	}
	return string(data), nil
}

func readRewrites(root string) ([]string, error) {
	text, err := readSource(root, filepath.Join("qx", "ad-rewrite.conf"))
	if err != nil {
		return nil, err
	}
	var lines []string
	for line := range strings.SplitSeq(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		if !strings.HasPrefix(line, "https://") {
			return nil, fmt.Errorf("qx/ad-rewrite.conf 有无法识别的行: %s", line)
		}
		lines = append(lines, line)
	}
	if len(lines) == 0 {
		return nil, errors.New("qx/ad-rewrite.conf 里没有重写链接")
	}
	return lines, nil
}

type specFile struct {
	Exclude string      `json:"exclude,omitempty"`
	Groups  []specGroup `json:"groups"`
	Rules   []specRule  `json:"rules"`
}

type specGroup struct {
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Proxies   []string `json:"proxies,omitempty"`
	Regex     string   `json:"regex,omitempty"`
	URL       string   `json:"url,omitempty"`
	Interval  int      `json:"interval,omitempty"`
	Tolerance int      `json:"tolerance,omitempty"`
}

type specRule struct {
	Kind     string `json:"kind"`
	Group    string `json:"group"`
	URL      string `json:"url,omitempty"`
	Interval int    `json:"interval,omitempty"`
	Param    string `json:"param,omitempty"`
}

func buildClients(cfg Config, rewrites []string) map[string]string {
	return map[string]string{
		fileFlClash:      renderFlClash(cfg),
		fileQuantumultX:  renderQuantumultX(cfg, rewrites),
		fileShadowrocket: renderShadowrocket(cfg),
	}
}

func renderFlClash(cfg Config) string {
	spec := specFile{Exclude: cfg.Exclude}
	for _, group := range cfg.Groups {
		item := specGroup{Name: group.Name, Type: group.Type, Proxies: group.Proxies}
		if len(group.Proxies) == 0 {
			item.Regex = group.Regex
			if group.Type != "select" {
				item.URL = group.TestURL
				item.Interval = group.Interval
				item.Tolerance = group.Tolerance
			}
		}
		spec.Groups = append(spec.Groups, item)
	}
	for _, rule := range cfg.Rules {
		item := specRule{Kind: rule.Kind, Group: rule.Group}
		switch rule.Kind {
		case "url":
			item.URL = rule.URL
			item.Interval = rule.Interval
		case "geoip":
			item.Param = rule.Param
		}
		spec.Rules = append(spec.Rules, item)
	}
	payload, err := json.Marshal(spec)
	if err != nil {
		panic(err)
	}
	var b strings.Builder
	b.WriteString("// FlClash / Clash Verge 覆写脚本。由 proxy-rules 生成，不要手改。\n")
	b.WriteString("// 不是节点订阅，也不是在线转换。先导入机场订阅，再把这个文件的原始链接填进覆写脚本。\n")
	b.WriteString("// ")
	b.WriteString(rawBase)
	b.WriteString(fileFlClash)
	b.WriteString("\n")
	b.WriteString("// 脚本只替换策略组、规则和 mode。不改节点，也不打开 allow-lan。\n")
	b.WriteString("// AI 组的成员写死在 spec 里，只有手动选择。\n")
	b.WriteString("function main(config) {\n")
	b.WriteString("  if (!config || typeof config !== \"object\") {\n")
	b.WriteString("    return config;\n")
	b.WriteString("  }\n")
	b.WriteString("  var spec = ")
	b.Write(payload)
	b.WriteString(";\n")
	b.WriteString("  var groups = [];\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < spec.groups.length; i++) {\n")
	b.WriteString("    groups.push(buildGroup(spec.groups[i], spec.exclude));\n")
	b.WriteString("  }\n")
	b.WriteString("  var providers = {};\n")
	b.WriteString("  var rules = [];\n")
	b.WriteString("  for (i = 0; i < spec.rules.length; i++) {\n")
	b.WriteString("    var rule = spec.rules[i];\n")
	b.WriteString("    if (rule.kind === \"url\") {\n")
	b.WriteString("      var id = \"labs\" + i;\n")
	b.WriteString("      providers[id] = {\n")
	b.WriteString("        type: \"http\",\n")
	b.WriteString("        behavior: \"classical\",\n")
	b.WriteString("        format: \"text\",\n")
	b.WriteString("        interval: rule.interval,\n")
	b.WriteString("        url: rule.url,\n")
	b.WriteString("        path: \"./ruleset/\" + id + \".list\"\n")
	b.WriteString("      };\n")
	b.WriteString("      rules.push(\"RULE-SET,\" + id + \",\" + rule.group);\n")
	b.WriteString("    } else if (rule.kind === \"geoip\") {\n")
	b.WriteString("      rules.push(\"GEOIP,\" + rule.param + \",\" + rule.group);\n")
	b.WriteString("    } else if (rule.kind === \"final\") {\n")
	b.WriteString("      rules.push(\"MATCH,\" + rule.group);\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("  config[\"proxy-groups\"] = groups;\n")
	b.WriteString("  config[\"rule-providers\"] = providers;\n")
	b.WriteString("  config.rules = rules;\n")
	b.WriteString("  config.mode = \"rule\";\n")
	b.WriteString("  return config;\n")
	b.WriteString("}\n")
	b.WriteString("\n")
	b.WriteString("function buildGroup(group, exclude) {\n")
	b.WriteString("  var out = { name: group.name, type: group.type };\n")
	b.WriteString("  if (group.proxies && group.proxies.length) {\n")
	b.WriteString("    out.proxies = group.proxies;\n")
	b.WriteString("    return out;\n")
	b.WriteString("  }\n")
	b.WriteString("  out[\"include-all\"] = true;\n")
	b.WriteString("  if (group.regex) {\n")
	b.WriteString("    out.filter = group.regex;\n")
	b.WriteString("  }\n")
	b.WriteString("  if (exclude) {\n")
	b.WriteString("    out[\"exclude-filter\"] = exclude;\n")
	b.WriteString("  }\n")
	b.WriteString("  out[\"empty-fallback\"] = \"DIRECT\";\n")
	b.WriteString("  if (group.type !== \"select\") {\n")
	b.WriteString("    out.url = group.url || \"http://www.gstatic.com/generate_204\";\n")
	b.WriteString("    out.interval = group.interval || 300;\n")
	b.WriteString("    out.lazy = true;\n")
	b.WriteString("    if (group.type === \"url-test\") {\n")
	b.WriteString("      out.tolerance = group.tolerance || 50;\n")
	b.WriteString("    }\n")
	b.WriteString("  }\n")
	b.WriteString("  return out;\n")
	b.WriteString("}\n")
	return b.String()
}

func renderQuantumultX(cfg Config, rewrites []string) string {
	var b strings.Builder
	writeBanner(&b, fileQuantumultX)
	b.WriteString("# 填进 Quantumult X 的配置，不要填进节点订阅。\n")
	b.WriteString("# [server_remote] 故意留空。机场订阅在「节点」里单独添加。\n")
	b.WriteString("# 不要把这份文件设成会反复覆盖整份配置的订阅，否则空的节点段会把你的订阅冲掉。\n")
	b.WriteString("# 分流和重写是远程资源，会自己更新。策略组变了才需要重新下载这份文件。\n")
	b.WriteString("\n[general]\n\n[dns]\n\n[policy]\n")
	for _, group := range cfg.Groups {
		b.WriteString(qxPolicy(group))
		b.WriteByte('\n')
	}
	b.WriteString("\n[server_remote]\n\n[server_local]\n\n[filter_remote]\n")
	n := 0
	var finalGroup string
	for _, rule := range cfg.Rules {
		switch rule.Kind {
		case "url":
			n++
			fmt.Fprintf(&b, "%s, tag=labs-%02d, force-policy=%s, update-interval=%d, opt-parser=true, enabled=true\n", rule.URL, n, rule.Group, rule.Interval)
		case "geoip":
			n++
			fmt.Fprintf(&b, "%srules/geoip-cn.list, tag=labs-%02d, force-policy=%s, update-interval=86400, opt-parser=false, enabled=true\n", rawBase, n, rule.Group)
		case "final":
			finalGroup = rule.Group
		}
	}
	b.WriteString("\n[filter_local]\n")
	if finalGroup != "" {
		fmt.Fprintf(&b, "final, %s\n", finalGroup)
	}
	b.WriteString("\n[rewrite_remote]\n")
	for _, line := range rewrites {
		b.WriteString(line)
		b.WriteByte('\n')
	}
	b.WriteString("\n[rewrite_local]\n")
	b.WriteString("\n[mitm]\n")
	b.WriteString("# 这里只保留模块和排除主机名。passphrase、p12 是设备证书，不要写进仓库。\n")
	b.WriteString("# 不包含定位伪装。远程重写更新后会自行合并自己的 hostname。\n")
	b.WriteString("skip_validating_cert = true\n")
	b.WriteString("force_sni_domain_name = false\n")
	b.WriteString("hostname = -testflight.apple.com, -*.fcbox.com, -*huami.com, -*amemv.com, -*snssdk.com, -www.google.com\n")
	return b.String()
}

func qxPolicy(group Group) string {
	if len(group.Proxies) > 0 {
		members := make([]string, len(group.Proxies))
		for i, name := range group.Proxies {
			members[i] = qxBuiltin(name)
		}
		return fmt.Sprintf("%s=%s, %s", qxKind(group.Type), group.Name, strings.Join(members, ", "))
	}
	// Quantumult X rejects lookahead, and an invalid filter matches nothing.
	// The pattern also has to cover the whole tag, or names like "Japan | 01" miss the group.
	regex := plainTagRegex(group.Regex)
	switch group.Type {
	case "url-test":
		return fmt.Sprintf("url-latency-benchmark=%s, server-tag-regex=%s, check-interval=%d, tolerance=%d", group.Name, regex, group.Interval, group.Tolerance)
	case "fallback":
		return fmt.Sprintf("available=%s, server-tag-regex=%s", group.Name, regex)
	default:
		return fmt.Sprintf("static=%s, server-tag-regex=%s", group.Name, regex)
	}
}

func qxKind(typ string) string {
	switch typ {
	case "url-test":
		return "url-latency-benchmark"
	case "fallback":
		return "available"
	default:
		return "static"
	}
}

func qxBuiltin(name string) string {
	switch strings.ToUpper(name) {
	case "DIRECT":
		return "direct"
	case "REJECT":
		return "reject"
	default:
		return name
	}
}

func renderShadowrocket(cfg Config) string {
	var b strings.Builder
	writeBanner(&b, fileShadowrocket)
	b.WriteString("# 这是配置订阅，不是节点订阅。机场订阅加在首页，不要写进这个文件。\n")
	b.WriteString("# 墨鱼的 Quantumult X 重写这里用不了。广告域名走「广告拦截」。\n")
	b.WriteString("\n[General]\n")
	b.WriteString("bypass-system = true\n")
	b.WriteString("skip-proxy = 192.168.0.0/16, 10.0.0.0/8, 172.16.0.0/12, 127.0.0.1, localhost, *.local\n")
	b.WriteString("dns-server = system\n")
	fmt.Fprintf(&b, "update-url = %s%s\n", rawBase, fileShadowrocket)
	b.WriteString("\n[Proxy]\n\n[Proxy Group]\n")
	for _, group := range cfg.Groups {
		b.WriteString(srPolicy(group))
		b.WriteByte('\n')
	}
	b.WriteString("\n[Rule]\n")
	for _, rule := range cfg.Rules {
		switch rule.Kind {
		case "url":
			fmt.Fprintf(&b, "RULE-SET,%s,%s\n", rule.URL, rule.Group)
		case "geoip":
			fmt.Fprintf(&b, "GEOIP,%s,%s\n", rule.Param, rule.Group)
		case "final":
			fmt.Fprintf(&b, "FINAL,%s\n", rule.Group)
		}
	}
	b.WriteString("\n[Host]\n")
	return b.String()
}

func srPolicy(group Group) string {
	if len(group.Proxies) > 0 {
		parts := make([]string, 0, len(group.Proxies)+1)
		parts = append(parts, group.Type)
		parts = append(parts, group.Proxies...)
		return group.Name + " = " + strings.Join(parts, ",")
	}
	// Shadowrocket's policy filter also rejects lookahead and then matches nothing.
	regex := plainTagRegex(group.Regex)
	switch group.Type {
	case "url-test":
		return fmt.Sprintf("%s = url-test,policy-regex-filter=%s,url=%s,interval=%d,tolerance=%d,timeout=5", group.Name, regex, group.TestURL, group.Interval, group.Tolerance)
	case "fallback":
		return fmt.Sprintf("%s = fallback,policy-regex-filter=%s,url=%s,interval=%d,timeout=5", group.Name, regex, group.TestURL, group.Interval)
	default:
		return fmt.Sprintf("%s = select,policy-regex-filter=%s", group.Name, regex)
	}
}

func plainTagRegex(match string) string {
	// These filters are applied to the entire server tag. A bare alternation
	// only matches a tag that is exactly "Japan" or "日本", so names such as
	// "🇯🇵 Japan | 01" stay out of the group and Quantumult X falls through to DIRECT.
	if match == "" || match == ".*" {
		return ".*"
	}
	if strings.HasPrefix(match, ".*") && strings.HasSuffix(match, ".*") {
		return match
	}
	return ".*" + match + ".*"
}

func writeBanner(b *strings.Builder, name string) {
	b.WriteString("# 由 proxy-rules 生成，不要手改。\n")
	b.WriteString("# 源文件是 config/all.ini。推送后由 GitHub Action 重新生成。\n")
	b.WriteString("# ")
	b.WriteString(rawBase)
	b.WriteString(name)
	b.WriteByte('\n')
}
