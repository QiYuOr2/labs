import { LocalStorage, showToast, Toast } from "@raycast/api";
import { useCallback, useEffect, useRef, useState } from "react";
import { readCurrentClipboardText } from "../clipboard";
import {
  CLIPBOARD_POLL_INTERVAL_MS,
  ERROR_MESSAGES,
  LAST_TRANSLATED_CLIPBOARD_STORAGE_KEY,
  UI_TEXT,
} from "../constants";

export type ClipboardViewState =
  | { kind: "checking" }
  | { kind: "error"; message: string }
  | { kind: "unchanged"; clipboardText: string }
  | { kind: "translating"; clipboardText: string; sessionId: number };

type ClipboardSnapshot = {
  text: string;
  lastTranslatedText?: string;
};

type LoadClipboardOptions = {
  showRefreshToast?: boolean;
  forceTranslate?: boolean;
  silent?: boolean;
};

/**
 * 管理“读取剪贴板 -> 判断是否需要翻译 -> 切换页面状态”的状态机。
 */
export function useClipboardTranslationState() {
  const [viewState, setViewState] = useState<ClipboardViewState>({ kind: "checking" });
  const viewStateRef = useRef<ClipboardViewState>({ kind: "checking" });
  const activeClipboardTextRef = useRef("");
  const isReadingClipboardRef = useRef(false);
  const sessionCounterRef = useRef(0);

  const readClipboardSnapshot = useCallback(async (): Promise<ClipboardSnapshot> => {
    const text = await readCurrentClipboardText();
    const lastTranslatedText = await LocalStorage.getItem<string>(LAST_TRANSLATED_CLIPBOARD_STORAGE_KEY);

    return { text, lastTranslatedText };
  }, []);

  const applySnapshotToViewState = useCallback((snapshot: ClipboardSnapshot, forceTranslate: boolean) => {
    const currentViewState = viewStateRef.current;
    const shouldTranslate = forceTranslate || snapshot.text !== snapshot.lastTranslatedText;
    const isClipboardChanged = activeClipboardTextRef.current !== snapshot.text;

    if (
      currentViewState.kind === "translating" &&
      !forceTranslate &&
      currentViewState.clipboardText === snapshot.text
    ) {
      activeClipboardTextRef.current = snapshot.text;
      return;
    }

    if (shouldTranslate) {
      const isAlreadyShowingSameSession =
        currentViewState.kind === "translating" &&
        !forceTranslate &&
        !isClipboardChanged &&
        currentViewState.clipboardText === snapshot.text;

      if (isAlreadyShowingSameSession) {
        return;
      }

      activeClipboardTextRef.current = snapshot.text;
      sessionCounterRef.current += 1;
      viewStateRef.current = {
        kind: "translating",
        clipboardText: snapshot.text,
        sessionId: sessionCounterRef.current,
      };
      setViewState(viewStateRef.current);
      return;
    }

    activeClipboardTextRef.current = snapshot.text;

    if (currentViewState.kind === "unchanged" && currentViewState.clipboardText === snapshot.text) {
      return;
    }

    viewStateRef.current = {
      kind: "unchanged",
      clipboardText: snapshot.text,
    };
    setViewState(viewStateRef.current);
  }, []);

  const loadClipboard = useCallback(
    async (options?: LoadClipboardOptions) => {
      const { forceTranslate = false, showRefreshToast = false, silent = false } = options ?? {};
      if (isReadingClipboardRef.current) {
        return;
      }

      isReadingClipboardRef.current = true;

      if (!silent) {
        viewStateRef.current = { kind: "checking" };
        setViewState(viewStateRef.current);
      }

      try {
        const snapshot = await readClipboardSnapshot();
        applySnapshotToViewState(snapshot, forceTranslate);

        if (showRefreshToast) {
          await showToast({
            style: Toast.Style.Success,
            title: UI_TEXT.clipboardRefreshToastTitle,
          });
        }
      } catch (clipboardError) {
        if (!silent) {
          viewStateRef.current = {
            kind: "error",
            message: clipboardError instanceof Error ? clipboardError.message : ERROR_MESSAGES.clipboardReadFailed,
          };
          setViewState(viewStateRef.current);
        }
      } finally {
        isReadingClipboardRef.current = false;
      }
    },
    [applySnapshotToViewState, readClipboardSnapshot],
  );

  useEffect(() => {
    void loadClipboard();
  }, [loadClipboard]);

  useEffect(() => {
    const timer = setInterval(() => {
      void loadClipboard({ silent: true });
    }, CLIPBOARD_POLL_INTERVAL_MS);

    return () => {
      clearInterval(timer);
    };
  }, [loadClipboard]);

  const markClipboardAsTranslated = useCallback(async (clipboardText: string) => {
    await LocalStorage.setItem(LAST_TRANSLATED_CLIPBOARD_STORAGE_KEY, clipboardText);
  }, []);

  return {
    viewState,
    loadClipboard,
    markClipboardAsTranslated,
  };
}
