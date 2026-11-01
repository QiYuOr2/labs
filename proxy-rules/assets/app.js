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
      name: "Clash",
      needs: false,
      hint: "不上传文件时，这个地址是覆写脚本，不包含节点。上传配置后得到完整 Clash 订阅。",
      uploaded: "作为 Clash 配置订阅导入，不要填进覆写脚本。允许局域网是关的。节点来自上传的文件，分流用这边的规则。"
    }
  };

  var composer = document.querySelector("#composer");
  var input = document.querySelector("#subscription");
  var sheet = document.querySelector("#sheet");
  var meta = document.querySelector("#meta");
  var preview = document.querySelector("#preview");
  var edit = document.querySelector("#edit");
  var clearBtn = document.querySelector("#clear");
  var toggle = document.querySelector("#toggle");
  var file = document.querySelector("#file");
  var make = document.querySelector("#make");
  var fileName = "";
  var editing = false;
  var expanded = false;
  var warning = document.querySelector("#warning");
  var result = document.querySelector("#result");
  var hint = document.querySelector("#hint");
  var link = document.querySelector("#link");
  var copy = document.querySelector("#copy");
  var remove = document.querySelector("#remove");
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
    if (picked) {
      readFile(picked);
    }
  });
  composer.addEventListener("dragover", function (event) {
    event.preventDefault();
  });
  composer.addEventListener("drop", function (event) {
    event.preventDefault();
    var picked = event.dataTransfer && event.dataTransfer.files && event.dataTransfer.files[0];
    if (picked) {
      readFile(picked);
    }
  });
  edit.addEventListener("click", function () {
    editing = !editing;
    edit.textContent = editing ? "完成" : "编辑";
    input.classList.toggle("editing", editing);
    render(false);
    if (editing) {
      input.focus();
    }
  });
  clearBtn.addEventListener("click", function () {
    input.value = "";
    file.value = "";
    fileName = "";
    editing = false;
    expanded = false;
    edit.textContent = "编辑";
    input.classList.remove("editing");
    render(false);
  });
  toggle.addEventListener("click", function () {
    expanded = !expanded;
    render(false);
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
  remove.addEventListener("click", function () {
    var owned = ownStored(link.textContent);
    if (!owned) {
      return;
    }
    if (!window.confirm("删除这条配置？")) {
      return;
    }
    var mine = ++ticket;
    warning.textContent = "正在删除";
    fetch(origin + "/api/qx?client=" + encodeURIComponent(owned.client) + "&id=" + encodeURIComponent(owned.id), {
      method: "DELETE"
    }).then(function (response) {
      return response.text().then(function (text) {
        return { ok: response.ok, text: text.trim() };
      });
    }).then(function (response) {
      if (mine !== ticket) {
        return;
      }
      if (!response.ok) {
        warning.textContent = response.text || "删除失败";
        return;
      }
      forgetId(owned.client, owned.id);
      if (sameStored(normalize(input.value), owned)) {
        input.value = "";
        file.value = "";
        fileName = "";
        editing = false;
        expanded = false;
        edit.textContent = "编辑";
        input.classList.remove("editing");
      }
      hideResult();
      render(false);
      warning.textContent = "已删除";
    }).catch(function () {
      if (mine !== ticket) {
        return;
      }
      warning.textContent = "删除失败";
    });
  });

  render(false);

  function render(send) {
    buttons.forEach(function (button) {
      var on = button.getAttribute("data-client") === current;
      button.setAttribute("aria-pressed", on ? "true" : "false");
    });
    var client = clients[current];
    var raw = normalize(input.value);
    var info = paintSheet(raw);
    var config = isConfig(raw);
    make.hidden = !config;
    var owned = ownStored(raw);
    if (owned) {
      ticket += 1;
      make.hidden = true;
      warning.textContent = "";
      showLink(owned.url, "已保存的配置。删除后这条链接失效。");
      return;
    }
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
    if (info.nodes === 0 && !send) {
      warning.textContent = info.kind ? "没有认出节点" : "没认出是哪种配置";
      hideResult();
      return;
    }
    if (send) {
      upload();
      return;
    }
    warning.textContent = "";
    hideResult();
  }

  function readFile(picked) {
    if (picked.size > 2 * 1024 * 1024) {
      warning.textContent = "文件过大";
      return;
    }
    var reader = new FileReader();
    reader.onload = function () {
      fileName = picked.name || "";
      editing = false;
      expanded = false;
      edit.textContent = "编辑";
      input.classList.remove("editing");
      input.value = String(reader.result || "");
      render(true);
    };
    reader.readAsText(picked);
  }

  function paintSheet(raw) {
    var lines = raw ? raw.split(/\r?\n/) : [];
    var info = describe(raw, lines.length);
    var long = lines.length >= 12 || raw.length > 700;
    var show = long && !editing;
    sheet.hidden = !show;
    input.hidden = show;
    if (!show) {
      return info;
    }
    meta.textContent = info.label;
    toggle.hidden = lines.length <= 160;
    toggle.textContent = expanded ? "收起" : "展开";
    preview.classList.toggle("open", expanded || lines.length <= 160);
    preview.replaceChildren();
    var gapAt = -1;
    var view = lines;
    if (!expanded && lines.length > 220) {
      view = lines.slice(0, 90).concat(lines.slice(-40));
      gapAt = 90;
    }
    view.forEach(function (line, index) {
      if (index === gapAt) {
        var gap = document.createElement("div");
        gap.className = "gap";
        gap.textContent = "省略 " + (lines.length - 130) + " 行";
        preview.appendChild(gap);
      }
      var row = document.createElement("div");
      row.className = "prow";
      var ln = document.createElement("span");
      ln.className = "ln";
      ln.textContent = String(gapAt >= 0 && index >= gapAt ? lines.length - 40 + (index - gapAt) + 1 : index + 1);
      var code = document.createElement("span");
      code.className = "code";
      code.textContent = line;
      row.appendChild(ln);
      row.appendChild(code);
      preview.appendChild(row);
    });
    return info;
  }

  function describe(raw, count) {
    var kind = detect(raw);
    var nodes = kind ? countNodes(raw, kind) : 0;
    var parts = [];
    if (fileName) {
      parts.push(fileName);
    }
    parts.push(kind ? "识别为 " + kind : "未识别");
    if (kind) {
      parts.push(nodes + " 个节点");
    }
    if (count) {
      parts.push(count + " 行");
    }
    return { label: parts.join(" · "), kind: kind, nodes: nodes };
  }

  function detect(raw) {
    if (/\[server_local\]/i.test(raw) || /\[server_remote\]/i.test(raw)) {
      return "Quantumult X";
    }
    if (/\[proxy\]/i.test(raw) || /\[proxy group\]/i.test(raw)) {
      return "Shadowrocket";
    }
    if (/(^|\n)proxies:/.test(raw) || /(^|\n)proxy-providers:/.test(raw) || /(^|\n)proxy-groups:/.test(raw)) {
      return "Clash";
    }
    if (/^(ss|ssr|vmess|vless|trojan|hysteria2|hy2):\/\//m.test(raw)) {
      return "节点链接";
    }
    return "";
  }

  function countNodes(raw, kind) {
    var lines = raw.split(/\r?\n/);
    var n = 0;
    var qxType = /^(shadowsocks|shadowsocksr|vmess|vless|trojan|https|http|socks5-tls|socks5|hysteria2|hysteria)\s*=/i;
    if (kind === "Quantumult X") {
      var inLocal = false;
      lines.forEach(function (line) {
        var s = line.trim();
        if (/^\[server_local\]$/i.test(s)) {
          inLocal = true;
          return;
        }
        if (/^\[[^\]]+\]$/.test(s)) {
          inLocal = false;
          return;
        }
        if (inLocal && qxType.test(s) && s.toLowerCase().indexOf("passphrase") < 0 && s.toLowerCase().indexOf("p12") < 0) {
          n += 1;
        }
      });
      return n;
    }
    if (kind === "Shadowrocket") {
      var inProxy = false;
      lines.forEach(function (line) {
        var s = line.trim();
        if (/^\[proxy\]$/i.test(s)) {
          inProxy = true;
          return;
        }
        if (/^\[[^\]]+\]$/.test(s)) {
          inProxy = false;
          return;
        }
        if (inProxy && /=\s*(ss|ssr|vmess|vless|trojan|http|https|socks5|socks5-tls|hysteria2|hysteria|hy2|tuic)\s*,/i.test(s)) {
          n += 1;
        }
      });
      return n;
    }
    if (kind === "Clash") {
      lines.forEach(function (line) {
        if (/^\s*type:\s*(ss|ssr|vmess|vless|trojan|http|socks5|hysteria2|tuic)\b/i.test(line)) {
          n += 1;
        } else if (/^\s*-\s*\{/.test(line) && /\btype:\s*(ss|ssr|vmess|vless|trojan|http|socks5|hysteria2|tuic)\b/i.test(line)) {
          n += 1;
        }
      });
      return n;
    }
    lines.forEach(function (line) {
      if (/^(ss|ssr|vmess|vless|trojan|hysteria2|hy2):\/\//i.test(line.trim())) {
        n += 1;
      }
    });
    return n;
  }


  function failureText(status, text) {
    var body = String(text || "").replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    if (body.length > 160) {
      body = body.slice(0, 160);
    }
    return body || ("生成失败 " + status);
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
        return { ok: response.ok, status: response.status, text: text };
      });
    }).then(function (response) {
      if (mine !== ticket || client !== current) {
        return;
      }
      if (!response.ok) {
        warning.textContent = failureText(response.status, response.text);
        return;
      }
      var payload;
      try {
        payload = JSON.parse(response.text);
      } catch (error) {
        warning.textContent = failureText(response.status, response.text);
        return;
      }
      if (!payload.url) {
        warning.textContent = failureText(response.status, "");
        return;
      }
      var id = idFrom(payload.url);
      if (id) {
        rememberId(client, id);
      }
      warning.textContent = "";
      showLink(payload.url, clients[client].uploaded);
    }).catch(function (error) {
      if (mine !== ticket) {
        return;
      }
      var detail = error && error.message ? String(error.message) : "";
      warning.textContent = detail ? "生成失败 " + detail : "生成失败";
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
    remove.hidden = !ownStored(ready);
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

  function ownStored(raw) {
    var text = String(raw || "").trim();
    if (!text || text.indexOf("\n") !== -1 || /\s/.test(text)) {
      return null;
    }
    var parsed;
    try {
      parsed = new URL(text);
    } catch (error) {
      return null;
    }
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      return null;
    }
    var host = parsed.host.toLowerCase();
    if (host !== window.location.host.toLowerCase() && host !== "proxy.qiyuor2.me" && host !== "proxy-rules.vercel.app") {
      return null;
    }
    var path = parsed.pathname.replace(/\/$/, "");
    var client = "";
    if (path === "/api/qx") {
      client = "qx";
    } else if (path === "/api/sr") {
      client = "sr";
    } else if (path === "/api/flclash") {
      client = "flclash";
    } else {
      return null;
    }
    var named = (parsed.searchParams.get("client") || "").toLowerCase();
    if (named === "sr" || named === "shadowrocket") {
      client = "sr";
    } else if (named === "flclash" || named === "clash") {
      client = "flclash";
    } else if (named === "qx" || named === "quantumultx") {
      client = "qx";
    } else if (named) {
      return null;
    }
    var id = parsed.searchParams.get("id") || "";
    if (!/^[0-9a-f]{32}$/.test(id)) {
      return null;
    }
    var publicPath = client === "sr" ? "/api/sr" : client === "flclash" ? "/api/flclash" : "/api/qx";
    return { client: client, id: id, url: parsed.origin + publicPath + "?id=" + id };
  }

  function sameStored(raw, owned) {
    var parsed = ownStored(raw);
    return !!parsed && parsed.client === owned.client && parsed.id === owned.id;
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

  function forgetId(client, id) {
    try {
      if (sessionStorage.getItem("rules-id-" + client) === id) {
        sessionStorage.removeItem("rules-id-" + client);
      }
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
