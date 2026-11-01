// Package rules checks the shared rule source and renders client configs.
// User-facing errors stay in Chinese because the maintenance README is Chinese.
package rules

import (
	"errors"
	"fmt"
	"io/fs"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"
	"unicode/utf8"
)

const aiGroupLine = "custom_proxy_group=🤖 AI`select`[]🇯🇵 日本节点`[]🇹🇼 台湾节点`[]🇸🇬 狮城节点`[]🇺🇲 美国节点`[]🌐 全部节点`[]DIRECT"

const aiGroupName = "🤖 AI"

// Summary counts the proxy groups and rulesets parsed from config/all.ini.
type Summary struct {
	Groups   int
	Rulesets int
}

var (
	textSuffixes = map[string]struct{}{
		".ini":  {},
		".list": {},
		".md":   {},
		".conf": {},
		".js":   {},
		".go":   {},
		".mod":  {},
	}
	builtins = map[string]struct{}{
		"DIRECT": {},
		"REJECT": {},
	}
	bannedDomains = []string{
		"stripe.com",
		"auth0.com",
		"sentry.io",
		"amazonaws.com",
		"cloudflare.com",
		"googleapis.com",
		"apis.google.com",
		"www.bing.com",
		"googleusercontent.com",
		"azureedge.net",
		"facebook.com",
		"meta.com",
		"identrust.com",
		"intercom.io",
		"deepseek.com",
		"moonshot.cn",
		"kimi.ai",
		"doubao.com",
	}
	// The pattern is intentionally not a live subscription path: "[" stops the match.
	subscriptionSecret = regexp.MustCompile(`/subscribe/[A-Za-z0-9._-]{8,}`)
)

// Check validates groups, AI pinning, rule order, and leaked subscription URLs under root.
func Check(root string) (Summary, error) {
	var zero Summary
	files, err := textFiles(root)
	if err != nil {
		return zero, err
	}
	var blob strings.Builder
	texts := make(map[string]string, len(files))
	for i, path := range files {
		text, err := readText(root, path)
		if err != nil {
			return zero, err
		}
		texts[filepath.Clean(path)] = text
		if i > 0 {
			blob.WriteByte('\n')
		}
		blob.WriteString(text)
	}
	if err := scanSecrets(blob.String()); err != nil {
		return zero, err
	}
	iniPath := filepath.Clean(filepath.Join(root, "config", "all.ini"))
	ini, ok := texts[iniPath]
	if !ok {
		return zero, errors.New("找不到 config/all.ini")
	}
	aiPath := filepath.Clean(filepath.Join(root, "rules", "ai.list"))
	aiList, ok := texts[aiPath]
	if !ok {
		return zero, errors.New("找不到 rules/ai.list")
	}
	cfg, err := validateSource(ini, aiList)
	if err != nil {
		return zero, err
	}
	return Summary{Groups: len(cfg.Groups), Rulesets: len(cfg.Rules)}, nil
}

func validateSource(ini, aiList string) (Config, error) {
	var zero Config
	lines := activeLines(ini)
	if err := validateCaseFold(lines); err != nil {
		return zero, err
	}
	cfg, err := ParseLines(lines)
	if err != nil {
		return zero, err
	}
	if len(cfg.Groups) == 0 || len(cfg.Rules) == 0 {
		return zero, errors.New("没有解析到策略组或规则")
	}
	if err := validateRulesetGroups(cfg); err != nil {
		return zero, err
	}
	if err := validateRefs(cfg); err != nil {
		return zero, err
	}
	if err := validateAI(lines, cfg); err != nil {
		return zero, err
	}
	if err := validateAdRules(lines); err != nil {
		return zero, err
	}
	if err := validateAIList(aiList); err != nil {
		return zero, err
	}
	if err := validateOrder(cfg.Rules); err != nil {
		return zero, err
	}
	return cfg, nil
}

func scanSecrets(text string) error {
	if subscriptionSecret.MatchString(text) {
		return errors.New("不要把机场订阅链接写进仓库")
	}
	if strings.Contains(text, "asail"+"or.org") {
		return errors.New("不要把公共转换服务写进仓库")
	}
	return nil
}

func validateCaseFold(lines []string) error {
	for _, line := range lines {
		if strings.Contains(line, "(?i)") {
			return errors.New("地区正则不要使用 (?i)，Quantumult X 和 Shadowrocket 会解析失败")
		}
	}
	return nil
}

// FindRoot locates this module from cwd, a parent directory, or a proxy-rules child.
func FindRoot(cwd string) (string, error) {
	dir, err := filepath.Abs(cwd)
	if err != nil {
		return "", err
	}
	for {
		if isModuleRoot(dir) {
			return dir, nil
		}
		nested := filepath.Join(dir, "proxy-rules")
		if nested != dir && isModuleRoot(nested) {
			return nested, nil
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			break
		}
		dir = parent
	}
	return "", errors.New("找不到 config/all.ini，请在 proxy-rules 目录或仓库根目录运行")
}

func isModuleRoot(dir string) bool {
	if !isFile(filepath.Join(dir, "config", "all.ini")) || !isFile(filepath.Join(dir, "rules", "ai.list")) {
		return false
	}
	mod, err := os.ReadFile(filepath.Join(dir, "go.mod"))
	if err != nil {
		return false
	}
	for line := range strings.SplitSeq(string(mod), "\n") {
		if strings.TrimSpace(line) == "module github.com/QiYuOr2/labs/proxy-rules" {
			return true
		}
	}
	return false
}

func isFile(path string) bool {
	info, err := os.Stat(path)
	return err == nil && info.Mode().IsRegular()
}

func textFiles(root string) ([]string, error) {
	var paths []string
	err := filepath.WalkDir(root, func(path string, entry os.DirEntry, err error) error {
		if err != nil {
			return err
		}
		if entry.IsDir() {
			if entry.Name() == ".git" {
				return fs.SkipDir
			}
			return nil
		}
		if !entry.Type().IsRegular() {
			return nil
		}
		if _, ok := textSuffixes[strings.ToLower(filepath.Ext(path))]; !ok {
			return nil
		}
		paths = append(paths, path)
		return nil
	})
	if err != nil {
		return nil, err
	}
	sort.Strings(paths)
	return paths, nil
}

func readText(root, path string) (string, error) {
	data, err := os.ReadFile(path)
	rel, relErr := filepath.Rel(root, path)
	if relErr != nil {
		rel = path
	}
	if err != nil {
		return "", fmt.Errorf("读取 %s: %w", rel, err)
	}
	if !utf8.Valid(data) {
		return "", fmt.Errorf("不是 UTF-8 文本: %s", rel)
	}
	return string(data), nil
}

func activeLines(text string) []string {
	var lines []string
	for line := range strings.SplitSeq(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, ";") {
			continue
		}
		lines = append(lines, line)
	}
	return lines
}

func groupTypes(cfg Config) map[string]string {
	groups := make(map[string]string, len(cfg.Groups))
	for _, group := range cfg.Groups {
		groups[group.Name] = group.Type
	}
	return groups
}

func validateRulesetGroups(cfg Config) error {
	groups := groupTypes(cfg)
	for _, rule := range cfg.Rules {
		if _, ok := groups[rule.Group]; !ok {
			return fmt.Errorf("规则指向了不存在的策略组: %s", rule.Group)
		}
	}
	return nil
}

func validateRefs(cfg Config) error {
	groups := groupTypes(cfg)
	for _, group := range cfg.Groups {
		for _, ref := range group.Proxies {
			if _, ok := builtins[ref]; ok {
				continue
			}
			if _, ok := groups[ref]; !ok {
				return fmt.Errorf("%s 引用了不存在的策略组: %s", group.Name, ref)
			}
			if ref == group.Name {
				return fmt.Errorf("%s 引用了自己", group.Name)
			}
		}
	}
	return nil
}

func validateAI(lines []string, cfg Config) error {
	var found []string
	for _, line := range lines {
		if strings.HasPrefix(line, "custom_proxy_group="+aiGroupName+"`") {
			found = append(found, line)
		}
	}
	if len(found) != 1 || found[0] != aiGroupLine {
		return errors.New("AI 策略组被改动，必须保持手动选择且不含香港、自动选择、故障转移、默认代理")
	}
	groups := groupTypes(cfg)
	if groups[aiGroupName] != "select" {
		return errors.New("AI 策略组不是 select")
	}
	var ai Group
	var ok bool
	for _, group := range cfg.Groups {
		if group.Name == aiGroupName {
			ai = group
			ok = true
			break
		}
	}
	if !ok {
		return errors.New("AI 策略组被改动，必须保持手动选择且不含香港、自动选择、故障转移、默认代理")
	}
	for _, name := range ai.Proxies {
		if _, builtin := builtins[name]; builtin {
			continue
		}
		if groups[name] != "select" {
			return fmt.Errorf("AI 会引用的 %s 必须是手动 select", name)
		}
	}
	var aiRules []Rule
	for _, rule := range cfg.Rules {
		if rule.Group == aiGroupName {
			aiRules = append(aiRules, rule)
		}
	}
	if len(aiRules) != 1 || !strings.Contains(aiRules[0].Rest, "proxy-rules/rules/ai.list") {
		return errors.New("AI 规则只能指向仓库里的 rules/ai.list")
	}
	for _, rule := range cfg.Rules {
		if strings.Contains(rule.Rest, "Ai.yaml") || strings.Contains(rule.Rest, "OpenAi.list") || strings.Contains(rule.Rest, "category-ai") {
			return fmt.Errorf("不要引用过宽的 AI 名单: %s", rule.Rest)
		}
	}
	return nil
}

func validateAdRules(lines []string) error {
	for _, line := range lines {
		if strings.HasPrefix(line, "ruleset=") && strings.Contains(line, "AdRules") {
			return errors.New("Cats-Team 全量广告名单不要默认内联")
		}
	}
	return nil
}

func validateAIList(text string) error {
	banned := make(map[string]struct{}, len(bannedDomains))
	for _, domain := range bannedDomains {
		banned[domain] = struct{}{}
	}
	for line := range strings.SplitSeq(text, "\n") {
		line = strings.TrimSpace(line)
		if line == "" || strings.HasPrefix(line, "#") {
			continue
		}
		_, value, ok := strings.Cut(line, ",")
		if !ok {
			return fmt.Errorf("ai.list 有无法解析的规则: %s", line)
		}
		if _, bad := banned[value]; bad {
			return fmt.Errorf("ai.list 包含过宽域名: %s", value)
		}
	}
	return nil
}

func validateOrder(rules []Rule) error {
	unbreak, ok := indexRest(rules, "Unbreak.list")
	if !ok {
		return errors.New("缺少 Unbreak 规则")
	}
	ad, ok := indexGroup(rules, "🚫 广告拦截")
	if !ok {
		return errors.New("缺少广告拦截规则")
	}
	if unbreak > ad {
		return errors.New("Unbreak 必须在广告规则前面")
	}
	bili, ok := indexGroup(rules, "📺 哔哩哔哩")
	if !ok {
		return errors.New("缺少哔哩哔哩规则")
	}
	media, ok := indexGroup(rules, "🌏 国内媒体")
	if !ok {
		return errors.New("缺少国内媒体规则")
	}
	if bili > media {
		return errors.New("哔哩哔哩必须在国内媒体前面")
	}
	return nil
}

func indexRest(rules []Rule, needle string) (int, bool) {
	for i, rule := range rules {
		if strings.Contains(rule.Rest, needle) {
			return i, true
		}
	}
	return 0, false
}

func indexGroup(rules []Rule, name string) (int, bool) {
	for i, rule := range rules {
		if rule.Group == name {
			return i, true
		}
	}
	return 0, false
}
