package serve

import (
	"io"
	"net/http"
	"strings"
	"testing"
)

type roundTripFunc func(*http.Request) (*http.Response, error)

func (f roundTripFunc) RoundTrip(r *http.Request) (*http.Response, error) {
	return f(r)
}

func TestBlobDeletePostsPrivateURL(t *testing.T) {
	t.Setenv("VERCEL_OIDC_TOKEN", "")
	t.Setenv("BLOB_STORE_ID", "")
	t.Setenv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_AbC123_secret")
	var method, endpoint, body, version, auth, storeHeader string
	restore := swapBlobHTTP(func(r *http.Request) (*http.Response, error) {
		method = r.Method
		endpoint = r.URL.String()
		version = r.Header.Get("x-api-version")
		auth = r.Header.Get("Authorization")
		storeHeader = r.Header.Get("x-vercel-blob-store-id")
		raw, _ := io.ReadAll(r.Body)
		body = string(raw)
		return &http.Response{
			StatusCode: http.StatusOK,
			Body:       io.NopCloser(strings.NewReader("{}")),
			Header:     make(http.Header),
		}, nil
	})
	t.Cleanup(restore)

	const path = "subs/qx/0123456789abcdef0123456789abcdef"
	if err := (blobStore{}).Delete(t.Context(), path); err != nil {
		t.Fatal(err)
	}
	if method != http.MethodPost || endpoint != "https://vercel.com/api/blob/delete" || version != blobAPIVersion {
		t.Fatalf("request %s %s version %s", method, endpoint, version)
	}
	if auth != "Bearer vercel_blob_rw_AbC123_secret" || storeHeader != "" {
		t.Fatal("token auth headers mismatch")
	}
	want := `{"urls":["https://AbC123.private.blob.vercel-storage.com/` + path + `"]}`
	if body != want {
		t.Fatalf("body %s", body)
	}
}

func TestBlobDeleteOIDCAndMissing(t *testing.T) {
	t.Setenv("BLOB_READ_WRITE_TOKEN", "")
	t.Setenv("VERCEL_OIDC_TOKEN", "oidc-token")
	t.Setenv("BLOB_STORE_ID", "store_abc")
	var storeHeader string
	var status int
	restore := swapBlobHTTP(func(r *http.Request) (*http.Response, error) {
		storeHeader = r.Header.Get("x-vercel-blob-store-id")
		raw, _ := io.ReadAll(r.Body)
		if !strings.Contains(string(raw), "https://abc.private.blob.vercel-storage.com/subs/sr/") {
			t.Fatalf("url %s", raw)
		}
		return &http.Response{
			StatusCode: status,
			Body:       io.NopCloser(strings.NewReader(`{"error":{"code":"not_found"}}`)),
			Header:     make(http.Header),
		}, nil
	})
	t.Cleanup(restore)

	status = http.StatusNotFound
	if err := (blobStore{}).Delete(t.Context(), "subs/sr/0123456789abcdef0123456789abcdef"); err != nil {
		t.Fatal(err)
	}
	if storeHeader != "abc" {
		t.Fatalf("store header %s", storeHeader)
	}
	status = http.StatusBadGateway
	if err := (blobStore{}).Delete(t.Context(), "subs/sr/0123456789abcdef0123456789abcdef"); err == nil || err.Error() != "删除失败" {
		t.Fatalf("err %v", err)
	}

	t.Setenv("VERCEL_OIDC_TOKEN", "")
	t.Setenv("BLOB_STORE_ID", "")
	if err := (blobStore{}).Delete(t.Context(), "subs/qx/0123456789abcdef0123456789abcdef"); err == nil || err.Error() != "存储还没配好" {
		t.Fatalf("missing auth %v", err)
	}
}

func swapBlobHTTP(rt roundTripFunc) func() {
	prev := blobHTTP
	blobHTTP = &http.Client{Transport: rt}
	return func() { blobHTTP = prev }
}
