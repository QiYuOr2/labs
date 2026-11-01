package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/QiYuOr2/labs/proxy-rules/serve"
)

const maxUpload = 2 << 20

func handleUpload(w http.ResponseWriter, r *http.Request, client string) {
	id := strings.TrimSpace(r.URL.Query().Get("id"))
	if id != "" && !serve.ValidID(id) {
		http.Error(w, "链接无效", http.StatusBadRequest)
		return
	}
	if r.Method == http.MethodGet || r.Method == http.MethodHead {
		if id == "" {
			http.Error(w, "链接无效", http.StatusBadRequest)
			return
		}
		writeStored(w, r, client, id)
		return
	}
	if r.Method != http.MethodPost {
		http.Error(w, "只接受 POST", http.StatusMethodNotAllowed)
		return
	}
	payload, err := io.ReadAll(io.LimitReader(r.Body, maxUpload+1))
	if err != nil {
		http.Error(w, "配置读取失败", http.StatusBadRequest)
		return
	}
	if len(payload) > maxUpload {
		http.Error(w, "文件过大", http.StatusRequestEntityTooLarge)
		return
	}
	if len(strings.TrimSpace(string(payload))) == 0 {
		http.Error(w, "缺少配置", http.StatusBadRequest)
		return
	}
	if id == "" {
		id, err = serve.NewID()
		if err != nil {
			http.Error(w, "合并失败", http.StatusBadGateway)
			return
		}
	}
	ctx, cancel := context.WithTimeout(r.Context(), 40*time.Second)
	defer cancel()
	link := serve.PublicLink(requestBase(r), client, id)
	merged, err := buildUpload(ctx, client, string(payload), link)
	if err != nil {
		status := http.StatusBadRequest
		if err.Error() == "规则配置下载失败" || err.Error() == "合并失败" {
			status = http.StatusBadGateway
		}
		http.Error(w, err.Error(), status)
		return
	}
	path, err := serve.SubPath(client, id)
	if err != nil {
		http.Error(w, "链接无效", http.StatusBadRequest)
		return
	}
	if err := serve.SaveText(ctx, path, merged); err != nil {
		status := http.StatusBadGateway
		if err.Error() == "存储还没配好" {
			status = http.StatusServiceUnavailable
		}
		http.Error(w, err.Error(), status)
		return
	}
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.Header().Set("Cache-Control", "no-store")
	_ = json.NewEncoder(w).Encode(struct {
		URL string `json:"url"`
	}{URL: link})
}

func writeStored(w http.ResponseWriter, r *http.Request, client, id string) {
	path, err := serve.SubPath(client, id)
	if err != nil {
		http.Error(w, "链接无效", http.StatusBadRequest)
		return
	}
	ctx, cancel := context.WithTimeout(r.Context(), 15*time.Second)
	defer cancel()
	body, err := serve.LoadTextSaved(ctx, path)
	if err != nil {
		if serve.IsNotFound(err) {
			http.Error(w, "订阅不存在", http.StatusNotFound)
			return
		}
		http.Error(w, "存储失败", http.StatusBadGateway)
		return
	}
	w.Header().Set("Content-Type", serve.StoredType(client))
	w.Header().Set("Cache-Control", "no-store")
	if r.Method == http.MethodHead {
		return
	}
	_, _ = w.Write([]byte(body))
}

func buildUpload(ctx context.Context, client, subscription, link string) (string, error) {
	switch client {
	case "sr":
		return serve.MergedShadowrocket(ctx, subscription, link)
	case "flclash":
		return serve.BuildClash(ctx, subscription)
	default:
		base, err := profile(ctx)
		if err != nil {
			return "", fmt.Errorf("规则配置下载失败")
		}
		base = expandFilters(ctx, base)
		return MergeQuantumultX(base, subscription, "")
	}
}

func requestBase(r *http.Request) string {
	if value := strings.TrimSpace(os.Getenv("RULES_PUBLIC_BASE")); value != "" {
		return strings.TrimRight(value, "/")
	}
	host := r.Host
	if host == "" || strings.ContainsAny(host, " /\\") {
		return serve.PublicBase()
	}
	proto := r.Header.Get("X-Forwarded-Proto")
	if proto != "http" && proto != "https" {
		proto = "https"
	}
	return proto + "://" + host
}
