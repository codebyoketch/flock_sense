package blockchain

import (
	"crypto/sha256"
	"encoding/hex"
	"fmt"
	"time"
)

type Anchor struct {
	TxID, ScoreHash, Chain string
	AnchoredAt             time.Time
	AttestationTrail       []map[string]any
}
type Client interface {
	AnchorScore(scoreHash string, trail []map[string]any) (Anchor, error)
}

// MockClient keeps the demo deterministic while preserving the production blockchain seam.
type MockClient struct{ Chain string }

func (c MockClient) AnchorScore(scoreHash string, trail []map[string]any) (Anchor, error) {
	h := sha256.Sum256([]byte(fmt.Sprintf("%s:%s:%d", scoreHash, c.Chain, time.Now().UnixNano())))
	return Anchor{"0x" + hex.EncodeToString(h[:]), scoreHash, c.Chain, time.Now().UTC(), trail}, nil
}
