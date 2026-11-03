package rules

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
	"regexp"
	"strings"
	"testing"
)

func TestRenderedClients(t *testing.T) {
	root := moduleRoot(t)
	files, err := Render(root)
	if err != nil {
		t.Fatal(err)
	}
	for _, name := range ClientFiles() {
		body := files[name]
		if strings.Contains(body, "asail"+"or.org") || strings.Contains(body, "(?i)") || strings.Contains(body, "/subscribe/") {
			t.Fatalf("%s contains a converter, case flag, or subscription", name)
		}
	}
	qx := files[fileQuantumultX]
	if !strings.Contains(qx, "\n[mitm]\n") {
		t.Fatal("QX config has no mitm section")
	}
	for _, banned := range []string{"passphrase =", "p12 =", "wloc", "location-spoofer", "gs-loc.apple.com"} {
		if strings.Contains(qx, banned) {
			t.Fatalf("QX config contains %s", banned)
		}
	}
	if !strings.Contains(qx, "hostname = -testflight.apple.com, -*.fcbox.com, -*huami.com, -*amemv.com, -*snssdk.com, -www.google.com\n") {
		t.Fatal("QX mitm hostname changed")
	}
}

func TestRenderRejectsBadAI(t *testing.T) {
	files := validFiles()
	files["config/all.ini"] = strings.Replace(files["config/all.ini"], "[]DIRECT", "[]🇭🇰 香港节点`[]DIRECT", 1)
	files["config/all.ini"] += "custom_proxy_group=🇭🇰 香港节点`select`(港|HK)\n"
	root := writeTree(t, files)
	if _, err := Render(root); err == nil || !strings.Contains(err.Error(), "AI 策略组被改动") {
		t.Fatalf("error = %v", err)
	}
}

func TestFlClashScript(t *testing.T) {
	if _, err := exec.LookPath("node"); err != nil {
		t.Fatal("node is required")
	}
	root := moduleRoot(t)
	files, err := Render(root)
	if err != nil {
		t.Fatal(err)
	}
	ini, err := os.ReadFile(filepath.Join(root, "config", "all.ini"))
	if err != nil {
		t.Fatal(err)
	}
	cfg, err := ParseLines(activeLines(string(ini)))
	if err != nil {
		t.Fatal(err)
	}
	var want []string
	for _, group := range cfg.Groups {
		if group.Name == aiGroupName {
			want = append([]string(nil), group.Proxies...)
		}
	}
	if len(want) == 0 {
		t.Fatal("missing AI group")
	}
	for i, name := range want {
		want[i] = clashName(name)
	}

	out := runScript(t, files[fileFlClash], map[string]any{
		"mode":      "global",
		"allow-lan": true,
		"proxies": []map[string]string{
			{"name": "日本-1"},
			{"name": "香港-1"},
			{"name": "官网"},
			{"name": "美国-1"},
			{"name": "🇯🇵 Japan | 01"},
			{"name": "🇯🇵 Japan | 01"},
		},
		"proxy-providers": map[string]any{
			"Airport": map[string]any{"type": "http", "url": "https://example.com/nodes"},
		},
		"rules":        []string{"MATCH,OLD"},
		"proxy-groups": []any{map[string]any{"name": "OLD"}},
	})
	if out["mode"] != "rule" {
		t.Fatalf("mode = %v", out["mode"])
	}
	if out["allow-lan"] != true {
		t.Fatal("script changed allow-lan")
	}
	proxies := out["proxies"].([]any)
	if len(proxies) != 6 {
		t.Fatalf("proxies = %d", len(proxies))
	}
	names := make([]string, len(proxies))
	for i, item := range proxies {
		names[i] = item.(map[string]any)["name"].(string)
	}
	if strings.Join(names, ",") != "日本-1,香港-1,官网,美国-1,Japan | 01,Japan | 01 2" {
		t.Fatalf("proxy names = %v", names)
	}
	providers := out["proxy-providers"].(map[string]any)
	if _, ok := providers["Airport"]; !ok {
		t.Fatal("airport provider was dropped")
	}

	groups := out["proxy-groups"].([]any)
	if len(groups) != len(cfg.Groups) {
		t.Fatalf("groups = %d, want %d", len(groups), len(cfg.Groups))
	}
	var ai map[string]any
	var japan map[string]any
	var auto map[string]any
	for _, item := range groups {
		group := item.(map[string]any)
		switch group["name"] {
		case clashName(aiGroupName):
			ai = group
		case "日本节点":
			japan = group
		case "自动选择":
			auto = group
		}
	}
	if ai["type"] != "select" {
		t.Fatalf("AI type = %v", ai["type"])
	}
	if _, ok := ai["include-all"]; ok {
		t.Fatal("AI includes every node")
	}
	if _, ok := ai["filter"]; ok || ai["url"] != nil {
		t.Fatal("AI has a health check or filter")
	}
	gotProxies, _ := json.Marshal(ai["proxies"])
	wantProxies, _ := json.Marshal(want)
	if string(gotProxies) != string(wantProxies) {
		t.Fatalf("AI proxies = %s, want %s", gotProxies, wantProxies)
	}
	for _, bad := range []string{"香港", "自动", "故障", "默认"} {
		if strings.Contains(string(gotProxies), bad) {
			t.Fatalf("AI proxies contain %s: %s", bad, gotProxies)
		}
	}
	if japan["type"] != "select" || japan["include-all"] != true {
		t.Fatalf("japan = %#v", japan)
	}
	if !strings.Contains(japan["filter"].(string), "日本") {
		t.Fatalf("japan filter = %v", japan["filter"])
	}
	if !strings.Contains(japan["exclude-filter"].(string), "到期") {
		t.Fatalf("japan exclude = %v", japan["exclude-filter"])
	}
	if auto["type"] != "url-test" {
		t.Fatalf("auto = %#v", auto)
	}
	if ai["icon"] != qure("AI.png") || japan["icon"] != qure("Japan.png") {
		t.Fatalf("icons ai=%v japan=%v", ai["icon"], japan["icon"])
	}
	if strings.Contains(files[fileFlClash], "🚀") || strings.Contains(files[fileFlClash], "🇯🇵") {
		t.Fatal("FlClash still has emoji in group names")
	}

	rules := out["rules"].([]any)
	ruleProviders := out["rule-providers"].(map[string]any)
	text := make([]string, len(rules))
	for i, rule := range rules {
		line := rule.(string)
		text[i] = line
		if strings.HasPrefix(line, "RULE-SET,") {
			parts := strings.Split(line, ",")
			provider := ruleProviders[parts[1]].(map[string]any)
			text[i] = provider["url"].(string) + " -> " + line
		}
	}
	unbreak := indexOf(text, "Unbreak.list")
	ban := indexOf(text, "BanAD.list")
	bili := indexOf(text, "Bilibili.list")
	media := indexOf(text, "ChinaMedia.list")
	if unbreak < 0 || ban < 0 || unbreak > ban {
		t.Fatalf("ad order %v", text)
	}
	if bili < 0 || media < 0 || bili > media {
		t.Fatalf("bilibili order %v", text)
	}
	last := rules[len(rules)-1].(string)
	if !strings.HasPrefix(last, "MATCH,") || strings.Contains(last, "OLD") {
		t.Fatalf("last rule = %s", last)
	}
	var aiID string
	for _, rule := range rules {
		line := rule.(string)
		if strings.HasSuffix(line, ","+clashName(aiGroupName)) {
			aiID = strings.Split(line, ",")[1]
		}
	}
	provider := ruleProviders[aiID].(map[string]any)
	if !strings.Contains(provider["url"].(string), "proxy-rules/rules/ai.list") {
		t.Fatalf("AI provider = %#v", provider)
	}

	qx := files[fileQuantumultX]
	sr := files[fileShadowrocket]
	assertAILine(t, qx, "static="+clashName(aiGroupName)+",")
	seen := map[string]string{}
	for _, group := range cfg.Groups {
		label := clashName(group.Name)
		if prev, ok := seen[label]; ok {
			t.Fatalf("QX name collision %s and %s", prev, group.Name)
		}
		seen[label] = group.Name
		line := qxPolicyLine(qx, label)
		if !strings.HasSuffix(line, ", img-url="+clashIcon(group.Name)) {
			t.Fatalf("QX icon for %s: %s", group.Name, line)
		}
		srLine := srPolicyLine(sr, label)
		if !strings.Contains(srLine, ",img-url="+clashIcon(group.Name)) {
			t.Fatalf("Shadowrocket icon for %s: %s", group.Name, srLine)
		}
		if (strings.Contains(line, group.Name) || strings.Contains(srLine, group.Name)) && group.Name != label {
			t.Fatalf("policy kept emoji name %s", group.Name)
		}
	}
	if emojiIn(qx) || emojiIn(sr) {
		t.Fatal("a client config still has emoji")
	}
	if !strings.Contains(qx, "static=下载,") || !strings.Contains(qx, "force-policy=下载") || !strings.Contains(qx, "final, 漏网之鱼") {
		t.Fatal("QX policy and filter names diverged")
	}
	if !strings.Contains(sr, "默认代理 = select,") || !strings.Contains(sr, "FINAL,漏网之鱼") {
		t.Fatal("Shadowrocket policy and rule names diverged")
	}
	assertAILine(t, sr, clashName(aiGroupName)+" = select,")
	if strings.Contains(qx, "url-latency-benchmark="+clashName(aiGroupName)) {
		t.Fatal("QX AI is a benchmark group")
	}
	if !strings.Contains(qx, "server-tag-regex=.*(港|HK|hk|Hong Kong|HongKong|hongkong).*") || strings.Contains(qx, "(?!") {
		t.Fatal("QX region filter missing or uses unsupported lookahead")
	}
	if !strings.Contains(sr, "policy-regex-filter=.*(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan).*") || strings.Contains(sr, "(?!") {
		t.Fatal("Shadowrocket region filter missing or uses unsupported lookahead")
	}
	if !strings.Contains(qx, "[server_remote]\n\n[server_local]") {
		t.Fatal("QX server section is not empty")
	}
	if !strings.Contains(qx, "ddgksf2013") {
		t.Fatal("QX rewrites missing")
	}
	qxUnbreak := strings.Index(qx, "Unbreak.list")
	qxBan := strings.Index(qx, "BanAD.list")
	if qxUnbreak < 0 || qxBan < 0 || qxUnbreak > qxBan {
		t.Fatal("QX ad order")
	}
	if !strings.Contains(sr, "RULE-SET,") || !strings.Contains(sr, "GEOIP,CN,") || !strings.Contains(sr, "\n[Proxy]\n\n[Proxy Group]\n") {
		t.Fatal("Shadowrocket shape")
	}
}

func TestFlClashLeakFixes(t *testing.T) {
	if _, err := exec.LookPath("node"); err != nil {
		t.Fatal("node is required")
	}
	root := moduleRoot(t)
	files, err := Render(root)
	if err != nil {
		t.Fatal(err)
	}
	script := files[fileFlClash]
	if strings.Count(script, "function applyLeakFixes") != 1 || !strings.Contains(script, "applyLeakFixes(config);") {
		t.Fatal("static script does not apply leak fixes")
	}
	input := map[string]any{
		"mode":      "global",
		"allow-lan": true,
		"ipv6":      true,
		"dns": map[string]any{
			"enable":        false,
			"enhanced-mode": "redir-host",
			"nameserver":    []string{"system"},
		},
		"tun": map[string]any{
			"enable": false,
			"device": "utun9",
		},
		"proxies": []any{
			map[string]any{"name": "Unset", "type": "ss"},
			map[string]any{"name": "Off", "type": "vmess", "udp": false},
			map[string]any{"name": "Web", "type": "http"},
			map[string]any{"name": "Plain", "server": "example.com"},
		},
		"proxy-providers": map[string]any{
			"Airport": map[string]any{
				"type":     "http",
				"url":      "https://example.com/nodes",
				"override": map[string]any{"additional-prefix": ""},
				"proxies": []any{
					map[string]any{"name": "P", "type": "ss"},
					map[string]any{"name": "Q", "type": "vmess", "udp": false},
				},
			},
		},
		"rules": []string{"MATCH,OLD"},
	}
	out := runScript(t, script, input)
	again := runScript(t, script, out)
	assertLeakFixes(t, out)
	assertLeakFixes(t, again)
	if len(again["rules"].([]any)) != len(out["rules"].([]any)) {
		t.Fatal("running the script twice duplicated stun rules")
	}
}

func assertLeakFixes(t *testing.T, out map[string]any) {
	t.Helper()
	if out["allow-lan"] != true {
		t.Fatal("script changed allow-lan")
	}
	if out["ipv6"] != false || out["mode"] != "rule" {
		t.Fatalf("ipv6 %v mode %v", out["ipv6"], out["mode"])
	}
	dns := out["dns"].(map[string]any)
	if dns["enhanced-mode"] != "fake-ip" || dns["fake-ip-range"] != "198.18.0.1/16" || dns["respect-rules"] != true {
		t.Fatalf("dns %#v", dns)
	}
	raw, err := json.Marshal(dns)
	if err != nil {
		t.Fatal(err)
	}
	if strings.Contains(string(raw), `"system"`) || strings.Contains(string(raw), "dhcp://") {
		t.Fatalf("dns still uses the system resolver: %s", raw)
	}
	filters := dns["fake-ip-filter"].([]any)
	for _, filter := range filters {
		if strings.Contains(strings.ToLower(filter.(string)), "stun") {
			t.Fatalf("fake-ip-filter %v", filters)
		}
	}
	tun := out["tun"].(map[string]any)
	if tun["enable"] != true || tun["stack"] != "mixed" || tun["dns-mode"] != "hijack" || tun["device"] != "utun9" {
		t.Fatalf("tun %#v", tun)
	}
	hijack := tun["dns-hijack"].([]any)
	if len(hijack) != 2 || hijack[0] != "any:53" || hijack[1] != "tcp://any:53" {
		t.Fatalf("dns-hijack %#v", hijack)
	}
	proxies := map[string]map[string]any{}
	for _, item := range out["proxies"].([]any) {
		proxy := item.(map[string]any)
		proxies[proxy["name"].(string)] = proxy
	}
	if proxies["Unset"]["udp"] != true || proxies["Off"]["udp"] != false {
		t.Fatalf("proxies %#v", proxies)
	}
	if _, ok := proxies["Web"]["udp"]; ok {
		t.Fatalf("http gained udp %#v", proxies["Web"])
	}
	if _, ok := proxies["Plain"]["udp"]; ok {
		t.Fatalf("typeless proxy gained udp %#v", proxies["Plain"])
	}
	providers := out["proxy-providers"].(map[string]any)
	airport := providers["Airport"].(map[string]any)
	override := airport["override"].(map[string]any)
	if _, ok := override["udp"]; ok {
		t.Fatalf("provider override %#v", override)
	}
	var providerSS, providerOff bool
	for _, item := range airport["proxies"].([]any) {
		proxy := item.(map[string]any)
		switch proxy["name"] {
		case "P":
			providerSS = proxy["udp"] == true
		case "Q":
			providerOff = proxy["udp"] == false
		}
	}
	if !providerSS || !providerOff {
		t.Fatalf("provider proxies %#v", airport["proxies"])
	}
	rules := out["rules"].([]any)
	want := ClashStunRules()
	if len(rules) < len(want) {
		t.Fatalf("rules %#v", rules)
	}
	for i, rule := range want {
		if rules[i] != rule {
			t.Fatalf("rule %d = %v, want %s", i, rules[i], rule)
		}
	}
	last := rules[len(rules)-1].(string)
	if !strings.HasPrefix(last, "MATCH,") || strings.Contains(last, "OLD") {
		t.Fatalf("last rule = %s", last)
	}
}

func srPolicyLine(text, name string) string {
	prefix := name + " = "
	for _, line := range strings.Split(text, "\n") {
		if strings.HasPrefix(line, prefix) {
			return line
		}
	}
	return ""
}

func qxPolicyLine(text, name string) string {
	prefix := name + ","
	for _, line := range strings.Split(text, "\n") {
		kind, rest, ok := strings.Cut(line, "=")
		if !ok || !strings.HasPrefix(rest, prefix) {
			continue
		}
		switch kind {
		case "static", "url-latency-benchmark", "available":
			return line
		}
	}
	return ""
}

func emojiIn(text string) bool {
	for _, r := range text {
		if r == '\uFE0F' || r == '\u200D' || (r >= 0x2600 && r <= 0x27BF) || (r >= 0x2B00 && r <= 0x2BFF) || r >= 0x1F000 {
			return true
		}
	}
	return false
}

func assertAILine(t *testing.T, text, prefix string) {
	t.Helper()
	var line string
	for _, item := range strings.Split(text, "\n") {
		if strings.HasPrefix(item, prefix) {
			line = item
			break
		}
	}
	if line == "" {
		t.Fatalf("missing AI line %s", prefix)
	}
	for _, bad := range []string{"香港", "自动", "故障", "默认", "url-test", "fallback"} {
		if strings.Contains(line, bad) {
			t.Fatalf("AI line %s contains %s", line, bad)
		}
	}
}

func indexOf(items []string, needle string) int {
	for i, item := range items {
		if strings.Contains(item, needle) {
			return i
		}
	}
	return -1
}

func runScript(t *testing.T, script string, input any) map[string]any {
	t.Helper()
	dir := t.TempDir()
	scriptPath := filepath.Join(dir, "flclash.js")
	inputPath := filepath.Join(dir, "input.json")
	runnerPath := filepath.Join(dir, "run.js")
	if err := os.WriteFile(scriptPath, []byte(script), 0o644); err != nil {
		t.Fatal(err)
	}
	raw, err := json.Marshal(input)
	if err != nil {
		t.Fatal(err)
	}
	if err := os.WriteFile(inputPath, raw, 0o644); err != nil {
		t.Fatal(err)
	}
	runner := `const fs = require("fs");
const vm = require("vm");
const code = fs.readFileSync(process.argv[2], "utf8");
const input = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
const sandbox = {};
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { filename: "flclash.js" });
if (typeof sandbox.main !== "function") {
  throw new Error("main is not a function");
}
process.stdout.write(JSON.stringify(sandbox.main(input)));
`
	if err := os.WriteFile(runnerPath, []byte(runner), 0o644); err != nil {
		t.Fatal(err)
	}
	cmd := exec.Command("node", runnerPath, scriptPath, inputPath)
	out, err := cmd.CombinedOutput()
	if err != nil {
		t.Fatalf("node: %v\n%s", err, out)
	}
	var got map[string]any
	if err := json.Unmarshal(out, &got); err != nil {
		t.Fatalf("decode: %v\n%s", err, out)
	}
	return got
}

func TestPlainTagRegexMatchesWholeServerName(t *testing.T) {
	japan := plainTagRegex("(日本|川日|东京|大阪|泉日|埼玉|沪日|深日|JP|Japan)")
	hongKong := plainTagRegex("(港|HK|hk|Hong Kong|HongKong|hongkong)")
	taiwan := plainTagRegex("(台|新北|彰化|TW|Taiwan)")
	singapore := plainTagRegex("(新加坡|坡|狮城|SG|Singapore)")
	unitedStates := plainTagRegex("(美|波特兰|达拉斯|俄勒冈|凤凰城|费利蒙|硅谷|拉斯维加斯|洛杉矶|圣何塞|圣克拉拉|西雅图|芝加哥|US|United States)")
	all := plainTagRegex(".*")
	cases := []struct {
		pattern string
		tag     string
		want    bool
	}{
		{japan, "🇯🇵 Japan | 01", true},
		{japan, "日本 01", true},
		{japan, "🇰🇷 Korea | 01", false},
		{hongKong, "🇭🇰 Hong Kong | 01", true},
		{taiwan, "🇨🇳 Taiwan | 01", true},
		{singapore, "🇸🇬 Singapore | 01", true},
		{unitedStates, "🇺🇸 United States | 01", true},
		{unitedStates, "🇦🇺 Australia | 01", false},
		{all, "🇧🇷 Brazil | 01", true},
	}
	for _, item := range cases {
		re, err := regexp.Compile("^(?:" + item.pattern + ")$")
		if err != nil {
			t.Fatalf("compile %s: %v", item.pattern, err)
		}
		if got := re.MatchString(item.tag); got != item.want {
			t.Fatalf("pattern %s tag %q = %v, want %v", item.pattern, item.tag, got, item.want)
		}
	}
}
