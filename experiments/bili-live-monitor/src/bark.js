import { DEFAULT_BARK_API, DEFAULT_BARK_GROUP, DEFAULT_BARK_ICON } from "./constants.js";

function maskSecret(secret) {
  if (!secret) {
    return "";
  }

  if (secret.length <= 6) {
    return `${secret.slice(0, 1)}***${secret.slice(-1)}`;
  }

  return `${secret.slice(0, 3)}***${secret.slice(-3)}`;
}

export function buildLiveStatusNotification(liveStatus) {
  if (liveStatus.live) {
    return {
      title: `直播提醒：${liveStatus.uname} 开播了`,
      body: liveStatus.title || "直播已开始"
    };
  }

  return {
    title: `直播提醒：${liveStatus.uname} 下播了`,
    body: liveStatus.title ? `本次直播已结束：${liveStatus.title}` : "本次直播已结束"
  };
}

export function buildBarkUrl(options) {
  const {
    barkKey,
    title,
    body,
    barkApiBase = DEFAULT_BARK_API,
    icon = DEFAULT_BARK_ICON,
    group = DEFAULT_BARK_GROUP
  } = options;

  if (!barkKey) {
    throw new Error("Missing barkKey");
  }

  return (
    `${barkApiBase}/${encodeURIComponent(barkKey)}` +
    `/${encodeURIComponent(title)}` +
    `/${encodeURIComponent(body)}` +
    `?icon=${encodeURIComponent(icon)}` +
    `&group=${encodeURIComponent(group)}`
  );
}

export function buildMaskedBarkUrl(options) {
  return buildBarkUrl({
    ...options,
    barkKey: maskSecret(options.barkKey)
  });
}

export function createBarkNotifier(options) {
  const fetchImpl = options.fetchImpl || fetch;
  const barkKey = options.barkKey;
  const barkApiBase = options.barkApiBase || DEFAULT_BARK_API;
  const defaultIcon = options.defaultIcon || DEFAULT_BARK_ICON;
  const defaultGroup = options.defaultGroup || DEFAULT_BARK_GROUP;

  return {
    buildUrl(notification, overrideOptions = {}) {
      return buildBarkUrl({
        barkKey,
        barkApiBase,
        title: notification.title,
        body: notification.body,
        icon: overrideOptions.icon || defaultIcon,
        group: overrideOptions.group || defaultGroup
      });
    },

    buildMaskedUrl(notification, overrideOptions = {}) {
      return buildMaskedBarkUrl({
        barkKey,
        barkApiBase,
        title: notification.title,
        body: notification.body,
        icon: overrideOptions.icon || defaultIcon,
        group: overrideOptions.group || defaultGroup
      });
    },

    async send(notification, overrideOptions = {}) {
      const requestUrl = this.buildUrl(notification, overrideOptions);
      const response = await fetchImpl(requestUrl);

      if (!response.ok) {
        throw new Error(`Bark request failed: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();

      if (payload.code !== 200) {
        throw new Error(`Bark API error: ${JSON.stringify(payload)}`);
      }

      return {
        requestUrlMasked: this.buildMaskedUrl(notification, overrideOptions),
        response: payload
      };
    }
  };
}
