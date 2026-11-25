(function () {
  var origin = window.location.protocol === "http:" || window.location.protocol === "https:"
    ? window.location.origin
    : "https://proxy-rules.vercel.app";

  var clients = {
    qx: {
      name: "Quantumult X",
      needs: true,
      hint: "作为完整配置下载，不要加到节点订阅。重写要生效，打开 MitM 并信任证书。",
      uploaded: "已生成。作为完整配置下载。节点和 DNS 来自你上传的文件。",
      updated: "已用新文件覆盖这条链接，地址不变。"
    },
    sr: {
      name: "Shadowrocket",
      needs: true,
      hint: "作为配置下载，不要填到节点订阅。订阅不是小火箭配置时，节点仍在首页添加。",
      uploaded: "已生成。作为配置下载。节点和 DNS 来自你上传的文件。",
      updated: "已用新文件覆盖这条链接，地址不变。"
    },
    flclash: {
      name: "Clash",
      needs: false,
      hint: "不上传文件时，这个地址是覆写脚本，不包含节点。上传配置后得到完整 Clash 订阅。",
      uploaded: "已生成。作为 Clash 配置订阅导入，不要填进覆写脚本。",
      updated: "已用新文件覆盖这条链接，地址不变。"
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
  var linksSection = document.querySelector("#links");
  var linkList = document.querySelector("#linklist");
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
      render(false);
    });
  });
  document.querySelector("form").addEventListener("submit", function (event) {
    event.preventDefault();
  });
  input.addEventListener("input", function () {
    render(false);
  });
  make.addEventListener("click", function () {
    upload(null, null);
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
    // 清空就是重新开始：下次生成是一条新链接，不覆盖本 tab 上次那条。
    forgetStoredId(current);
    render(false);
  });
  toggle.addEventListener("click", function () {
    expanded = !expanded;
    render(false);
  });
  copy.addEventListener("click", function () {
    copyText(link.textContent, copy, "复制");
  });
  if (remove) {
    remove.addEventListener("click", removeLink);
  }

  function copyText(value, button, label) {
    if (!value) {
      return;
    }
    var done = function () {
      button.textContent = "已复制";
      window.setTimeout(function () {
        button.textContent = label;
      }, 1400);
    };
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(value).then(done, function () {
        fallbackCopy(value);
        done();
      });
      return;
    }
    fallbackCopy(value);
    done();
  }

  function fallbackCopy(value) {
    var area = document.createElement("textarea");
    area.value = value;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    document.body.appendChild(area);
    area.select();
    try {
      document.execCommand("copy");
    } catch (error) {}
    document.body.removeChild(area);
  }

  // removeLink deletes the link shown in the result box.
  function removeLink() {
    var owned = ownStored(link.textContent);
    if (!owned) {
      return;
    }
    deleteStored(owned, function () {
      hideResult();
      warning.textContent = "已删除";
      loadLinks();
    });
  }

  function deleteStored(owned, done) {
    if (!window.confirm("删除这条链接？删除后客户端里的地址就失效了。")) {
      return;
    }
    warning.textContent = "正在删除";
    fetch(origin + "/api/qx?client=" + encodeURIComponent(owned.client) + "&id=" + encodeURIComponent(owned.id), {
      method: "DELETE"
    }).then(function (response) {
      return response.text().then(function (text) {
        return { ok: response.ok, text: text.trim() };
      });
    }).then(function (response) {
      if (!response.ok) {
        warning.textContent = response.text || "删除失败";
        return;
      }
      forgetId(owned.client, owned.id);
      forgetKey(owned.client, owned.id);
      if (done) {
        done();
      }
    }).catch(function () {
      warning.textContent = "删除失败";
    });
  }

  render(false);
  loadLinks();

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
      // 输入框里是一条已生成的链接：直接展示它，不当成待生成内容。
      ticket += 1;
      make.hidden = true;
      warning.textContent = "";
      showLink(owned.url, "这是已生成的链接。要换内容，请到下方「已生成的链接」里点「换文件覆盖」。");
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
      upload(null, null);
      return;
    }
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
    if (kind === "Quantumult X") {
      var inLocal = false;
      lines.forEach(function (line) {
        var s = line.trim();
        if (/^\[server_local\]$/i.test(s)) { inLocal = true; return; }
        if (/^\[[^\]]+\]$/.test(s)) { inLocal = false; return; }
        if (inLocal && /^(shadowsocks|shadowsocksr|vmess|vless|trojan|https|http|socks5-tls|socks5|hysteria2|hysteria)\s*=/i.test(s) && s.toLowerCase().indexOf("passphrase") < 0 && s.toLowerCase().indexOf("p12") < 0) {
          n += 1;
        }
      });
      return n;
    }
    if (kind === "Shadowrocket") {
      var inProxy = false;
      lines.forEach(function (line) {
        var s = line.trim();
        if (/^\[proxy\]$/i.test(s)) { inProxy = true; return; }
        if (/^\[[^\]]+\]$/.test(s)) { inProxy = false; return; }
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

  // upload sends the textarea content. When to is set, it overwrites that link.
  function upload(to, onDone) {
    var raw = normalize(input.value);
    if (!isConfig(raw)) {
      render(false);
      return;
    }
    var mine = ++ticket;
    var client = (to && clients[to.client]) ? to.client : current;
    if (!to) {
      var stored = storedId(client);
      if (stored) {
        to = { client: client, id: stored, key: knownKey(client, stored) };
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
      if (mine !== ticket) {
        return;
      }
      if (!response.ok) {
        var reason = failureText(response.status, response.text);
        var next = "";
        if (response.status === 403) {
          next = "这条链接不是在本浏览器生成的，需要它的更新密钥。";
        } else if (response.status === 503) {
          next = "服务端还没配置好存储，请稍后再试。";
        }
        warning.textContent = next ? reason + " " + next : reason;
        if (onDone) {
          onDone(false, { status: response.status, reason: reason });
        }
        return;
      }
      var payload;
      try {
        payload = JSON.parse(response.text);
      } catch (error) {
        warning.textContent = failureText(response.status, response.text);
        if (onDone) { onDone(false, {}); }
        return;
      }
      if (!payload.url) {
        warning.textContent = failureText(response.status, "");
        if (onDone) { onDone(false, {}); }
        return;
      }
      var id = idFrom(payload.url);
      if (id) {
        rememberId(client, id);
        rememberKey(client, id, payload.updateKey || (to && to.key) || "");
      }
      warning.textContent = "";
      if (onDone) {
        onDone(true, { url: payload.url, id: id, client: client });
      } else {
        showLink(payload.url, to ? clients[client].updated : clients[client].uploaded);
        loadLinks();
      }
    }).catch(function (error) {
      if (mine !== ticket) {
        return;
      }
      var detail = error && error.message ? String(error.message) : "";
      warning.textContent = detail ? "生成失败 " + detail : "生成失败";
      if (onDone) {
        onDone(false, { reason: detail || "生成失败" });
      }
    });
  }

  // override sends a fresh file (already read into text) to one existing link.
  function override(text, info, card, key) {
    var raw = text;
    if (!raw || !isConfig(raw)) {
      setCardHint(card, "这个文件不是可识别的配置。");
      return;
    }
    var client = info.client;
    var mine = ++ticket;
    setCardHint(card, "正在覆盖…");
    var endpoint = origin + "/api/qx?client=" + encodeURIComponent(client) + "&id=" + encodeURIComponent(info.id);
    if (key) {
      endpoint += "&update=" + encodeURIComponent(key);
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
      if (mine !== ticket) {
        return;
      }
      if (!response.ok) {
        var reason = failureText(response.status, response.text);
        if (response.status === 403) {
          // 这条链接需要密钥：引导用户贴一次，记住后续自动带。
          promptKey(card, info, text);
        } else {
          setCardHint(card, reason);
        }
        return;
      }
      var payload;
      try {
        payload = JSON.parse(response.text);
      } catch (error) {
        setCardHint(card, "覆盖失败");
        return;
      }
      if (payload.updateKey) {
        rememberKey(client, info.id, payload.updateKey);
      }
      setCardHint(card, "已覆盖，地址不变 ✓", true);
      loadLinks();
    }).catch(function () {
      setCardHint(card, "覆盖失败");
    });
  }

  // promptKey asks for the key once when a link was made in another browser.
  function promptKey(card, info, text) {
    var existing = card.querySelector(".keyrow");
    if (existing) {
      return;
    }
    var row = document.createElement("div");
    row.className = "keyrow";
    row.style.marginTop = "8px";
    var note = document.createElement("p");
    note.style.margin = "0 0 6px";
    note.style.fontSize = "13px";
    note.style.color = "#555";
    note.textContent = "这条链接不是在本浏览器生成的，需要它的更新密钥（第一次生成时显示过的那串 32 位字符）。贴一次，之后本机自动记住。";
    var inputKey = document.createElement("input");
    inputKey.type = "text";
    inputKey.placeholder = "更新密钥";
    inputKey.style.padding = "6px 8px";
    inputKey.style.border = "1px solid #1c1c1c";
    inputKey.style.font = "13px/1.4 ui-monospace, monospace";
    inputKey.style.width = "100%";
    inputKey.style.marginBottom = "6px";
    var go = document.createElement("button");
    go.type = "button";
    go.textContent = "用这个密钥覆盖";
    go.addEventListener("click", function () {
      var k = String(inputKey.value || "").trim();
      if (!/^[0-9a-f]{32}$/.test(k)) {
        note.textContent = "密钥是 32 位十六进制字符，最后一条报错里没有的话请重新生成一条新链接。";
        return;
      }
      row.remove();
      override(text, info, card, k);
    });
    row.appendChild(note);
    row.appendChild(inputKey);
    row.appendChild(go);
    card.appendChild(row);
  }

  function setCardHint(card, text, ok) {
    var line = card.querySelector(".hintline");
    if (line) {
      line.textContent = text || "";
      line.style.color = ok ? "#1a7f37" : "#9d2c2c";
    }
  }

  // loadLinks fills the "已生成的链接" list from /api/list.
  function loadLinks() {
    if (!linksSection) {
      return;
    }
    fetch(origin + "/api/list?format=json", { headers: { "accept": "application/json" } })
      .then(function (r) {
        return r.json();
      })
      .then(function (payload) {
        renderLinks(payload.links || []);
      })
      .catch(function () {
        // 存储还没配好或网络问题：静默隐藏列表，不打扰主流程。
        linksSection.hidden = true;
      });
  }

  function renderLinks(links) {
    if (!linkList) {
      return;
    }
    linkList.replaceChildren();
    if (!links.length) {
      linksSection.hidden = true;
      return;
    }
    linksSection.hidden = false;
    links.forEach(function (item) {
      linkList.appendChild(buildRow(item));
    });
  }

  function pathFor(client) {
    return client === "sr" ? "/api/sr" : client === "flclash" ? "/api/flclash" : "/api/qx";
  }

  // buildRow is one line in the link table: type + id tail on the left,
  // updated time, then the actions on the right. The full URL opens below.
  function buildRow(item) {
    var wrap = document.createElement("div");
    wrap.className = "linkrow-item";
    wrap.setAttribute("data-client", item.client);
    wrap.setAttribute("data-id", item.id);

    var row = document.createElement("div");
    row.className = "lrow";

    var ident = document.createElement("div");
    ident.className = "lcell-ident";
    var tag = document.createElement("span");
    tag.className = "tag " + (clients[item.client] ? item.client : "other");
    tag.textContent = item.clientName || item.client;
    var tail = document.createElement("span");
    tail.className = "idtail";
    tail.textContent = "id 尾号 " + (item.short || "");
    ident.appendChild(tag);
    ident.appendChild(tail);

    var when = document.createElement("div");
    when.className = "lcell-when";
    when.textContent = formatTime(item.updatedAt);

    var full = origin + pathFor(item.client) + "?id=" + item.id;

    var ops = document.createElement("div");
    ops.className = "lcell-ops";

    var showBtn = document.createElement("button");
    showBtn.type = "button";
    showBtn.className = "btn-ghost";
    showBtn.textContent = "链接";
    var url = document.createElement("p");
    url.className = "url";
    url.textContent = full;
    url.hidden = true;
    showBtn.addEventListener("click", function () {
      url.hidden = !url.hidden;
      showBtn.textContent = url.hidden ? "链接" : "收起";
    });

    var copyBtn = document.createElement("button");
    copyBtn.type = "button";
    copyBtn.className = "btn-ghost";
    copyBtn.textContent = "复制";
    copyBtn.addEventListener("click", function () {
      copyText(full, copyBtn, "复制");
    });

    // 换文件覆盖：选一个文件就直接覆盖这条链接，地址不变。
    var fileLabel = document.createElement("label");
    fileLabel.className = "file btn-ghost";
    fileLabel.textContent = "换文件";
    var fileInput = document.createElement("input");
    fileInput.type = "file";
    fileInput.accept = ".conf,.txt,.yaml,.yml,.list";
    fileInput.addEventListener("change", function () {
      var picked = fileInput.files && fileInput.files[0];
      if (!picked) {
        return;
      }
      if (picked.size > 2 * 1024 * 1024) {
        setCardHint(wrap, "文件过大");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        var key = knownKey(item.client, item.id);
        override(String(reader.result || ""), item, wrap, key);
      };
      reader.readAsText(picked);
      fileInput.value = "";
    });
    fileLabel.appendChild(fileInput);

    var delBtn = document.createElement("button");
    delBtn.type = "button";
    delBtn.className = "btn-ghost btn-danger";
    delBtn.textContent = "删除";
    delBtn.setAttribute("data-act", "danger");
    delBtn.addEventListener("click", function () {
      deleteStored({ client: item.client, id: item.id }, function () {
        if (sameStored(link.textContent, { client: item.client, id: item.id })) {
          hideResult();
        }
        loadLinks();
      });
    });

    ops.appendChild(showBtn);
    ops.appendChild(copyBtn);
    ops.appendChild(fileLabel);
    ops.appendChild(delBtn);

    row.appendChild(ident);
    row.appendChild(when);
    row.appendChild(ops);

    var hintline = document.createElement("p");
    hintline.className = "hintline";

    wrap.appendChild(row);
    wrap.appendChild(url);
    wrap.appendChild(hintline);
    return wrap;
  }

  function formatTime(value) {
    var t = new Date(value);
    if (isNaN(t.getTime())) {
      return value || "";
    }
    var pad = function (n) { return n < 10 ? "0" + n : "" + n; };
    return t.getFullYear() + "-" + pad(t.getMonth() + 1) + "-" + pad(t.getDate()) + " " + pad(t.getHours()) + ":" + pad(t.getMinutes());
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

  function forgetStoredId(client) {
    try {
      sessionStorage.removeItem("rules-id-" + client);
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
    var raw = value.trim();
    if (!raw) {
      return "";
    }
    try {
      var candidate = raw;
      if ((raw[0] === "'" || raw[0] === '"') && raw[raw.length - 1] === raw[0]) {
        candidate = raw.slice(1, -1).trim();
      }
      var parsed = new URL(candidate);
      var nested = parsed.searchParams.get("url");
      if (nested && (parsed.pathname === "/api/qx" || parsed.pathname === "/api/sr")) {
        return nested.trim();
      }
      return candidate;
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
