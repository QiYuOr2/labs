(function () {
  var origin = window.location.protocol === "http:" || window.location.protocol === "https:"
    ? window.location.origin
    : "https://proxy-rules.vercel.app";

  var clients = {
    qx: {
      name: "Quantumult X",
      needs: true,
      hint: "作为完整配置下载，不要加到节点订阅。重写要生效，打开 MitM 并信任证书。"
    },
    sr: {
      name: "Shadowrocket",
      needs: true,
      hint: "作为配置下载，不要填到节点订阅。订阅不是小火箭配置时，节点仍在首页添加。"
    },
    flclash: {
      name: "FlClash",
      needs: false,
      hint: "先导入机场订阅，再把这个地址填进覆写脚本并关联。脚本不包含节点。"
    }
  };

  var input = document.querySelector("#subscription");
  var warning = document.querySelector("#warning");
  var result = document.querySelector("#result");
  var hint = document.querySelector("#hint");
  var link = document.querySelector("#link");
  var copy = document.querySelector("#copy");
  var qr = document.querySelector("#qr");
  var buttons = document.querySelectorAll("[data-client]");
  var current = "qx";
  try {
    var saved = sessionStorage.getItem("rules-client");
    if (clients[saved]) {
      current = saved;
    }
  } catch (error) {}

  buttons.forEach(function (button) {
    button.addEventListener("click", function () {
      current = button.getAttribute("data-client");
      try {
        sessionStorage.setItem("rules-client", current);
      } catch (error) {}
      render();
    });
  });
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  input.addEventListener("input", render);
  copy.addEventListener("click", function () {
    var value = link.textContent;
    if (!value) {
      return;
    }
    var done = function () {
      copy.textContent = "已复制";
      window.setTimeout(function () {
        copy.textContent = "复制";
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, selectCopy);
      return;
    }
    selectCopy();
    function selectCopy() {
      var range = document.createRange();
      range.selectNodeContents(link);
      var selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      try {
        document.execCommand("copy");
      } catch (error) {}
      done();
    }
  });

  render();

  function render() {
    buttons.forEach(function (button) {
      var on = button.getAttribute("data-client") === current;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var client = clients[current];
    var raw = normalize(input.value);
    var problem = "";
    if (client.needs) {
      problem = raw ? screen(raw) : "先贴上机场订阅";
    }
    warning.textContent = problem && raw ? problem : "";
    if (problem) {
      result.hidden = true;
      link.textContent = "";
      qr.replaceChildren();
      return;
    }
    var ready = buildLink(current, raw);
    hint.textContent = client.hint;
    link.textContent = ready;
    qr.replaceChildren();
    var svg = drawQR(ready);
    if (svg) {
      qr.innerHTML = svg;
    } else {
      var note = document.createElement("p");
      note.className = "qr-miss";
      note.textContent = "链接太长，二维码装不下。复制上面的地址即可。";
      qr.appendChild(note);
    }
    result.hidden = false;
  }

  function buildLink(client, raw) {
    if (client === "flclash") {
      return origin + "/api/flclash";
    }
    var path = client === "sr" ? "/api/sr" : "/api/qx";
    return origin + path + "?url=" + encodeURIComponent(raw);
  }

  function normalize(value) {
    var raw = value.trim().replace(/^['"]|['"]$/g, "");
    if (!raw) {
      return "";
    }
    try {
      var parsed = new URL(raw);
      var nested = parsed.searchParams.get("url");
      if (nested && (parsed.pathname === "/api/qx" || parsed.pathname === "/api/sr")) {
        return nested.trim();
      }
    } catch (error) {}
    return raw;
  }

  function screen(raw) {
    var parsed;
    try {
      parsed = new URL(raw);
    } catch (error) {
      return "订阅链接无效";
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return "订阅链接无效";
    }
    if (raw.indexOf(",") !== -1 || parsed.username || parsed.password) {
      return "订阅链接无效";
    }
    var host = parsed.hostname.toLowerCase().replace(/\.$/, "");
    if (!host || host === "localhost" || host.endsWith(".localhost") || host.endsWith(".local")) {
      return "这个地址不能用";
    }
    if (host === "metadata.google.internal" || host === "metadata.google.com") {
      return "这个地址不能用";
    }
    if (privateHost(host)) {
      return "这个地址不能用";
    }
    return "";
  }

  function privateHost(host) {
    var match = host.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
    if (match) {
      var parts = match.slice(1).map(Number);
      if (parts.some(function (part) { return part > 255; })) {
        return false;
      }
      var a = parts[0];
      var b = parts[1];
      if (a === 0 || a === 10 || a === 127) {
        return true;
      }
      if (a === 100 && (b & 192) === 64) {
        return true;
      }
      if (a === 169 && b === 254) {
        return true;
      }
      if (a === 172 && b >= 16 && b <= 31) {
        return true;
      }
      if (a === 192 && b === 168) {
        return true;
      }
      if (a >= 224) {
        return true;
      }
    }
    if (host.indexOf(":") !== -1) {
      var lower = host.toLowerCase();
      return lower === "::1" || lower === "::" || lower.indexOf("fc") === 0 || lower.indexOf("fd") === 0 || lower.indexOf("fe80:") === 0;
    }
    return false;
  }

  function drawQR(value) {
    var levels = ["M", "L"];
    for (var i = 0; i < levels.length; i++) {
      try {
        var code = qrcode(0, levels[i]);
        code.addData(value);
        code.make();
        return code.createSvgTag({ cellSize: 4, margin: 12, scalable: true, alt: "配置链接" });
      } catch (error) {}
    }
    return "";
  }
})();
