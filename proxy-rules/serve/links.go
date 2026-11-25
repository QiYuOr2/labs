package serve

import (
	"context"
	"sort"
	"strings"
	"time"
)

// LinkInfo is one generated subscription link, reduced to what the table shows.
type LinkInfo struct {
	ID         string `json:"id"`
	Short      string `json:"short"`      // last 8 hex chars of the id, for quick eyeballing
	Client     string `json:"client"`     // qx | sr | flclash
	ClientName string `json:"clientName"` // human label
	UpdatedAt  string `json:"updatedAt"`  // RFC3339, from the blob metadata
	Size       int64  `json:"size"`
}

// ClientLabel is the human-readable name for a stored client key.
func ClientLabel(client string) string {
	switch client {
	case "sr":
		return "Shadowrocket"
	case "flclash":
		return "Clash"
	default:
		return "Quantumult X"
	}
}

// listBlobsFn is the blob lister. Tests swap it so a memory fixture can drive
// ListLinks without a network call.
var listBlobsFn = ListBlobs

// SetLister replaces the blob lister for tests. Pass nil to restore the real one.
func SetLister(fn func(ctx context.Context, prefix string) ([]BlobEntry, error)) {
	if fn == nil {
		listBlobsFn = ListBlobs
		return
	}
	listBlobsFn = fn
}

// ListLinks reads every stored subscription under subs/ and returns them
// newest first. Keys live under keys/ and are skipped on purpose.
func ListLinks(ctx context.Context) ([]LinkInfo, error) {
	entries, err := listBlobsFn(ctx, "subs/")
	if err != nil {
		return nil, err
	}
	links := make([]LinkInfo, 0, len(entries))
	for _, entry := range entries {
		// pathname looks like subs/<client>/<id>
		parts := strings.Split(entry.Pathname, "/")
		if len(parts) != 3 || parts[0] != "subs" {
			continue
		}
		client, id := parts[1], parts[2]
		if !ValidID(id) {
			continue
		}
		short := id
		if len(short) > 8 {
			short = short[len(short)-8:]
		}
		links = append(links, LinkInfo{
			ID:         id,
			Short:      short,
			Client:     client,
			ClientName: ClientLabel(client),
			UpdatedAt:  entry.UploadedAt,
			Size:       entry.Size,
		})
	}
	sort.Slice(links, func(i, j int) bool {
		ti, _ := time.Parse(time.RFC3339, links[i].UpdatedAt)
		tj, _ := time.Parse(time.RFC3339, links[j].UpdatedAt)
		if ti.Equal(tj) {
			return links[i].ID > links[j].ID
		}
		return ti.After(tj)
	})
	return links, nil
}
