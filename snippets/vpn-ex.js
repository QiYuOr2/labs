const BAHA_AUTO_RULES = ['RULE-SET,Bahamut,台湾AUTO-FALLBACK']
const BAHA_RULES_PROVIDER = {
  type: 'http',
  behavior: 'classical',
  path: './ruleset/Bahamut.yaml',
  url: 'https://raw.githubusercontent.com/blackmatrix7/ios_rule_script/master/rule/Clash/Bahamut/Bahamut.yaml',
  interval: 86400
}

const AUTO_PROXIES = [
  {
    "name": "Proxy",
    "type": "select",
    "proxies": [
      "日本AUTO",
      "台湾AUTO-FALLBACK",
      "香港AUTO",
      "DIRECT"
    ]
  },
  {
    "name": "日本AUTO",
    "type": "url-test",
    "proxies": [],
    "url": "https://cp.cloudflare.com/generate_204",
    "interval": 86400
  },
  {
    "name": "台湾AUTO",
    "type": "url-test",
    "proxies": [],
    "url": "https://cp.cloudflare.com/generate_204",
    "interval": 86400
  },
  {
    "name": "香港AUTO",
    "type": "url-test",
    "proxies": [],
    "url": "https://cp.cloudflare.com/generate_204",
    "interval": 86400
  },
  {
    "name": "台湾AUTO-FALLBACK",
    "type": "fallback",
    "proxies": ["台湾AUTO", "香港AUTO", "DIRECT"],
    "url": "https://cp.cloudflare.com/generate_204",
    "interval": 86400
  }
]

function main(config, profileName) {
  const rules = config["rules"]
  const ruleProviders = config["rule-providers"] || {}

  const proxyGroups = config["proxy-groups"]
  const proxies = config["proxies"]
  const jpProxies = proxies.filter(proxy => proxy.name.includes("日本"))
  const twProxies = proxies.filter(proxy => proxy.name.includes("台湾"))
  const hkProxies = proxies.filter(proxy => proxy.name.includes("香港"))
  
  AUTO_PROXIES[1].proxies = jpProxies.map(proxy => proxy.name)
  AUTO_PROXIES[2].proxies = twProxies.map(proxy => proxy.name)
  AUTO_PROXIES[3].proxies = hkProxies.map(proxy => proxy.name)


  config["proxy-groups"] = AUTO_PROXIES.concat(proxyGroups)

  ruleProviders["Bahamut"] = BAHA_RULES_PROVIDER
  config["rule-providers"] = ruleProviders

  config["rules"] = BAHA_AUTO_RULES.concat(rules)

  return config;
}
