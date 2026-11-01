(function () {
  var origin = window.location.protocol === "http:" || window.location.protocol === "https:"
    ? window.location.origin
    : "https://proxy-rules.vercel.app";

  var clients = {
    qx: {
      name: "Quantumult X",
      needs: true,
      hint: "作为完整配置下载，不要加到节点订阅。重写要生效，打开 MitM 并信任证书。",
      uploaded: "作为完整配置下载。节点和 DNS 来自上传的文件。文件里如果是节点正文，更新前不会变；如果只有订阅地址，Quantumult X 还会自己拉。重写要生效，打开 MitM 并信任证书。"
    },
    sr: {
      name: "Shadowrocket",
      needs: true,
      hint: "作为配置下载，不要填到节点订阅。订阅不是小火箭配置时，节点仍在首页添加。",
      uploaded: "作为配置下载。节点和 DNS 来自上传的文件，三种客户端格式都会转成小火箭节点。要换节点就再传一次。"
    },
    flclash: {
      name: "FlClash",
      needs: false,
      hint: "先导入机场订阅，再把这个地址填进覆写脚本并关联。脚本不包含节点。",
      uploaded: "作为 Clash 配置导入，不要填进覆写脚本。允许局域网是关的。节点来自上传的文件，分流用这边的规则。"
    }
  };

  var input = document.querySelector("#subscription");
  var file = document.querySelector("#file");
  var make = document.querySelector("#make");
  var warning = document.querySelector("#warning");
  var result = document.querySelector("#result");
  var hint = document.querySelector("#hint");
  var link = document.querySelector("#link");
  var copy = document.querySelector("#copy");
  var qr = document.querySelector("#qr");
  var buttons = document.querySelectorAll("[data-client]");
  var current = "qx";
  var ticket = 0;
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
      render(isConfig(input.value));
    });
  });
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  input.addEventListener("input", function () {
    render(false);
  });
  make.addEventListener("click", function () {
    upload();
  });
  file.addEventListener("change", function () {
    var picked = file.files && file.files[0];
    if (!picked) {
      return;
    }
    if (picked.size > 2 * 1024 * 1024) {
      warning.textContent = "文件过大";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      input.value = String(reader.result || "");
      render(true);
    };
    reader.readAsText(picked);
  });
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

  render(false);

  function render(send) {
    buttons.forEach(function (button) {
      var on = button.getAttribute("data-client") === current;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var client = clients[current];
    var raw = normalize(input.value);
    var config = isConfig(raw);
    make.hidden = !config;
    if (!config) {
      ticket += 1;
      var problem = "";
      if (client.needs) {
        problem = raw ? screen(raw) : "先贴上机场订阅或配置";
      }
      warning.textContent = problem && raw ? problem : "";
      if (problem) {
        hideResult();
        return;
      }
      showLink(buildLink(current, raw), client.hint);
      return;
    }
    if (send) {
      upload();
      return;
    }
    warning.textContent = "";
    hideResult();
  }

  function upload() {
    var raw = normalize(input.value);
    if (!isConfig(raw)) {
      render(false);
      return;
    }
    var mine = ++ticket;
    var client = current;
    warning.textContent = "正在生成";
    hideResult();
    var endpoint = origin + "/api/qx?client=" + encodeURIComponent(client);
    var stored = storedId(client);
    if (stored) {
      endpoint += "&id=" + encodeURIComponent(stored);
    }
    fetch(endpoint, {
      method: "POST",
      headers: { "content-type": "text/plain; charset=utf-8" },
      body: raw
    }).then(function (response) {
      return response.text().then(function (text) {
        return { ok: response.ok, text: text };
      });
    }).then(function (response) {
      if (mine !== ticket || client !== current) {
        return;
      }
      if (!response.ok) {
        warning.textContent = response.text || "生成失败";
        return;
      }
      var payload;
      try {
        payload = JSON.parse(response.text);
      } catch (error) {
        warning.textContent = "生成失败";
        return;
      }
      if (!payload.url) {
        warning.textContent = "生成失败";
        return;
      }
      var id = idFrom(payload.url);
      if (id) {
        rememberId(client, id);
      }
      warning.textContent = "";
      showLink(payload.url, clients[client].uploaded);
    }).catch(function () {
      if (mine !== ticket) {
        return;
      }
      warning.textContent = "生成失败";
    });
  }

  function showLink(ready, text) {
    hint.textContent = text;
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

  function hideResult() {
    result.hidden = true;
    link.textContent = "";
    qr.replaceChildren();
  }

  function buildLink(client, raw) {
    if (client === "flclash") {
      return origin + "/api/flclash";
    }
    var path = client === "sr" ? "/api/sr" : "/api/qx";
    return origin + path + "?url=" + encodeURIComponent(raw);
  }

  function isConfig(raw) {
    return !!raw && !pureURL(raw);
  }

  function pureURL(raw) {
    if (!raw || raw.indexOf("\n") !== -1 || /\s/.test(raw)) {
      return false;
    }
    return screen(raw) === "";
  }

  function storedId(client) {
    try {
      var value = sessionStorage.getItem("rules-id-" + client) || "";
      return /^[0-9a-f]{32}$/.test(value) ? value : "";
    } catch (error) {
      return "";
    }
  }

  function rememberId(client, id) {
    try {
      sessionStorage.setItem("rules-id-" + client, id);
    } catch (error) {}
  }

  function idFrom(value) {
    try {
      return new URL(value).searchParams.get("id") || "";
    } catch (error) {
      return "";
    }
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
