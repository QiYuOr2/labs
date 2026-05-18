import dayjs from "dayjs";
import { startListen } from "blive-message-listener";
import { barkURL } from "./bark.mjs";

function timeMarker(timestamp) {
  return dayjs(timestamp).format("YYYY/MM/DD HH:mm:ss");
}

function sendMessage(options) {
  const time = timeMarker(options.timestamp);
  console.log(`[${time}] ${options.title}`);
  fetch(
    barkURL({
      title: `【BLi Monitor】${options.title}`,
      content: options.content,
    }),
  );
}

/**
 * @param {number} roomId 
 * @param {string} streamer 
 */
export function setMonitor(roomId, streamer) {
  return startListen(roomId, {
    onLiveStart: (message) => {
      if (message.raw['live_time']) {
        sendMessage({
          title: '直播开始提醒',
          content: `${streamer} 来了`,
          timestamp: message.timestamp,
        })
      } else {
        console.log(`[${timeMarker(message.timestamp)}] 推流LOG`)
      }
    },
    onLiveEnd: (message) => {
      sendMessage({
        title: '直播结束提醒',
        content: `${streamer} 溜了`,
        timestamp: message.timestamp,
      });
    },
    onOpen: () => {
      sendMessage({
        title: `${roomId} 监听开始`,
        content: `${streamer} 直播间成功建立连接`,
        timestamp: Date.now(),
      });
    },
    onClose: () => {
      sendMessage({
        title: `${roomId} 监听结束`,
        content: `${streamer} 直播间已断开链接`,
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
}