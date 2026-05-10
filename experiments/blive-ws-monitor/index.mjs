import { startListen } from "blive-message-listener";
import dayjs from "dayjs";
import { barkURL } from "./bark.mjs";
import "dotenv/config";

function timeMarker(timestamp) {
  return dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");
}

function sendMessage(options) {
  const time = timeMarker(options.timestamp);
  console.log(`[${time}] ${options.title}`);
  fetch(
    barkURL({
      title: `【blive-ws-monitor】${options.title}`,
      content: options.content,
    }),
  );
}

// 544786 12dora
// 92613 api
const ROOM_ID = 544786

function main() {
  const instance = startListen(ROOM_ID, {
    onLiveStart: (message) => {
      if (message.raw['live_time']) {
        sendMessage({
          title: '直播开始提醒',
          content: '12dora 来了',
          timestamp: message.timestamp,
        })
      } else {
        console.log(`[${timeMarker(message.timestamp)}] 推流LOG`)
      }
    },
    onLiveEnd: (message) => {
      sendMessage({
        title: '直播结束提醒',
        content: '12dora 溜了',
        timestamp: message.timestamp,
      });
    },
    onOpen: () => {
      sendMessage({
        title: `监听开始`,
        content: `${ROOM_ID} 成功建立连接`,
        timestamp: Date.now(),
      });
    },
    onClose: () => {
      sendMessage({
        title: `监听结束`,
        content: `${ROOM_ID} 已断开直播间链接`,
        timestamp: Date.now(),
      });
    },
    onError: (error) => {
      sendMessage({
        title: "发生错误",
        content: error.message,
        timestamp: Date.now(),
      });
    },
  });

  const close = () => {
    instance.close();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

main();
