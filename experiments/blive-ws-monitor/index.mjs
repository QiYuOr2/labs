import { startListen } from "blive-message-listener";
import { barkURL } from "./bark.mjs";
import "dotenv/config";

function main() {
  const instance = startListen(544786, {
    onLiveStart: () => {
      fetch(
        barkURL({
          title: "【blive-ws-monitor】直播开始提醒",
          content: "12dora 直播开始了",
        }),
      );
    },
    onLiveEnd: () => {
      fetch(
        barkURL({
          title: "【blive-ws-monitor】直播结束提醒",
          content: "12dora 直播结束了",
        }),
      );
    },
    onOpen: () => {
      fetch(
        barkURL({
          title: "【blive-ws-monitor】监听开始",
          content: "成功建立连接",
        }),
      );
    },
    onClose: () => {
      fetch(
        barkURL({
          title: "【blive-ws-monitor】监听结束",
          content: "已断开直播间链接",
        }),
      );
    },
    onError: (error) => {
      fetch(
        barkURL({
          title: "【blive-ws-monitor】发生错误",
          content: error.message,
        }),
      );
    },
  });

  const close = () => {
    instance.close();
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

main();
