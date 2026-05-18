import "dotenv/config";
import { loadConfig } from "./config.mjs";
import { setMonitor } from "./monitor.mjs";

const config = loadConfig();

function main() {
  const monitors = config.streamers.map(
    ([roomId, streamer]) => setMonitor(roomId, streamer)
  );

  const close = () => {
    monitors.forEach((monitor) => monitor.close());
  };

  process.on("SIGINT", close);
  process.on("SIGTERM", close);
}

main();
