package serve

import (
	"context"
	"errors"
	"fmt"
	"io"
	"net"
	"net/http"
	"net/url"
	"strings"
	"sync"
	"time"
)

const maxBody = 8 << 20

// FetchText downloads a public URL. Tests replace it.
var FetchText = GetText

// Screen reports whether raw is safe to fetch.
func Screen(raw string) error {
	parsed, err := url.Parse(raw)
	if err != nil || parsed.Host == "" {
		return fmt.Errorf("订阅链接无效")
	}
	if parsed.Scheme != "https" && parsed.Scheme != "http" {
		return fmt.Errorf("订阅链接无效")
	}
	if strings.Contains(raw, ",") {
		return fmt.Errorf("订阅链接无效")
	}
	host := strings.ToLower(strings.TrimSuffix(parsed.Hostname(), "."))
	if host == "" || host == "localhost" || strings.HasSuffix(host, ".localhost") || strings.HasSuffix(host, ".local") {
		return fmt.Errorf("订阅链接无效")
	}
	switch host {
	case "metadata.google.internal", "metadata.google.com":
		return fmt.Errorf("订阅链接无效")
	}
	if ip := net.ParseIP(host); ip != nil && rejectedIP(ip) {
		return fmt.Errorf("订阅链接无效")
	}
	return nil
}

func rejectedIP(ip net.IP) bool {
	if ip == nil || ip.IsLoopback() || ip.IsPrivate() || ip.IsLinkLocalUnicast() || ip.IsLinkLocalMulticast() || ip.IsMulticast() || ip.IsUnspecified() {
		return true
	}
	ip4 := ip.To4()
	if ip4 == nil {
		return false
	}
	if ip4[0] == 0 {
		return true
	}
	if ip4[0] == 100 && ip4[1]&0xc0 == 64 {
		return true
	}
	return false
}

// GetText downloads a public URL and refuses redirects to local addresses.
func GetText(ctx context.Context, raw string) (string, error) {
	if err := Screen(raw); err != nil {
		return "", err
	}
	dialer := &net.Dialer{Timeout: 5 * time.Second}
	transport := &http.Transport{
		Proxy: nil,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			host, port, err := net.SplitHostPort(addr)
			if err != nil {
				return nil, err
			}
			ips, err := net.DefaultResolver.LookupIPAddr(ctx, host)
			if err != nil {
				return nil, err
			}
			var last error
			for _, ip := range ips {
				if rejectedIP(ip.IP) {
					last = errors.New("地址不可用")
					continue
				}
				conn, err := dialer.DialContext(ctx, network, net.JoinHostPort(ip.IP.String(), port))
				if err == nil {
					return conn, nil
				}
				last = err
			}
			if last == nil {
				last = errors.New("地址不可用")
			}
			return nil, last
		},
	}
	client := &http.Client{
		Timeout:   12 * time.Second,
		Transport: transport,
		CheckRedirect: func(req *http.Request, via []*http.Request) error {
			if len(via) >= 3 {
				return errors.New("重定向过多")
			}
			return Screen(req.URL.String())
		},
	}
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, raw, nil)
	if err != nil {
		return "", fmt.Errorf("订阅链接无效")
	}
	req.Header.Set("User-Agent", "labs-proxy-rules")
	resp, err := client.Do(req)
	if err != nil {
		return "", fmt.Errorf("订阅下载失败")
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("订阅下载失败")
	}
	payload, err := io.ReadAll(io.LimitReader(resp.Body, maxBody+1))
	if err != nil {
		return "", fmt.Errorf("订阅下载失败")
	}
	if len(payload) > maxBody {
		return "", fmt.Errorf("订阅内容过大")
	}
	return string(payload), nil
}

type cacheItem struct {
	body string
	at   time.Time
}

var (
	cacheMu sync.Mutex
	cache   map[string]cacheItem
	waiting map[string]chan struct{}
)

// ResetCache drops downloaded profiles and rule lists.
func ResetCache() {
	cacheMu.Lock()
	cache = nil
	waiting = nil
	cacheMu.Unlock()
}

// LoadText returns a cached body, fetching it when the cache is stale.
func LoadText(ctx context.Context, raw string, ttl time.Duration) (string, error) {
	if body, ok := fresh(raw, ttl); ok {
		return body, nil
	}
	cacheMu.Lock()
	if body, ok := freshLocked(raw, ttl); ok {
		cacheMu.Unlock()
		return body, nil
	}
	if waiting == nil {
		waiting = make(map[string]chan struct{})
	}
	if wait, ok := waiting[raw]; ok {
		cacheMu.Unlock()
		select {
		case <-wait:
		case <-ctx.Done():
			return "", ctx.Err()
		}
		if body, ok := fresh(raw, ttl); ok {
			return body, nil
		}
		return fetchStore(ctx, raw)
	}
	wait := make(chan struct{})
	waiting[raw] = wait
	cacheMu.Unlock()

	body, err := fetchStore(ctx, raw)
	cacheMu.Lock()
	delete(waiting, raw)
	close(wait)
	cacheMu.Unlock()
	return body, err
}

func fetchStore(ctx context.Context, raw string) (string, error) {
	body, err := FetchText(ctx, raw)
	if err != nil {
		body, err = FetchText(ctx, raw)
	}
	if err != nil {
		if stale, ok := anyCached(raw); ok {
			return stale, nil
		}
		return "", err
	}
	cacheMu.Lock()
	if cache == nil {
		cache = make(map[string]cacheItem)
	}
	cache[raw] = cacheItem{body: body, at: time.Now()}
	cacheMu.Unlock()
	return body, nil
}

func fresh(raw string, ttl time.Duration) (string, bool) {
	cacheMu.Lock()
	defer cacheMu.Unlock()
	return freshLocked(raw, ttl)
}

func freshLocked(raw string, ttl time.Duration) (string, bool) {
	item, ok := cache[raw]
	if !ok || time.Since(item.at) >= ttl {
		return "", false
	}
	return item.body, true
}

func anyCached(raw string) (string, bool) {
	cacheMu.Lock()
	defer cacheMu.Unlock()
	item, ok := cache[raw]
	if !ok || item.body == "" {
		return "", false
	}
	return item.body, true
}

// Forget removes one cached document so a bad payload is not reused.
func Forget(raw string) {
	cacheMu.Lock()
	delete(cache, raw)
	cacheMu.Unlock()
}
