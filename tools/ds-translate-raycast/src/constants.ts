export const DEEPSEEK_BASE_URL = "https://api.deepseek.com";

export const CLIPBOARD_READ_DELAY_MS = 150;
export const CLIPBOARD_POLL_INTERVAL_MS = 800;
export const LAST_TRANSLATED_CLIPBOARD_STORAGE_KEY = "last-translated-clipboard-text";

export const UI_TEXT = {
  translationResultTitle: "翻译结果",
  translationHeading: "译文",
  sourceHeading: "原文",
  clipboardSourceHeading: "当前剪贴板内容",
  loadingTranslationHeading: "正在翻译",
  loadingTranslationMessage: "请稍候，DeepSeek 正在处理以下文本。",
  loadingClipboardHeading: "正在读取剪贴板",
  translationErrorHeading: "翻译失败",
  clipboardErrorHeading: "无法翻译",
  clipboardUnchangedHeading: "剪贴板未变化",
  clipboardUnchangedMessage: "当前剪贴板内容与上次成功翻译的内容一致，未自动重新翻译。",
  clipboardRefreshToastTitle: "已重新读取剪贴板",
  copyTranslationAction: "复制译文",
  refreshClipboardAction: "重新读取剪贴板",
  forceTranslateAction: "强制重新翻译",
  extensionPreferencesAction: "扩展设置",
  backAction: "返回",
  translateFormTitle: "翻译为中文",
  translateSubmitAction: "开始翻译",
  pasteClipboardAction: "粘贴剪贴板内容",
  translateInputTitle: "待翻译文本",
  translateInputPlaceholder: "输入或粘贴需要翻译成中文的内容",
  descriptionTitle: "说明",
  descriptionWithAutoCopy: "翻译结果会在结果页展示，请手动决定是否复制。",
  descriptionWithoutAutoCopy: "翻译结果会在结果页展示，请手动决定是否复制。",
} as const;

export const ERROR_MESSAGES = {
  emptyTranslationSource: "请输入要翻译的文本，或先复制文本到剪贴板。",
  emptyClipboard: "剪贴板里没有可翻译的文本内容。",
  clipboardReadFailed: "读取剪贴板失败。",
  emptyTranslationResult: "DeepSeek 没有返回可用的翻译结果。",
  invalidTranslationPayload: "翻译结果格式不正确，请重试。",
  unknown: "发生未知错误，请稍后重试。",
} as const;

