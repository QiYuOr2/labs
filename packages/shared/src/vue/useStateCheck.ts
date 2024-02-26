import { ComputedRef, computed } from 'vue';

type StateArray<T extends string> = {
  value: T;
  when: (state: T) => boolean;
}[];

type StateMap<T extends string> = {
  [K in T]: (state: T) => boolean;
};

type Check<T extends string> = {
  is: (value: T | 'default') => boolean;
  in: (values: (T | 'default')[]) => boolean;
};

function isStateArray<T extends string>(states: unknown): states is StateArray<T> {
  return Array.isArray(states);
}

/**
 * 状态匹配校验
 * @example
 * const state = useStateCheck([
 *   {
 *     value: 'loading',
 *     when: () => loading.value && !isRefreshing.value
 *   },
 *   {
 *     value: 'refreshing',
 *     when: () => isRefreshing.value
 *   },
 *   {
 *     value: 'error',
 *     when: () => !loading.value && !data.value.topImage
 *   },
 * ])
 * <div v-if="state.is('default')">正常展示内容</div>
 * <div v-else-if="state.is('loading')">加载中</div>
 * <div v-else>刷新中</div>
 */
export function useStateCheck<T extends string>(states: StateArray<T>): Check<T>;

/**
 * 状态匹配校验
 * @example
 * const state = useStateCheck({
 *   loading: () => loading.value && !isRefreshing.value,
 *   refreshing: () => isRefreshing.value,
 *   error: () => !loading.value && !data.value.topImage
 * })
 * <div v-if="state.is('default')">正常展示内容</div>
 * <div v-else-if="state.is('loading')">加载中</div>
 * <div v-else>刷新中</div>
 */
export function useStateCheck<T extends string>(states: StateMap<T>): Check<T>;

export function useStateCheck<T extends string>(states: StateArray<T> | StateMap<T>) {
  const defaultState = 'default' as T;

  const state = computed(() => {
    const _states = isStateArray(states) ? states : (Object.entries(states).map(([value, when]) => ({ value, when })) as StateArray<T>);

    for (const item of _states) {
      if (item.when(item.value as T)) {
        return item.value;
      }
    }
    return defaultState;
  }) as ComputedRef<T | 'default'>;

  function stateIs(value: T | 'default') {
    return state.value === value;
  }

  function stateIn(values: (T | 'default')[]) {
    return values.includes(state.value);
  }

  return { state, is: stateIs, in: stateIn };
}
