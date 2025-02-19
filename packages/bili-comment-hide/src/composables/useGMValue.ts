import { GM_setValue, GM_getValue } from "$";
import { ref, watch } from "vue";

export function useGMValue<T>(key: string, initialValue: T) {
  const _value = ref<T>(GM_getValue(key, initialValue));

  watch(
    _value,
    (v) => {
      GM_setValue(key, v);
    },
    { deep: true }
  );

  return {
    set value(v: T) {
      _value.value = v;
    },
    get value() {
      return _value.value;
    },
  };
}
