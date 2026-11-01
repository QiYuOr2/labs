package serve

import (
	"context"
	"net"
	"strings"
	"sync"
	"time"
)

const ruleTTL = 6 * time.Hour

// Rule is one Clash/Shadowrocket matcher without a policy.
type Rule struct {
	Type      string
	Value     string
	NoResolve bool
}

// Ref is one remote rule list and the policy its lines should use.
type Ref struct {
	URL    string
	Policy string
}

var clashTypes = map[string]string{
	"DOMAIN":         "DOMAIN",
	"HOST":           "DOMAIN",
	"DOMAIN-SUFFIX":  "DOMAIN-SUFFIX",
	"HOST-SUFFIX":    "DOMAIN-SUFFIX",
	"DOMAIN-KEYWORD": "DOMAIN-KEYWORD",
	"HOST-KEYWORD":   "DOMAIN-KEYWORD",
	"IP-CIDR":        "IP-CIDR",
	"IP-CIDR6":       "IP-CIDR6",
	"IP6-CIDR":       "IP-CIDR6",
	"GEOIP":          "GEOIP",
	"USER-AGENT":     "USER-AGENT",
}

var skippedTypes = map[string]struct{}{
	"PROCESS-NAME":    {},
	"PROCESS-PATH":    {},
	"PACKAGE-NAME":    {},
	"DOMAIN-REGEX":    {},
	"DOMAIN-WILDCARD": {},
	"HOST-WILDCARD":   {},
	"URL-REGEX":       {},
	"AND":             {},
	"OR":              {},
	"NOT":             {},
	"MATCH":           {},
	"FINAL":           {},
	"RULE-SET":        {},
	"DST-PORT":        {},
	"SRC-PORT":        {},
	"IN-PORT":         {},
	"SRC-IP-CIDR":     {},
	"IP-ASN":          {},
	"NETWORK":         {},
	"PROTOCOL":        {},
	"UID":             {},
}

const (
	lineSkip = iota
	lineOK
	lineUnknown
)

// Format renders one rule with its policy.
func Format(rule Rule, policy string) string {
	line := rule.Type + "," + rule.Value + "," + policy
	if rule.NoResolve {
		line += ",no-resolve"
	}
	return line
}

// clashCompatible reports whether Mihomo can load the rule.
// USER-AGENT belongs to Surge. Quantumult X and Shadowrocket still keep it.
func clashCompatible(rule Rule) bool {
	return rule.Type != "USER-AGENT"
}

// LoadLists downloads every list. One failure returns false so callers keep the original order.
func LoadLists(ctx context.Context, refs []Ref) ([][]Rule, bool) {
	if len(refs) == 0 {
		return nil, false
	}
	loaded := make([][]Rule, len(refs))
	var wg sync.WaitGroup
	sem := make(chan struct{}, 16)
	for i, ref := range refs {
		wg.Add(1)
		go func(i int, ref Ref) {
			defer wg.Done()
			select {
			case sem <- struct{}{}:
				defer func() { <-sem }()
			case <-ctx.Done():
				return
			}
			loaded[i] = fetchRules(ctx, ref.URL)
		}(i, ref)
	}
	wg.Wait()
	for i, ref := range refs {
		if loaded[i] != nil || ctx.Err() != nil {
			continue
		}
		loaded[i] = fetchRules(ctx, ref.URL)
	}
	for _, rules := range loaded {
		if rules == nil {
			return nil, false
		}
	}
	return loaded, true
}

func fetchRules(ctx context.Context, raw string) []Rule {
	body, err := LoadText(ctx, raw, ruleTTL)
	if err != nil {
		return nil
	}
	rules, ok := ParseList(body)
	if !ok {
		Forget(raw)
		return nil
	}
	return rules
}

// ParseList converts a Clash or Quantumult rule list.
func ParseList(body string) ([]Rule, bool) {
	if badDocument(body) {
		return nil, false
	}
	var rules []Rule
	unknown := 0
	seen := make(map[string]struct{})
	for _, line := range strings.Split(normalize(body), "\n") {
		rule, status := classify(line)
		switch status {
		case lineOK:
			key := rule.Type + "\x00" + rule.Value
			if rule.NoResolve {
				key += "\x00" + "nr"
			}
			if _, ok := seen[key]; ok {
				continue
			}
			seen[key] = struct{}{}
			rules = append(rules, rule)
		case lineUnknown:
			unknown++
		}
	}
	if len(rules) == 0 || unknown > len(rules) {
		return nil, false
	}
	return rules, true
}

func badDocument(body string) bool {
	head := strings.ToLower(strings.TrimSpace(body))
	if len(head) > 240 {
		head = head[:240]
	}
	return strings.Contains(head, "<!doctype") || strings.Contains(head, "<html") || strings.HasPrefix(head, "{")
}

func classify(line string) (Rule, int) {
	line = stripComment(line)
	if line == "" || strings.HasPrefix(line, "#") || strings.HasPrefix(line, ";") || strings.HasPrefix(line, "//") || strings.HasPrefix(line, "!") || line == "payload:" {
		return Rule{}, lineSkip
	}
	parts := splitCSV(line)
	if len(parts) < 2 {
		return Rule{}, lineSkip
	}
	kind := strings.ToUpper(parts[0])
	if _, skip := skippedTypes[kind]; skip {
		return Rule{}, lineSkip
	}
	mapped, ok := clashTypes[kind]
	if !ok {
		return Rule{}, lineUnknown
	}
	pattern := parts[1]
	noResolve := false
	for _, extra := range parts[2:] {
		if strings.EqualFold(extra, "no-resolve") {
			noResolve = true
		}
	}
	if pattern == "" || strings.ContainsAny(pattern, " \t[]") || strings.Contains(pattern, "://") || len(pattern) > 512 {
		return Rule{}, lineUnknown
	}
	switch mapped {
	case "IP-CIDR", "IP-CIDR6":
		canonical, v4, ok := canonicalCIDR(pattern)
		if !ok {
			return Rule{}, lineUnknown
		}
		pattern = canonical
		if v4 {
			mapped = "IP-CIDR"
		} else {
			mapped = "IP-CIDR6"
		}
	case "GEOIP":
		if len(pattern) != 2 {
			return Rule{}, lineUnknown
		}
		pattern = strings.ToUpper(pattern)
		noResolve = false
	case "DOMAIN", "DOMAIN-SUFFIX":
		pattern = strings.TrimSuffix(pattern, ".")
		if pattern == "" {
			return Rule{}, lineUnknown
		}
		noResolve = false
	default:
		noResolve = false
	}
	return Rule{Type: mapped, Value: pattern, NoResolve: noResolve}, lineOK
}

func canonicalCIDR(pattern string) (string, bool, bool) {
	_, network, err := net.ParseCIDR(pattern)
	if err != nil {
		return "", false, false
	}
	canonical := network.String()
	return canonical, !strings.Contains(canonical, ":"), true
}

func stripComment(line string) string {
	line = strings.TrimSpace(line)
	if i := strings.Index(line, " #"); i >= 0 {
		line = line[:i]
	}
	if i := strings.Index(line, " //"); i >= 0 {
		line = line[:i]
	}
	return strings.TrimSpace(line)
}

func splitCSV(line string) []string {
	raw := strings.Split(line, ",")
	out := make([]string, 0, len(raw))
	for _, part := range raw {
		part = strings.TrimSpace(part)
		if part != "" {
			out = append(out, part)
		}
	}
	return out
}

func normalize(body string) string {
	body = strings.TrimPrefix(body, "\uFEFF")
	body = strings.ReplaceAll(body, "\r\n", "\n")
	body = strings.ReplaceAll(body, "\r", "\n")
	return body
}
