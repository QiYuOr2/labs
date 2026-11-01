import { GM_getValue, GM_setValue } from '$';
import { ref, watch } from 'vue';

export function useGMStorage<T>(key: string, defaultValue: T) {
  const value = ref<T>(GM_getValue(key, defaultValue));

  watch(value, (newValue) => {
    GM_setValue(key, newValue);
  });

  return value;
}
