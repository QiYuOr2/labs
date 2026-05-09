import { DEFAULT_BILIBILI_API } from "./constants.js";

const DEFAULT_HEADERS = {
  "user-agent": "Mozilla/5.0",
  "accept": "application/json, text/plain, */*"
};

export function createBilibiliLiveClient(options = {}) {
  const fetchImpl = options.fetchImpl || fetch;
  const apiBase = options.apiBase || DEFAULT_BILIBILI_API;
  const headers = {
    ...DEFAULT_HEADERS,
    ...(options.headers || {})
  };

  return {
    async getLiveStatus(roomId) {
      if (!Number.isInteger(roomId) || roomId <= 0) {
        throw new Error(`Invalid roomId: ${roomId}`);
      }

      const url = new URL(apiBase);
      url.searchParams.set("room_id", String(roomId));

      const response = await fetchImpl(url.toString(), {
        headers
      });

      if (!response.ok) {
        throw new Error(`Bilibili API request failed: ${response.status} ${response.statusText}`);
      }

      const payload = await response.json();

      if (payload.code !== 0 || !payload.data) {
        throw new Error(`Bilibili API error: ${JSON.stringify(payload)}`);
      }

      return {
        roomId,
        live: payload.data.live_status === 1,
        title: payload.data.title || "",
        uname: payload.data.uname || "主播",
        cover: payload.data.user_cover || "",
        roomUrl: `https://live.bilibili.com/${roomId}`
      };
    }
  };
}
