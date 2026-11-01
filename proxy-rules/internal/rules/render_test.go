package rules

import (
	"encoding/json"
	"os"
	"os/exec"
	"path/filepath"
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

	out := runScript(t, files[fileFlClash], map[string]any{
		"mode":      "global",
		"allow-lan": true,
		"proxies": []map[string]string{
			{"name": "日本-1"},
			{"name": "香港-1"},
			{"name": "官网"},
			{"name": "美国-1"},
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
	if got := len(out["proxies"].([]any)); got != 4 {
		t.Fatalf("proxies = %d", got)
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
		case aiGroupName:
			ai = group
		case "🇯🇵 日本节点":
			japan = group
		case "♻️ 自动选择":
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
		if strings.HasSuffix(line, ","+aiGroupName) {
			aiID = strings.Split(line, ",")[1]
		}
	}
	provider := ruleProviders[aiID].(map[string]any)
	if !strings.Contains(provider["url"].(string), "proxy-rules/rules/ai.list") {
		t.Fatalf("AI provider = %#v", provider)
	}

	qx := files[fileQuantumultX]
	sr := files[fileShadowrocket]
	assertAILine(t, qx, "static="+aiGroupName+",")
	assertAILine(t, sr, aiGroupName+" = select,")
	if strings.Contains(qx, "url-latency-benchmark="+aiGroupName) {
		t.Fatal("QX AI is a benchmark group")
	}
	if !strings.Contains(qx, "server-tag-regex=") || !strings.Contains(qx, "到期") {
		t.Fatal("QX region filter missing")
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
