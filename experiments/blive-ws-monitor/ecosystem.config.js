const path = require("path");

module.exports = {
  apps: [
    {
      name: "blive-ws-monitor",
      cwd: __dirname,
      script: path.join(__dirname, "index.mjs"),
      interpreter: "node",
      instances: 1,
      exec_mode: "fork",
      autorestart: true,
      watch: false,
      time: true,
      min_uptime: "10s",
      max_restarts: 10,
      restart_delay: 5000,
      kill_timeout: 5000,
      max_memory_restart: "256M",
      env: {
        NODE_ENV: "production",
      },
      error_file: path.join(__dirname, "pm2.err.log"),
      out_file: path.join(__dirname, "pm2.out.log"),
      log_date_format: "YYYY-MM-DD HH:mm:ss Z",
    },
  ],
};
