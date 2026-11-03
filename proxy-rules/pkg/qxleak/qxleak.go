// Package qxleak exposes the Quantumult X leak lines to the Vercel handler.
//
// Vercel rewrites the api package's module path, so api cannot import
// proxy-rules/internal. These wrappers stay on the public module path and
// call the same functions the config renderer uses.
package qxleak

import "github.com/QiYuOr2/labs/proxy-rules/internal/rules"

func QuantumultXDNS() []string { return rules.QuantumultXDNS() }

func QuantumultXDNSExclusion() string { return rules.QuantumultXDNSExclusion() }

func QuantumultXStunFilters() []string { return rules.QuantumultXStunFilters() }
