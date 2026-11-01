package serve

import (
	"context"
	"crypto/rand"
	"encoding/hex"
	"encoding/json"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"os"
	"strings"
	"sync"
	"time"
)

const blobAPIVersion = "13"

// TextStore keeps one merged subscription. The random id is the only access key.
type TextStore interface {
	Put(ctx context.Context, path, body string) error
	Get(ctx context.Context, path string) (string, error)
}

var (
	storeMu       sync.Mutex
	storeOverride TextStore
)

// SetStore replaces the subscription store. Tests use a memory store.
func SetStore(store TextStore) {
	storeMu.Lock()
	storeOverride = store
	storeMu.Unlock()
}

func currentStore() TextStore {
	storeMu.Lock()
	defer storeMu.Unlock()
	if storeOverride != nil {
		return storeOverride
	}
	return blobStore{}
}

// MemoryStore is an in-memory TextStore for tests.
type MemoryStore struct {
	mu    sync.Mutex
	items map[string]string
}

// NewMemoryStore returns an empty memory store.
func NewMemoryStore() *MemoryStore {
	return &MemoryStore{items: map[string]string{}}
}

// Put stores or overwrites one object.
func (m *MemoryStore) Put(_ context.Context, path, body string) error {
	m.mu.Lock()
	defer m.mu.Unlock()
	if m.items == nil {
		m.items = map[string]string{}
	}
	m.items[path] = body
	return nil
}

// Get returns one object.
func (m *MemoryStore) Get(_ context.Context, path string) (string, error) {
	m.mu.Lock()
	defer m.mu.Unlock()
	body, ok := m.items[path]
	if !ok {
		return "", errNotFound
	}
	return body, nil
}

var errNotFound = errors.New("not found")

// IsNotFound reports a missing stored subscription.
func IsNotFound(err error) bool {
	return errors.Is(err, errNotFound)
}

// NewID returns 32 lowercase hex characters from crypto/rand.
func NewID() (string, error) {
	var buf [16]byte
	if _, err := rand.Read(buf[:]); err != nil {
		return "", err
	}
	return hex.EncodeToString(buf[:]), nil
}

// ValidID reports whether id is 32 lowercase hex characters.
func ValidID(id string) bool {
	if len(id) != 32 {
		return false
	}
	for _, r := range id {
		switch {
		case r >= '0' && r <= '9', r >= 'a' && r <= 'f':
		default:
			return false
		}
	}
	return true
}

// SubPath is the private object path for one client and id.
func SubPath(client, id string) (string, error) {
	if !ValidID(id) {
		return "", fmt.Errorf("链接无效")
	}
	switch client {
	case "qx", "sr", "flclash":
	default:
		return "", fmt.Errorf("不支持的客户端")
	}
	return "subs/" + client + "/" + id, nil
}

// PublicLink is the subscription URL a client downloads.
func PublicLink(base, client, id string) string {
	base = strings.TrimRight(base, "/")
	switch client {
	case "sr":
		return base + "/api/sr?id=" + id
	case "flclash":
		return base + "/api/flclash?id=" + id
	default:
		return base + "/api/qx?id=" + id
	}
}

// StoredType is the response content type for a stored subscription.
func StoredType(client string) string {
	if client == "flclash" {
		return "text/yaml; charset=utf-8"
	}
	return "text/plain; charset=utf-8"
}

// SaveText writes one merged subscription.
func SaveText(ctx context.Context, path, body string) error {
	return currentStore().Put(ctx, path, body)
}

// LoadTextSaved reads one merged subscription.
func LoadTextSaved(ctx context.Context, path string) (string, error) {
	return currentStore().Get(ctx, path)
}

// PublicBase is the configured public origin.
func PublicBase() string { return publicBase() }

type blobCred struct {
	token   string
	storeID string
	oidc    bool
}

type blobStore struct{}

var blobHTTP = &http.Client{Timeout: 20 * time.Second}

func (blobStore) Put(ctx context.Context, path, body string) error {
	auth, err := blobAuth()
	if err != nil {
		return err
	}
	endpoint := "https://vercel.com/api/blob/?pathname=" + url.QueryEscape(path)
	req, err := http.NewRequestWithContext(ctx, http.MethodPut, endpoint, strings.NewReader(body))
	if err != nil {
		return fmt.Errorf("存储失败")
	}
	req.Header.Set("Authorization", "Bearer "+auth.token)
	req.Header.Set("x-api-version", blobAPIVersion)
	req.Header.Set("x-vercel-blob-access", "private")
	req.Header.Set("x-content-type", "text/plain; charset=utf-8")
	req.Header.Set("x-allow-overwrite", "1")
	req.Header.Set("x-add-random-suffix", "0")
	req.Header.Set("x-cache-control-max-age", "0")
	if auth.oidc {
		req.Header.Set("x-vercel-blob-store-id", auth.storeID)
	}
	resp, err := blobHTTP.Do(req)
	if err != nil {
		return fmt.Errorf("存储失败")
	}
	defer resp.Body.Close()
	payload, _ := io.ReadAll(io.LimitReader(resp.Body, 1<<20))
	if resp.StatusCode < 200 || resp.StatusCode >= 300 {
		return fmt.Errorf("存储失败")
	}
	var out struct {
		Pathname string `json:"pathname"`
	}
	if json.Unmarshal(payload, &out) == nil && out.Pathname != "" && out.Pathname != path {
		return fmt.Errorf("存储失败")
	}
	return nil
}

func (blobStore) Get(ctx context.Context, path string) (string, error) {
	auth, err := blobAuth()
	if err != nil {
		return "", err
	}
	if auth.storeID == "" {
		return "", fmt.Errorf("存储还没配好")
	}
	endpoint := "https://" + auth.storeID + ".private.blob.vercel-storage.com/" + path + "?cache=0"
	req, err := http.NewRequestWithContext(ctx, http.MethodGet, endpoint, nil)
	if err != nil {
		return "", fmt.Errorf("存储失败")
	}
	req.Header.Set("Authorization", "Bearer "+auth.token)
	resp, err := blobHTTP.Do(req)
	if err != nil {
		return "", fmt.Errorf("存储失败")
	}
	defer resp.Body.Close()
	payload, err := io.ReadAll(io.LimitReader(resp.Body, maxBody+1))
	if err != nil {
		return "", fmt.Errorf("存储失败")
	}
	if resp.StatusCode == http.StatusNotFound {
		return "", errNotFound
	}
	if resp.StatusCode != http.StatusOK {
		return "", fmt.Errorf("存储失败")
	}
	if len(payload) > maxBody {
		return "", fmt.Errorf("订阅内容过大")
	}
	return string(payload), nil
}

func blobAuth() (blobCred, error) {
	oidc := strings.TrimSpace(os.Getenv("VERCEL_OIDC_TOKEN"))
	storeID := normalizeStoreID(os.Getenv("BLOB_STORE_ID"))
	if oidc != "" && storeID != "" {
		return blobCred{token: oidc, storeID: storeID, oidc: true}, nil
	}
	token := strings.TrimSpace(os.Getenv("BLOB_READ_WRITE_TOKEN"))
	if token == "" {
		return blobCred{}, fmt.Errorf("存储还没配好")
	}
	if storeID == "" {
		storeID = storeIDFromToken(token)
	}
	return blobCred{token: token, storeID: storeID}, nil
}

func normalizeStoreID(id string) string {
	return strings.TrimPrefix(strings.TrimSpace(id), "store_")
}

func storeIDFromToken(token string) string {
	parts := strings.Split(token, "_")
	if len(parts) < 4 {
		return ""
	}
	return parts[3]
}
