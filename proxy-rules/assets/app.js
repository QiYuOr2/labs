(function () {
  var origin = window.location.protocol === "http:" || window.location.protocol === "https:"
    ? window.location.origin
    : "https://proxy-rules.vercel.app";

  var clients = {
    qx: {
      name: "Quantumult X",
      needs: true,
      hint: "作为完整配置下载，不要加到节点订阅。重写要生效，打开 MitM 并信任证书。",
      uploaded: "作为完整配置下载。节点和 DNS 来自上传的文件。文件里如果是节点正文，更新前不会变；如果只有订阅地址，Quantumult X 还会自己拉。重写要生效，打开 MitM 并信任证书。",
      updated: "新文件已经保存到同一条链接。地址没有变，文件里如果是节点正文，Quantumult X 下次拉取时才会拿到新的。"
    },
    sr: {
      name: "Shadowrocket",
      needs: true,
      hint: "作为配置下载，不要填到节点订阅。订阅不是小火箭配置时，节点仍在首页添加。",
      uploaded: "作为配置下载。节点和 DNS 来自上传的文件，三种客户端格式都会转成小火箭节点。要换节点就再传一次。",
      updated: "新文件已经保存到同一条链接。地址没有变，小火箭下次更新配置时才会拿到新的。"
    },
    flclash: {
      name: "Clash",
      needs: false,
      hint: "不上传文件时，这个地址是覆写脚本，不包含节点。上传配置后得到完整 Clash 订阅。",
      uploaded: "作为 Clash 配置订阅导入，不要填进覆写脚本。允许局域网是关的。节点来自上传的文件，分流用这边的规则。",
      updated: "新文件已经保存到同一条链接。地址没有变，Clash 下次更新订阅时才会拿到新的。"
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
  var updateBtn = document.querySelector("#update");
  var updater = document.querySelector("#updater");
  var updateNote = document.querySelector("#update-note");
  var upLink = document.querySelector("#up-link");
  var upKey = document.querySelector("#up-key");
  var upSave = document.querySelector("#up-save");
  var upForget = document.querySelector("#up-forget");
  var upCancel = document.querySelector("#up-cancel");
  var qr = document.querySelector("#qr");
  var buttons = document.querySelectorAll("[data-client]");
  var current = "qx";
  var ticket = 0;
  // The link the next upload replaces: { client, id, key }.
  var activeTarget = null;
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
  if (remove) {
    remove.addEventListener("click", removeLink);
  }
  if (updateBtn) {
    updateBtn.addEventListener("click", openUpdater);
  }
  if (upSave) {
    upSave.addEventListener("click", saveUpdater);
  }
  if (upForget) {
    upForget.addEventListener("click", forgetLinkKey);
  }
  if (upCancel) {
    upCancel.addEventListener("click", closeUpdater);
  }

  function removeLink() {
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
      forgetKey(owned.client, owned.id);
      if (sameStored(normalize(input.value), owned)) {
        input.value = "";
        file.value = "";
        fileName = "";
        editing = false;
        expanded = false;
        edit.textContent = "编辑";
        input.classList.remove("editing");
      }
      closeUpdater();
      hideResult();
      render(false);
      warning.textContent = "已删除";
    }).catch(function () {
      if (mine !== ticket) {
        return;
      }
      warning.textContent = "删除失败";
    });
  }

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
    if (owned && !sameAsTarget(owned)) {
      ticket += 1;
      make.hidden = true;
      warning.textContent = "";
      showLink(owned.url, "已保存的配置。删除后这条链接失效。");
      return;
    }
    // An update target turns the upload button into a save. Nothing to send
    // yet until a new file is in the box.
    make.hidden = !config;
    if (owned) {
      warning.textContent = "正在修改这条链接。换一个文件后点「更新」保存，地址不变。";
      hideResult();
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
    warning.textContent = !send && idleHint();
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
    // An update target wins over the id saved in this tab: the file is going
    // to the link the user typed, not to the one they saved earlier.
    var to = target();
    if (!to) {
      var stored = storedId(client);
      if (stored) {
        to = { client: client, id: stored };
      }
    }
    warning.textContent = "正在生成";
    hideResult();
    var endpoint = origin + "/api/qx?client=" + encodeURIComponent(client);
    if (to) {
      endpoint += "&id=" + encodeURIComponent(to.id);
      if (to.key) {
        endpoint += "&update=" + encodeURIComponent(to.key);
      }
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
        warning.textContent = response.status === 404
          ? "这条配置不存在，或更新密钥不对"
          : failureText(response.status, response.text);
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
        rememberKey(client, id, payload.updateKey || (to && to.key) || "");
      }
      closeUpdater();
      warning.textContent = "";
      showLink(payload.url, to ? clients[client].updated : clients[client].uploaded);
    }).catch(function (error) {
      if (mine !== ticket) {
        return;
      }
      var detail = error && error.message ? String(error.message) : "";
      warning.textContent = detail ? "生成失败 " + detail : "生成失败";
    });
  }

  // forgetLinkKey drops the key of one link when the user asks to stop
  // updating it. It is used by the updater after a key was saved by mistake.
  function forgetLinkKey() {
    var to = target();
    if (!to) {
      return;
    }
    if (!window.confirm("忘记这条链接的密钥？之后就不能在这台设备上更新它了。")) {
      return;
    }
    forgetKey(to.client, to.id);
    setTarget({ client: to.client, id: to.id, key: "" });
    if (upKey) {
      upKey.value = "";
    }
    warning.textContent = "已忘记这条链接的密钥";
    render(false);
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
    var here = ownStored(ready);
    if (remove) {
      remove.hidden = !here;
    }
    // Only a link this page can address has an update to offer.
    if (updateBtn) {
      updateBtn.hidden = !here;
      if (here) {
        updateBtn.setAttribute("data-id", here.id);
        updateBtn.setAttribute("data-client", here.client);
      }
    }
    if (here && !isTarget(here.client, here.id)) {
      closeUpdater();
    }
    result.hidden = false;
  }

  function idleHint() {
    return target() ? "换一个文件后点「更新」，这条链接的地址不变。" : "";
  }

  function targetHint() {
    var to = target();
    if (!to) {
      return "";
    }
    return "新文件会覆盖 " + ({ qx: "Quantumult X", sr: "Shadowrocket", flclash: "Clash" }[to.client] || to.client) +
      " 那条链接，地址不变。密钥不对时不会写入。";
  }

  // openUpdater asks for the link that should be replaced. The id alone is
  // enough when the link was made here; otherwise the saved key is needed.
  function openUpdater() {
    var here = ownStored(link.textContent);
    if (!here) {
      return;
    }
    var key = knownKey(here.client, here.id);
    upLink.value = here.url;
    upKey.value = key || "";
    updateNote.textContent = key
      ? "这条链接可以更新。换一个文件，再点「更新」。"
      : "这条链接没有本机密钥。密钥在上传那一刻给过一次，贴进来才能覆盖。";
    updateNote.hidden = false;
    updater.hidden = false;
    setTarget({ client: here.client, id: here.id, key: key });
    render(false);
  }

  function closeUpdater() {
    if (updater) {
      updater.hidden = true;
    }
    setTarget(null);
  }

  // saveUpdater checks the two inputs the user typed, then makes that link the
  // upload target. A bad key is refused by the server before anything is
  // written, and this check keeps the page from sending an obviously wrong one.
  function saveUpdater() {
    var raw = String(upLink.value || "").trim();
    var key = String(upKey.value || "").trim();
    var found = ownStored(raw) || idOnly(raw);
    if (!found) {
      warning.textContent = "链接里没有 id，先复制生成过的地址";
      return;
    }
    if (key && !/^[0-9a-f]{32}$/.test(key)) {
      warning.textContent = "更新密钥是 32 位十六进制";
      return;
    }
    if (key) {
      rememberKey(found.client, found.id, key);
    } else {
      key = knownKey(found.client, found.id);
    }
    if (current !== found.client) {
      current = found.client;
      try {
        sessionStorage.setItem("rules-client", current);
      } catch (error) {}
    }
    setTarget({ client: found.client, id: found.id, key: key });
    if (updater) {
      updater.hidden = true;
    }
    render(false);
    showLink(found.url, targetHint() + " 换一个文件后点「更新」保存。");
    warning.textContent = "已选中这条链接。换一个文件后点「更新」，地址不变。";
  }

  // idOnly reads a bare 32 hex id, so the key can be typed next to it.
  function idOnly(raw) {
    var text = String(raw || "").trim();
    if (!/^[0-9a-f]{32}$/.test(text)) {
      return null;
    }
    var client = clients[current] ? current : "qx";
    var path = client === "sr" ? "/api/sr" : client === "flclash" ? "/api/flclash" : "/api/qx";
    return { client: client, id: text, url: origin + path + "?id=" + text };
  }

  function target() {
    return activeTarget && clients[activeTarget.client] ? activeTarget : null;
  }

  function setTarget(value) {
    activeTarget = value;
  }

  function isTarget(client, id) {
    var to = target();
    return !!to && to.client === client && to.id === id;
  }

  function sameAsTarget(owned) {
    return isTarget(owned.client, owned.id);
  }

  function hideResult() {
    result.hidden = true;
    link.textContent = "";
    qr.replaceChildren();
    if (updateBtn) {
      updateBtn.hidden = true;
    }
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

  // The key is what lets another browser replace this link later. It lives in
  // localStorage, so a closed tab does not lose it.
  function knownKey(client, id) {
    try {
      var value = localStorage.getItem("rules-key-" + client + "-" + id) || "";
      return /^[0-9a-f]{32}$/.test(value) ? value : "";
    } catch (error) {
      return "";
    }
  }

  function rememberKey(client, id, key) {
    if (!key || !/^[0-9a-f]{32}$/.test(key)) {
      return false;
    }
    try {
      localStorage.setItem("rules-key-" + client + "-" + id, key);
      return true;
    } catch (error) {
      return false;
    }
  }

  function forgetKey(client, id) {
    try {
      localStorage.removeItem("rules-key-" + client + "-" + id);
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
