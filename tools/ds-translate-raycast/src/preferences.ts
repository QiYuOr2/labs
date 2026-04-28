import { getPreferenceValues } from "@raycast/api";

export type ExtensionPreferences = {
  deepseekApiKey: string;
  model: string;
  autoCopyResult: boolean;
};

export function getExtensionPreferences() {
  return getPreferenceValues<ExtensionPreferences>();
}

