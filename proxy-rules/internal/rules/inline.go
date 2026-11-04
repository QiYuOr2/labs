package rules

import (
	"encoding/json"
	"fmt"
	"strings"
)

// aiListPrefix is the rule source the local FlClash script inlines.
const aiListPrefix = "proxy-rules/rules/ai.list"

// parseAITypes reads rules/ai.list into a type list, such as DOMAIN-SUFFIX or DOMAIN.
// The rule source only carries SUFFIX, DOMAIN, and IP-CIDR forms. Everything else
// is rejected so a typo cannot silently drop a domain from the AI group.
func parseAITypes(text string) ([]aiEntry, error) {
	var out []aiEntry
	seen := make(map[string]struct{})
	for _, line := range strings.Split(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		kind, value, ok := strings.Cut(line, ",")
		if !ok || value == "" {
			return nil, fmt.Errorf("ai.list 有无法解析的规则: %s", line)
		}
		switch kind {
		case "DOMAIN", "DOMAIN-SUFFIX", "IP-CIDR", "IP-CIDR6":
		default:
			return nil, fmt.Errorf("ai.list 不支持的类型 %s: %s", kind, line)
		}
		key := kind + "," + value
		if _, dup := seen[key]; dup {
			continue
		}
		seen[key] = struct{}{}
		out = append(out, aiEntry{Kind: kind, Value: value})
	}
	if len(out) == 0 {
		return nil, fmt.Errorf("ai.list 里没有规则")
	}
	return out, nil
}

type aiEntry struct {
	Kind  string
	Value string
}

// clashRules renders the AI entries as concrete Clash rules for one policy.
func (e aiEntry) clashRule(policy string) string {
	return e.Kind + "," + e.Value + "," + policy
}

// renderFlClashLocal writes an override script that inlines rules/ai.list.
//
// The published flclash.js only points at a remote list, so a fresh domain needs
// a push plus the client's cache interval before it lands. The local file inlines
// the AI rules at the very top instead, which keeps it correct for a file import
// straight after editing rules/. Every other list stays remote.
func renderFlClashLocal(cfg Config, aiRules []aiEntry) string {
	spec := specFile{Exclude: cfg.Exclude}
	for _, group := range cfg.Groups {
		proxies := make([]string, len(group.Proxies))
		for i, name := range group.Proxies {
			proxies[i] = clashName(name)
		}
		item := specGroup{
			Name:    clashName(group.Name),
			Type:    group.Type,
			Icon:    clashIcon(group.Name),
			Proxies: proxies,
		}
		if len(group.Proxies) == 0 {
			item.Proxies = nil
			item.Regex = group.Regex
			if group.Type != "select" {
				item.URL = group.TestURL
				item.Interval = group.Interval
				item.Tolerance = group.Tolerance
			}
		}
		spec.Groups = append(spec.Groups, item)
	}
	// The AI list is inlined, so the remote ruleset for it is dropped: leaving it
	// would put a second, stale copy of the same domains behind these rules.
	var inline []string
	for _, rule := range cfg.Rules {
		if rule.Kind == "url" && strings.Contains(rule.URL, aiListPrefix) {
			for _, entry := range aiRules {
				inline = append(inline, entry.clashRule(clashName(rule.Group)))
			}
			continue
		}
		item := specRule{Kind: rule.Kind, Group: clashName(rule.Group)}
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
	inlinePayload, err := json.Marshal(inline)
	if err != nil {
		panic(err)
	}
	var b strings.Builder
	b.WriteString("// FlClash / Clash Verge 覆写脚本，本地导入用。由 proxy-rules 生成，不要手改。\n")
	b.WriteString("// 和 flclash.js 的区别只有 AI 规则：这里把 rules/ai.list 直接写进脚本，\n")
	b.WriteString("// 所以改完 domain 立即生效，不用等远程名单更新。其他名单仍然是远程。\n")
	b.WriteString("// 不是节点订阅。先导入机场订阅，再把这个文件填进覆写脚本，或者从本地文件导入。\n")
	b.WriteString("// 脚本只替换策略组、规则和 mode。不改节点，也不打开 allow-lan。\n")
	b.WriteString("// AI 组的成员写死在 spec 里，只有手动选择。\n")
	b.WriteString("function main(config) {\n")
	b.WriteString("  if (!config || typeof config !== \"object\") {\n")
	b.WriteString("    return config;\n")
	b.WriteString("  }\n")
	b.WriteString("  stripNodeEmoji(config);\n")
	b.WriteString("  var spec = ")
	b.Write(payload)
	b.WriteString(";\n")
	b.WriteString("  var inlineAI = ")
	b.Write(inlinePayload)
	b.WriteString(";\n")
	b.WriteString("  var groups = [];\n")
	b.WriteString("  var i;\n")
	b.WriteString("  for (i = 0; i < spec.groups.length; i++) {\n")
	b.WriteString("    groups.push(buildGroup(spec.groups[i], spec.exclude));\n")
	b.WriteString("  }\n")
	b.WriteString("  var providers = {};\n")
	b.WriteString("  var rules = [];\n")
	b.WriteString("  for (i = 0; i < inlineAI.length; i++) {\n")
	b.WriteString("    rules.push(inlineAI[i]);\n")
	b.WriteString("  }\n")
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
	b.WriteString("}\n\n")
	b.WriteString(clashScriptTail())
	return b.String()
}
