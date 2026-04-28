import { Clipboard } from "@raycast/api";
import { CLIPBOARD_READ_DELAY_MS, ERROR_MESSAGES } from "./constants";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function readCurrentClipboardText() {
  await sleep(CLIPBOARD_READ_DELAY_MS);

  const text = await Clipboard.readText({ offset: 0 });
  if (!text?.trim()) {
    throw new Error(ERROR_MESSAGES.emptyClipboard);
  }

  return text;
}

