package rules

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

func TestCheckRepo(t *testing.T) {
	got, err := Check(moduleRoot(t))
	if err != nil {
		t.Fatal(err)
	}
	if got.Groups != 56 || got.Rulesets != 55 {
		t.Fatalf("summary = %+v, want 56 groups and 55 rulesets", got)
	}
}

func TestFindRoot(t *testing.T) {
	root := moduleRoot(t)
	for _, cwd := range []string{root, filepath.Dir(root), filepath.Join(root, "cmd", "check")} {
		got, err := FindRoot(cwd)
		if err != nil {
			t.Fatalf("FindRoot(%s): %v", cwd, err)
		}
		if got != root {
			t.Fatalf("FindRoot(%s) = %s, want %s", cwd, got, root)
		}
	}
	if _, err := FindRoot(t.TempDir()); err == nil {
		t.Fatal("FindRoot on an empty directory succeeded")
	}
}

func TestCheckFixture(t *testing.T) {
	root := writeTree(t, validFiles())
	if _, err := Check(root); err != nil {
		t.Fatal(err)
	}
}

func TestCheckRejects(t *testing.T) {
	base := validFiles()
	tests := []struct {
		name   string
		mutate func(map[string]string)
		want   string
	}{
		{
			name: "ad before unbreak",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"ruleset=🎯 全球直连,https://example.com/Unbreak.list,86400\nruleset=🚫 广告拦截,https://example.com/BanAD.list,86400",
					"ruleset=🚫 广告拦截,https://example.com/BanAD.list,86400\nruleset=🎯 全球直连,https://example.com/Unbreak.list,86400", 1)
			},
			want: "Unbreak 必须在广告规则前面",
		},
		{
			name: "bilibili after domestic media",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"ruleset=📺 哔哩哔哩,https://example.com/Bilibili.list,86400\nruleset=🌏 国内媒体,https://example.com/ChinaMedia.list,86400",
					"ruleset=🌏 国内媒体,https://example.com/ChinaMedia.list,86400\nruleset=📺 哔哩哔哩,https://example.com/Bilibili.list,86400", 1)
			},
			want: "哔哩哔哩必须在国内媒体前面",
		},
		{
			name: "ai group changed",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"], "[]DIRECT", "[]🇭🇰 香港节点`[]DIRECT", 1)
				files["config/all.ini"] += "custom_proxy_group=🇭🇰 香港节点`select`(港|HK)\n"
			},
			want: "AI 策略组被改动",
		},
		{
			name: "pinned group is not select",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"custom_proxy_group=🇯🇵 日本节点`select`(日本|JP)",
					"custom_proxy_group=🇯🇵 日本节点`url-test`(日本|JP)`http://www.gstatic.com/generate_204`300,,50", 1)
			},
			want: "必须是手动 select",
		},
		{
			name: "wide ai list",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"https://example.com/BanAD.list", "https://example.com/OpenAi.list", 1)
			},
			want: "不要引用过宽的 AI 名单",
		},
		{
			name: "inline adrules",
			mutate: func(files map[string]string) {
				files["config/all.ini"] += "ruleset=🚫 广告拦截,https://example.com/AdRules.list,86400\n"
			},
			want: "Cats-Team 全量广告名单不要默认内联",
		},
		{
			name: "banned domain",
			mutate: func(files map[string]string) {
				files["rules/ai.list"] += "DOMAIN-SUFFIX,stripe.com\n"
			},
			want: "ai.list 包含过宽域名: stripe.com",
		},
		{
			name: "subscription secret",
			mutate: func(files map[string]string) {
				files["README.md"] += "/subscribe/" + strings.Repeat("a", 8) + "\n"
			},
			want: "不要把机场订阅链接写进仓库",
		},
		{
			name: "self reference",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"custom_proxy_group=🎯 全球直连`select`[]DIRECT",
					"custom_proxy_group=🎯 全球直连`select`[]🎯 全球直连", 1)
			},
			want: "🎯 全球直连 引用了自己",
		},
		{
			name: "missing group",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"],
					"ruleset=📺 哔哩哔哩,", "ruleset=👻 不存在,", 1)
			},
			want: "规则指向了不存在的策略组: 👻 不存在",
		},
		{
			name: "duplicate group",
			mutate: func(files map[string]string) {
				files["config/all.ini"] += "custom_proxy_group=🎯 全球直连`select`[]DIRECT\n"
			},
			want: "策略组重复: 🎯 全球直连",
		},
		{
			name: "bad ai list line",
			mutate: func(files map[string]string) {
				files["rules/ai.list"] += "NOT-A-RULE\n"
			},
			want: "ai.list 有无法解析的规则",
		},
		{
			name: "case insensitive flag",
			mutate: func(files map[string]string) {
				files["config/all.ini"] = strings.Replace(files["config/all.ini"], "(日本|JP)", "(?i)(日本|JP)", 1)
			},
			want: "(?i)",
		},
		{
			name: "public converter",
			mutate: func(files map[string]string) {
				files["README.md"] += "https://api.asail" + "or.org/sub\n"
			},
			want: "不要把公共转换服务写进仓库",
		},
	}
	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			files := cloneFiles(base)
			tt.mutate(files)
			_, err := Check(writeTree(t, files))
			if err == nil || !strings.Contains(err.Error(), tt.want) {
				t.Fatalf("error = %v, want substring %q", err, tt.want)
			}
		})
	}
}

func TestCheckRejectsInvalidUTF8(t *testing.T) {
	files := validFiles()
	root := writeTree(t, files)
	if err := os.WriteFile(filepath.Join(root, "rules", "bad.list"), []byte{0xff, 0xfe}, 0o644); err != nil {
		t.Fatal(err)
	}
	_, err := Check(root)
	if err == nil || !strings.Contains(err.Error(), "不是 UTF-8 文本") {
		t.Fatalf("error = %v", err)
	}
}

func validFiles() map[string]string {
	return map[string]string{
		"config/all.ini": validINI(),
		"rules/ai.list":  "# comment\nDOMAIN-SUFFIX,openai.com\n",
		"README.md":      "示例只用 https://example.com/subscribe ，不要带 token。\n",
		"go.mod":         "module github.com/QiYuOr2/labs/proxy-rules\n\ngo 1.24\n",
	}
}

func validINI() string {
	lines := []string{
		";ruleset=🚫 广告拦截,https://example.com/AdRules.list,86400",
		"ruleset=🎯 全球直连,https://example.com/Unbreak.list,86400",
		"ruleset=🚫 广告拦截,https://example.com/BanAD.list,86400",
		"ruleset=🤖 AI,https://raw.githubusercontent.com/QiYuOr2/labs/main/proxy-rules/rules/ai.list,86400",
		"ruleset=📺 哔哩哔哩,https://example.com/Bilibili.list,86400",
		"ruleset=🌏 国内媒体,https://example.com/ChinaMedia.list,86400",
		aiGroupLine,
		"custom_proxy_group=🇯🇵 日本节点`select`(日本|JP)",
		"custom_proxy_group=🇹🇼 台湾节点`select`(台|TW)",
		"custom_proxy_group=🇸🇬 狮城节点`select`(新加坡|SG)",
		"custom_proxy_group=🇺🇲 美国节点`select`(美|US)",
		"custom_proxy_group=🌐 全部节点`select`.*",
		"custom_proxy_group=🚫 广告拦截`select`[]REJECT`[]DIRECT",
		"custom_proxy_group=🎯 全球直连`select`[]DIRECT",
		"custom_proxy_group=📺 哔哩哔哩`select`[]DIRECT",
		"custom_proxy_group=🌏 国内媒体`select`[]DIRECT",
		"custom_proxy_group=♻️ 自动选择`url-test`.*`http://www.gstatic.com/generate_204`300,,50",
	}
	return strings.Join(lines, "\n") + "\n"
}

func cloneFiles(src map[string]string) map[string]string {
	dst := make(map[string]string, len(src))
	for k, v := range src {
		dst[k] = v
	}
	return dst
}

func writeTree(t *testing.T, files map[string]string) string {
	t.Helper()
	dir := t.TempDir()
	for name, body := range files {
		path := filepath.Join(dir, filepath.FromSlash(name))
		if err := os.MkdirAll(filepath.Dir(path), 0o755); err != nil {
			t.Fatal(err)
		}
		if err := os.WriteFile(path, []byte(body), 0o644); err != nil {
			t.Fatal(err)
		}
	}
	return dir
}

func moduleRoot(t *testing.T) string {
	t.Helper()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	return filepath.Dir(filepath.Dir(filepath.Dir(file)))
}
