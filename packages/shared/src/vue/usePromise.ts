import { Ref, isRef, ref, shallowRef, watch } from 'vue';
import { typeIs } from '../typeof';

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

type PromiseFn<Result, Args extends Array<unknown>> = (...args: Args) => Promise<Result>;

type ToRefArray<T> = T extends Array<unknown> ? { [P in keyof T]: Ref<T[P]> } : T;

interface UsePromiseOptions<Result, Args, FormattedResult = Result> {
  /**
   * result 的初始值，如果 promise 执行失败，result 会被重置为 initialData
   */
  initialData?: DeepPartial<FormattedResult>;

  /**
   * 立即执行 promise，否则需要手动调用 run
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * 执行 promise 时的参数
   */
  params?: Args | ToRefArray<Args>;

  /**
   * 监听的数据变化时重新请求
   */
  watch?: ToRefArray<unknown[]>;

  format?: (originData: Result, data: Result) => FormattedResult;

  onResolve?: (data: Result) => void;
  onReject?: (error: unknown) => void;
  onFinally?: () => void;
}

interface UsePromiseReturn<Result, Args extends Array<unknown>> {
  loading: Ref<boolean>;
  result: Ref<Result | null>;
  error: Ref<unknown>;
  run: PromiseFn<void, Args>;
}

function isRecord(val: unknown): val is Record<string, unknown> {
  return typeIs.obj(val);
}

function merge<T>(...resources: Record<string, unknown>[]): T {
  const result = resources[0];

  resources.slice(1).forEach((resource) => {
    Object.keys(resource).forEach((key) => {
      const val = resource[key];

      if (isRecord(result[key]) && isRecord(val)) {
        result[key] = merge(result[key] as Record<string, unknown>, val);
      } else {
        result[key] = val;
      }
    });
  });

  return result as T;
}

/**
 * 获取第一个不为空的数组，如果都为空则返回空数组
 */
function notEmptyArray<T>(...arrays: T[]): T {
  return arrays.find((arr) => Array.isArray(arr) && arr.length) || ([] as T);
}

/**
 * `[Ref, Ref, Ref] => [Ref.value, Ref.value, Ref.value]`
 */
function unwrapRefArray<T extends Array<unknown>>(arr: T | ToRefArray<T>): T {
  if (!Array.isArray(arr)) {
    throw new TypeError('The parameter must be an array');
  }

  return arr.map((item: unknown) => (isRef(item) ? item.value : item)) as T;
}

export function usePromise<Result, Args extends Array<unknown>, FormattedResult = Result>(
  promise: PromiseFn<Result, Args>,
  options?: UsePromiseOptions<Result, Args>
): UsePromiseReturn<Result, Args>;

export function usePromise<Result, Args extends Array<unknown>, FormattedResult = Result>(
  promise: PromiseFn<Result, Args>,
  options?: UsePromiseOptions<Result, Args, FormattedResult>
) {
  if (!options) {
    options = {};
  }

  if (!options?.format) {
    options.format = (origin, result) => (isRecord(origin) && isRecord(result) ? merge(origin, result) : result) as FormattedResult;
  }

  const result = shallowRef<Result | null>((options?.initialData as Result) || null);
  const error = shallowRef<unknown>(null);

  const loading = ref(false);

  /**
   * 当请求没有入参时，直接调用 `run()` 即可 \
   * 如果请求有入参，但调用 `run()` 没有传入对应参数时，会使用 `options.params` 作为入参 \
   * 当 `options.params` 为 Ref 数组时，会自动取值
   */
  function run(): Promise<void>;
  function run<T extends Args>(...params: T): Promise<void>;
  async function run<T extends Args>(...params: T) {
    loading.value = true;

    const willUseParams = unwrapRefArray(notEmptyArray(params, options?.params!));

    try {
      const _result = await promise(...willUseParams);

      options?.onResolve?.(result.value);

      result.value = isRecord(result.value) && isRecord(_result) ? merge(result.value, _result) : _result;
      result.value = options!.format!(result.value as unknown as Result, _result);
    } catch (_error) {
      result.value = options?.initialData as Result;
      error.value = _error;

      options?.onReject?.(_error);
    } finally {
      loading.value = false;

      options?.onFinally?.();
    }
  }

  // 立即请求
  if (options?.immediate || typeIs.undef(options?.immediate)) {
    run();
  }

  // 监听数据变化重新请求
  if (options?.watch) {
    watch(options.watch, () => run());
  }

  return {
    loading,
    result,
    error,
    run,
  };
}
