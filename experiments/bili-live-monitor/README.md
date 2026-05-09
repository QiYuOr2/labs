# B 站直播监听核心模块

这是一套与运行平台无关的核心逻辑，专门负责三件事：

- 查询 B 站直播间状态
- 判断直播状态是否变化
- 构造并发送 Bark 通知

Cloudflare Workers、KV、调试页面、部署首跑这些平台耦合内容已经移除。现在这套代码可以接入 Node 脚本、定时任务、服务器、其他云函数或任意自定义运行环境。

## 目录结构

- `src/bilibili-client.js`：B 站直播状态查询客户端
- `src/bark.js`：Bark 通知构造与发送
- `src/monitor.js`：监听主流程
- `src/state-store.js`：示例状态仓储，提供内存版
- `src/index.js`：统一导出入口

## 设计原则

- 单一职责：查询、通知、状态判断、状态存储分离
- 可注入依赖：`fetch`、状态仓储、通知器都可以替换
- 平台无关：不依赖 Cloudflare、Worker、KV、环境变量
- 易于复用：可以直接作为业务核心接入其他地方

## Bark 相关变更

当前 Bark 链接只会拼这些参数：

- 标题
- 正文
- `icon`
- `group`

不会再默认追加：

- `url`
- `isArchive`

如果你以后需要，可以在外层自行扩展。

## 快速使用

```js
import {
  createBarkNotifier,
  createBilibiliLiveClient,
  createLiveMonitor,
  createMemoryLiveStateStore
} from "./src/index.js";

const roomId = 544786;

const biliClient = createBilibiliLiveClient();
const barkNotifier = createBarkNotifier({
  barkKey: process.env.BARK_KEY
});
const stateStore = createMemoryLiveStateStore();

const monitor = createLiveMonitor({
  getLiveStatus: biliClient.getLiveStatus,
  notifier: barkNotifier,
  stateStore
});

const result = await monitor.run(roomId);
console.log(result);
```

## 自定义状态存储

`createLiveMonitor()` 需要一个带 `read()` 和 `write()` 的状态仓储。你可以自己接：

- 文件
- Redis
- 数据库
- 其他 KV

接口约定如下：

```js
const stateStore = {
  async read(roomId) {
    return null;
  },
  async write(nextState, roomId) {
    return nextState;
  }
};
```

## 监听结果结构

`monitor.run(roomId)` 返回：

```js
{
  roomId,
  previousState,
  currentState,
  stateChanged,
  notification,
  notificationSent,
  notificationResult,
  updatedState,
  checkedAt
}
```

## 导出内容

- `createBilibiliLiveClient`
- `createBarkNotifier`
- `buildBarkUrl`
- `buildMaskedBarkUrl`
- `buildLiveStatusNotification`
- `detectLiveStatusChange`
- `createLiveMonitor`
- `createMemoryLiveStateStore`
- `getErrorMessage`

## 说明

- 首次运行默认只初始化状态，不会把“当前状态”当成一次状态变化
- 如果需要强制发通知，可以传 `monitor.run(roomId, { forceNotify: true })`
- 如果需要强制写状态，可以传 `monitor.run(roomId, { forceWriteState: true })`
