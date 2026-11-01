package serve

import (
	"net/http"
	"strings"
	"unicode"
)

func writeText(w http.ResponseWriter, r *http.Request, contentType, body string) {
	w.Header().Set("Content-Type", contentType)
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodHead {
		return
	}
	_, _ = w.Write([]byte(body))
}

func allowGET(w http.ResponseWriter, r *http.Request) bool {
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		http.Error(w, "只接受 GET", http.StatusMethodNotAllowed)
		return false
	}
	return true
}

func splitSections(body string) map[string][]string {
	sections := make(map[string][]string)
	var name string
	found := false
	for _, line := range strings.Split(normalize(body), "\n") {
		trimmed := strings.TrimSpace(line)
		if isHeader(trimmed) {
			name = strings.ToLower(trimmed[1 : len(trimmed)-1])
			if _, ok := sections[name]; !ok {
				sections[name] = nil
			}
			found = true
			continue
		}
		if name != "" {
			sections[name] = append(sections[name], line)
		}
	}
	if !found {
		return nil
	}
	return sections
}

func isHeader(line string) bool {
	if len(line) < 3 || line[0] != '[' || line[len(line)-1] != ']' {
		return false
	}
	// [Proxy Group] is a section. A space must not make the next header
	// invisible, or replacing [Proxy] deletes the groups.
	name := line[1 : len(line)-1]
	if name == "" || strings.TrimSpace(name) != name {
		return false
	}
	for _, r := range name {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '_' || r == '-' || r == ' ' {
			continue
		}
		return false
	}
	return true
}

func replaceSection(config, name, body string) (string, error) {
	lines := strings.Split(normalize(config), "\n")
	want := strings.ToLower(name)
	start := -1
	for i, line := range lines {
		trimmed := strings.TrimSpace(line)
		if isHeader(trimmed) && strings.ToLower(trimmed[1:len(trimmed)-1]) == want {
			start = i
			break
		}
	}
	if start < 0 {
		return "", errMissing(name)
	}
	end := len(lines)
	for i := start + 1; i < len(lines); i++ {
		if isHeader(strings.TrimSpace(lines[i])) {
			end = i
			break
		}
	}
	var b strings.Builder
	for i := 0; i <= start; i++ {
		b.WriteString(lines[i])
		b.WriteByte('\n')
	}
	if body != "" {
		b.WriteString(body)
		if !strings.HasSuffix(body, "\n") {
			b.WriteByte('\n')
		}
		b.WriteByte('\n')
	}
	for i := end; i < len(lines); i++ {
		b.WriteString(lines[i])
		if i != len(lines)-1 {
			b.WriteByte('\n')
		}
	}
	return b.String(), nil
}

type missingSection string

func (m missingSection) Error() string { return "配置里没有 [" + string(m) + "]" }

func errMissing(name string) error { return missingSection(name) }
