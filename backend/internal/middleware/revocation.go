package middleware

import "sync"

type Revocations struct {
	mu     sync.RWMutex
	tokens map[string]struct{}
}

func NewRevocations() *Revocations { return &Revocations{tokens: make(map[string]struct{})} }
func (r *Revocations) Revoke(token string) {
	r.mu.Lock()
	defer r.mu.Unlock()
	r.tokens[token] = struct{}{}
}
func (r *Revocations) IsRevoked(token string) bool {
	r.mu.RLock()
	defer r.mu.RUnlock()
	_, exists := r.tokens[token]
	return exists
}
