package rules

import (
	"fmt"
	"strconv"
	"strings"
)

// Config is the shared rule source parsed from config/all.ini.
type Config struct {
	Groups  []Group
	Rules   []Rule
	Exclude string
}

// Group is one custom_proxy_group line.
type Group struct {
	Name      string
	Type      string
	Proxies   []string
	Regex     string
	TestURL   string
	Interval  int
	Tolerance int
}

// Rule is one ruleset line.
type Rule struct {
	Group    string
	Kind     string
	URL      string
	Interval int
	Param    string
	Rest     string
}

// ParseLines reads active config lines. Comments and blank lines are already removed.
func ParseLines(lines []string) (Config, error) {
	var cfg Config
	seen := make(map[string]struct{})
	for _, line := range lines {
		switch {
		case strings.HasPrefix(line, "custom_proxy_group="):
			group, err := parseGroup(line)
			if err != nil {
				return Config{}, err
			}
			if _, ok := seen[group.Name]; ok {
				return Config{}, fmt.Errorf("策略组重复: %s", group.Name)
			}
			seen[group.Name] = struct{}{}
			cfg.Groups = append(cfg.Groups, group)
		case strings.HasPrefix(line, "ruleset="):
			rule, err := parseRuleset(line)
			if err != nil {
				return Config{}, err
			}
			cfg.Rules = append(cfg.Rules, rule)
		case strings.HasPrefix(line, "exclude_remarks="):
			cfg.Exclude = strings.TrimPrefix(line, "exclude_remarks=")
			if strings.Contains(cfg.Exclude, ",") {
				return Config{}, fmt.Errorf("排除节点的正则里不能有逗号: %s", cfg.Exclude)
			}
		}
	}
	if cfg.Exclude != "" && strings.Contains(cfg.Exclude, "(?i)") {
		return Config{}, fmt.Errorf("地区正则不要使用 (?i)，Quantumult X 和 Shadowrocket 会解析失败")
	}
	return cfg, nil
}

func parseGroup(line string) (Group, error) {
	body := strings.TrimPrefix(line, "custom_proxy_group=")
	name, rest, ok := strings.Cut(body, "`")
	if !ok || name == "" {
		return Group{}, fmt.Errorf("策略组格式不对: %s", line)
	}
	typ, rest, ok := strings.Cut(rest, "`")
	if !ok || typ == "" {
		return Group{}, fmt.Errorf("策略组格式不对: %s", line)
	}
	group := Group{Name: name, Type: typ}
	parts := strings.Split(rest, "`")
	switch typ {
	case "select":
		for _, part := range parts {
			if part == "" {
				continue
			}
			if strings.HasPrefix(part, "[]") {
				ref := strings.TrimPrefix(part, "[]")
				if ref == "" {
					return Group{}, fmt.Errorf("策略组格式不对: %s", line)
				}
				group.Proxies = append(group.Proxies, ref)
				continue
			}
			if group.Regex != "" {
				return Group{}, fmt.Errorf("策略组格式不对: %s", line)
			}
			group.Regex = part
		}
		if len(group.Proxies) == 0 && group.Regex == "" {
			return Group{}, fmt.Errorf("策略组格式不对: %s", line)
		}
		if len(group.Proxies) > 0 && group.Regex != "" {
			return Group{}, fmt.Errorf("%s 不能同时手写成员和正则", name)
		}
	case "url-test", "fallback":
		if len(parts) < 3 {
			return Group{}, fmt.Errorf("策略组格式不对: %s", line)
		}
		group.Regex = parts[0]
		group.TestURL = parts[1]
		interval, tolerance, err := parseTiming(parts[2])
		if err != nil {
			return Group{}, fmt.Errorf("策略组格式不对: %s", line)
		}
		group.Interval = interval
		group.Tolerance = tolerance
		if group.Regex == "" || group.TestURL == "" {
			return Group{}, fmt.Errorf("策略组格式不对: %s", line)
		}
	default:
		return Group{}, fmt.Errorf("不支持的策略组类型: %s", typ)
	}
	if strings.Contains(group.Regex, "(?i)") {
		return Group{}, fmt.Errorf("地区正则不要使用 (?i)，Quantumult X 和 Shadowrocket 会解析失败")
	}
	if strings.Contains(group.Regex, ",") {
		return Group{}, fmt.Errorf("%s 的正则里不能有逗号", name)
	}
	return group, nil
}

func parseRuleset(line string) (Rule, error) {
	body := strings.TrimPrefix(line, "ruleset=")
	group, rest, ok := strings.Cut(body, ",")
	if !ok || group == "" || rest == "" {
		return Rule{}, fmt.Errorf("规则格式不对: %s", line)
	}
	rule := Rule{Group: group, Rest: rest}
	switch {
	case rest == "[]FINAL":
		rule.Kind = "final"
	case strings.HasPrefix(rest, "[]GEOIP,"):
		rule.Kind = "geoip"
		rule.Param = strings.TrimPrefix(rest, "[]GEOIP,")
		if rule.Param == "" || strings.Contains(rule.Param, ",") {
			return Rule{}, fmt.Errorf("规则格式不对: %s", line)
		}
	default:
		comma := strings.LastIndex(rest, ",")
		if comma <= 0 || comma == len(rest)-1 {
			return Rule{}, fmt.Errorf("规则格式不对: %s", line)
		}
		interval, err := strconv.Atoi(rest[comma+1:])
		if err != nil || interval <= 0 {
			return Rule{}, fmt.Errorf("规则格式不对: %s", line)
		}
		rule.Kind = "url"
		rule.URL = rest[:comma]
		rule.Interval = interval
		if rule.URL == "" || strings.Contains(rule.URL, ",") {
			return Rule{}, fmt.Errorf("规则格式不对: %s", line)
		}
	}
	return rule, nil
}

func parseTiming(value string) (int, int, error) {
	parts := strings.Split(value, ",")
	if len(parts) == 0 || parts[0] == "" {
		return 0, 0, fmt.Errorf("测速间隔不对: %s", value)
	}
	interval, err := strconv.Atoi(parts[0])
	if err != nil || interval <= 0 {
		return 0, 0, fmt.Errorf("测速间隔不对: %s", value)
	}
	tolerance := 50
	switch {
	case len(parts) >= 3 && parts[2] != "":
		tolerance, err = strconv.Atoi(parts[2])
	case len(parts) == 2 && parts[1] != "":
		tolerance, err = strconv.Atoi(parts[1])
	}
	if err != nil || tolerance < 0 {
		return 0, 0, fmt.Errorf("测速容差不对: %s", value)
	}
	return interval, tolerance, nil
}
