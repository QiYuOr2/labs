package rules

import "strings"

// Quantumult X fields follow the official sample:
// https://github.com/crossutility/Quantumult-X/blob/master/sample.conf
//
// Shadowrocket fields follow the well-established config reference:
// https://github.com/LOWERTOP/Shadowrocket

// DomesticDoH is the domestic resolver pair used for direct-domain lookups.
// Proxied names are resolved on the proxy, which is what both clients document.
func DomesticDoH() string {
	return clashAliDoH + "," + clashPubDoH
}

// QuantumultXDNS is the [dns] block written into a generated profile.
// no-system stops the ISP resolver. A global doh-server makes Quantumult X
// ignore system and unbound plaintext servers. prefer-doh3 tries HTTP/3 first.
func QuantumultXDNS() []string {
	return []string{
		"no-system",
		"no-ipv6",
		"prefer-doh3",
		"doh-server=" + DomesticDoH(),
	}
}

// QuantumultXDNSExclusion lists names that must keep a real answer.
// The carrier names are the sample.conf default. The rest mirror the Clash
// fake-ip filter (LAN, captive portals, time sync). STUN names are absent
// so they keep the placeholder address and follow filter rules.
func QuantumultXDNSExclusion() string {
	seen := map[string]struct{}{}
	var parts []string
	add := func(name string) {
		if _, ok := seen[name]; ok {
			return
		}
		seen[name] = struct{}{}
		parts = append(parts, name)
	}
	for _, name := range []string{"*.cmpassport.com", "*.jegotrip.com.cn", "*.icitymobile.mobi", "id6.me"} {
		add(name)
	}
	for _, name := range clashFakeIPFilter {
		add(name)
	}
	return strings.Join(parts, ", ")
}

// QuantumultXStunFilters sends hostnames containing "stun" to the default
// proxy group. sample.conf has no destination-port or protocol matcher, so
// a bare IP STUN packet cannot be selected here. udp_drop_list is not used:
// that list drops the packet before filter rules run.
func QuantumultXStunFilters() []string {
	return []string{"host-keyword, stun, " + clashStunPolicy}
}

// ShadowrocketLeakGeneral is the [General] leak block.
// always-real-ip=false keeps the fake IP that TUN returns by default.
// fallback DNS is domestic DoH; the documented "system" token is the ISP resolver.
func ShadowrocketLeakGeneral() []string {
	doh := DomesticDoH()
	return []string{
		"ipv6 = false",
		"dns-server = " + doh,
		"direct-dns-server = " + doh,
		"fallback-dns-server = " + doh,
		"proxy-dns-server = " + doh,
		"dns-direct-system = false",
		"always-real-ip = false",
		"hijack-dns = true",
		"udp-policy-not-supported-behaviour = REJECT",
		"block-quic = all-proxy",
	}
}

// ShadowrocketStunRules routes STUN to the default proxy, then drops the
// same UDP ports if that policy is missing. Shadowrocket stops at the first
// match, so the drop lines only run when the proxy rule did not.
// PROTOCOL cannot stand alone; the documented form nests it in AND.
func ShadowrocketStunRules() []string {
	out := []string{"DOMAIN-KEYWORD,stun," + clashStunPolicy}
	for _, port := range clashStunPorts {
		out = append(out, "AND,((PROTOCOL,UDP),(DST-PORT,"+port+")),"+clashStunPolicy)
	}
	for _, port := range clashStunPorts {
		out = append(out, "AND,((PROTOCOL,UDP),(DST-PORT,"+port+")),REJECT-DROP")
	}
	return out
}
