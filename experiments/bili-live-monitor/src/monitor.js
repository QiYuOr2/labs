import { buildLiveStatusNotification } from "./bark.js";

export function detectLiveStatusChange(previousState, currentState) {
  if (!previousState) {
    return {
      changed: false,
      previousLive: null,
      currentLive: currentState.live
    };
  }

  return {
    changed: previousState.live !== currentState.live,
    previousLive: previousState.live,
    currentLive: currentState.live
  };
}

export function createLiveMonitor(options) {
  const getLiveStatus = options.getLiveStatus;
  const stateStore = options.stateStore;
  const notifier = options.notifier || null;
  const now = options.now || (() => new Date().toISOString());

  if (typeof getLiveStatus !== "function") {
    throw new Error("createLiveMonitor requires getLiveStatus");
  }

  if (!stateStore || typeof stateStore.read !== "function" || typeof stateStore.write !== "function") {
    throw new Error("createLiveMonitor requires a stateStore with read/write");
  }

  return {
    async run(roomId, runOptions = {}) {
      const previousState = await stateStore.read(roomId);
      const currentState = await getLiveStatus(roomId);
      const change = detectLiveStatusChange(previousState, currentState);
      const shouldNotify = change.changed || runOptions.forceNotify === true;

      let notification = null;
      let notificationResult = null;

      if (shouldNotify) {
        notification = buildLiveStatusNotification(currentState);

        if (notifier) {
          notificationResult = await notifier.send(notification, {
            icon: currentState.cover || undefined
          });
        }
      }

      const nextState = {
        roomId: currentState.roomId,
        live: currentState.live,
        uname: currentState.uname,
        title: currentState.title,
        roomUrl: currentState.roomUrl,
        updatedAt: now()
      };

      if (!previousState || change.changed || runOptions.forceWriteState === true) {
        await stateStore.write(nextState, roomId);
      }

      return {
        roomId,
        previousState,
        currentState,
        stateChanged: change.changed,
        notification,
        notificationSent: Boolean(notificationResult),
        notificationResult,
        updatedState: nextState,
        checkedAt: now()
      };
    }
  };
}
