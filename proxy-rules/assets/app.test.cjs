const assert = require("node:assert/strict");
const fs = require("node:fs");
const path = require("node:path");
const vm = require("node:vm");
const { test } = require("node:test");

// Run the actual page script and capture uploads without contacting a server.
function createApp(client = "qx") {
  const elements = new Map();
  function element(selector) {
    if (!elements.has(selector)) {
      elements.set(selector, {
        value: "", textContent: "", hidden: true, files: [],
        listeners: {},
        addEventListener(name, listener) { this.listeners[name] = listener; },
        setAttribute() {},
        replaceChildren() {},
        appendChild() {},
        classList: { add() {}, remove() {}, toggle() {} }
      });
    }
    return elements.get(selector);
  }
  const requests = [];
  vm.runInNewContext(fs.readFileSync(path.join(__dirname, "app.js"), "utf8"), {
    URL,
    window: { location: { protocol: "https:", origin: "https://proxy.example", host: "proxy.example" } },
    document: {
      querySelector: element,
      querySelectorAll: () => [],
      createElement: () => element("generated")
    },
    sessionStorage: { getItem: key => key === "rules-client" ? client : null },
    FileReader: class {
      readAsText(file) { this.result = file.body; this.onload(); }
    },
    fetch(url, options) {
      requests.push({ url, ...options });
      return new Promise(() => {});
    }
  });
  return { element, requests };
}

for (const client of ["qx", "sr", "flclash"]) {
  for (const quote of ["'", '"']) {
    test(`${client}: file and paste uploads preserve a quoted final YAML rule (${quote})`, () => {
      const body = "proxies:\n" +
        "  - {name: Japan, type: ss, server: example.com, port: 443, cipher: aes-128-gcm, password: secret}\n" +
        "rules:\n  - " + quote + "MATCH,DIRECT" + quote;
      for (const mode of ["file", "paste"]) {
        const app = createApp(client);
        if (mode === "file") {
          const file = app.element("#file");
          file.files = [{ name: "subscription.yaml", size: body.length, body }];
          file.listeners.change();
        } else {
          app.element("#subscription").value = body;
          app.element("#subscription").listeners.input();
          app.element("#make").listeners.click();
        }
        assert.equal(app.requests.length, 1, mode);
        assert.equal(app.requests[0].url, "https://proxy.example/api/qx?client=" + client);
        assert.equal(app.requests[0].method, "POST");
        assert.equal(app.requests[0].body, body, mode);
      }
    });
  }
}

test("quoted URLs and nested subscription URLs still generate links", () => {
  const subscription = "https://example.com/sub?token=demo";
  for (const raw of [subscription, "'" + subscription + "'", '"' + subscription + '"',
    "'https://proxy.example/api/qx?url=" + encodeURIComponent(subscription) + "'"]) {
    const app = createApp();
    app.element("#subscription").value = raw;
    app.element("#subscription").listeners.input();
    assert.equal(app.element("#link").textContent,
      "https://proxy.example/api/qx?url=" + encodeURIComponent(subscription));
    assert.equal(app.requests.length, 0);
  }
});
