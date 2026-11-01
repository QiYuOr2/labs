package serve

import (
	"context"
	"encoding/json"
	"net/http"
	"os"
	"strings"
	"time"
)

const (
	flBanner              = "// 分流名单已写入 config.rules，不再使用远程 rule-providers。\n"
	defaultFlclashProfile = "https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/clients/flclash.js"
)

type flSpec struct {
	Exclude string    `json:"exclude,omitempty"`
	Groups  []flGroup `json:"groups"`
	Rules   []flRule  `json:"rules"`
}

type flGroup struct {
	Name      string   `json:"name"`
	Type      string   `json:"type"`
	Proxies   []string `json:"proxies,omitempty"`
	Regex     string   `json:"regex,omitempty"`
	URL       string   `json:"url,omitempty"`
	Interval  int      `json:"interval,omitempty"`
	Tolerance int      `json:"tolerance,omitempty"`
}

type flRule struct {
	Kind     string `json:"kind"`
	Group    string `json:"group"`
	URL      string `json:"url,omitempty"`
	Param    string `json:"param,omitempty"`
	Interval int    `json:"interval,omitempty"`
}

// FlClash writes an override script whose rules are already expanded.
// It does not read url and does not change proxies in the caller's config.
func FlClash(w http.ResponseWriter, r *http.Request) {
	if !allowGET(w, r) {
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 40*time.Second)
	defer cancel()
	base, err := LoadText(ctx, flclashProfileURL(), profileTTL)
	if err != nil {
		http.Error(w, "规则配置下载失败", http.StatusBadGateway)
		return
	}
	body, ok := expandFlClash(ctx, base)
	if !ok {
		body = base
	}
	writeText(w, r, "text/javascript; charset=utf-8", body)
}

func flclashProfileURL() string {
	if value := os.Getenv("RULES_FLCLASH_URL"); value != "" {
		return value
	}
	return defaultFlclashProfile
}

func expandFlClash(ctx context.Context, script string) (string, bool) {
	spec, err := parseSpec(script)
	if err != nil {
		return script, false
	}
	tail := buildGroupSource(script)
	if tail == "" {
		return script, false
	}
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
				return script, false
			}
			slots = append(slots, slot{remote: len(refs)})
			refs = append(refs, Ref{URL: rule.URL, Policy: rule.Group})
		case "geoip":
			param := strings.ToUpper(rule.Param)
			if len(param) != 2 || rule.Group == "" {
				return script, false
			}
			slots = append(slots, slot{remote: -1, line: "GEOIP," + param + "," + rule.Group})
		case "final":
			if rule.Group == "" {
				return script, false
			}
			slots = append(slots, slot{remote: -1, line: "MATCH," + rule.Group})
		default:
			return script, false
		}
	}
	if len(refs) == 0 {
		return script, false
	}
	loaded, ok := LoadLists(ctx, refs)
	if !ok {
		return script, false
	}
	seen := make(map[string]struct{})
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
	payload, err := json.Marshal(rules)
	if err != nil || len(payload) > 3_500_000 {
		return script, false
	}
	groups, err := json.Marshal(struct {
		Exclude string    `json:"exclude,omitempty"`
		Groups  []flGroup `json:"groups"`
	}{Exclude: spec.Exclude, Groups: spec.Groups})
	if err != nil {
		return script, false
	}
	var b strings.Builder
	b.WriteString(flBanner)
	b.WriteString("// FlClash / Clash Verge 覆写脚本。由合并服务生成，不要手改。\n")
	b.WriteString("// 不是节点订阅。先导入机场订阅，再把这个地址填进覆写脚本。\n")
	b.WriteString("// ")
	b.WriteString(publicBase())
	b.WriteString("/api/flclash\n")
	b.WriteString("// 脚本只替换策略组、规则和 mode。不改节点，也不打开 allow-lan。\n")
	b.WriteString("function main(config) {\n")
	b.WriteString("  if (!config || typeof config !== \"object\") {\n")
	b.WriteString("    return config;\n")
	b.WriteString("  }\n")
	b.WriteString("  var spec = ")
	b.Write(groups)
	b.WriteString(";\n")
	b.WriteString("  var groups = [];\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < spec.groups.length; i++) {\n")
	b.WriteString("    groups.push(buildGroup(spec.groups[i], spec.exclude));\n")
	b.WriteString("  }\n")
	b.WriteString("  config[\"proxy-groups\"] = groups;\n")
	b.WriteString("  config[\"rule-providers\"] = {};\n")
	b.WriteString("  config.rules = ")
	b.Write(payload)
	b.WriteString(";\n")
	b.WriteString("  config.mode = \"rule\";\n")
	b.WriteString("  return config;\n")
	b.WriteString("}\n\n")
	b.WriteString(tail)
	if !strings.HasSuffix(tail, "\n") {
		b.WriteByte('\n')
	}
	return b.String(), true
}

func parseSpec(script string) (flSpec, error) {
	const marker = "var spec = "
	i := strings.Index(script, marker)
	if i < 0 {
		return flSpec{}, errMissing("spec")
	}
	dec := json.NewDecoder(strings.NewReader(script[i+len(marker):]))
	var spec flSpec
	if err := dec.Decode(&spec); err != nil {
		return flSpec{}, err
	}
	return spec, nil
}

func buildGroupSource(script string) string {
	const marker = "function buildGroup"
	i := strings.Index(script, marker)
	if i < 0 {
		return ""
	}
	return script[i:]
}
