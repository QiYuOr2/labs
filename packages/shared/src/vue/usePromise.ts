import { Ref, ref, shallowRef } from 'vue';
import { typeIs } from '../typeof';

type DeepPartial<T> = T extends object ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

type PromiseFn<Result, Args extends Array<unknown>> = (...args: Args) => Promise<Result>;

interface UsePromiseOptions<Result, Args> {
  /**
   * result 的初始值，如果 promise 执行失败，result 会被重置为 initialData
   */
  initialData?: DeepPartial<Result>;

  /**
   * 立即执行 promise，否则需要手动调用 run
   *
   * @default true
   */
  immediate?: boolean;

  /**
   * 执行 promise 时的参数
   */
  params?: Args;

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

export function usePromise<Result, Args extends Array<unknown>>(
  promise: PromiseFn<Result, Args>,
  options?: UsePromiseOptions<Result, Args>
): UsePromiseReturn<Result, Args>;

export function usePromise<Result, Args extends Array<unknown>>(
  promise: PromiseFn<Result, Args>,
  options?: UsePromiseOptions<Result, Args>
) {
  const result = shallowRef<Result | null>((options?.initialData as Result) || null);
  const error = shallowRef<unknown>(null);

  const loading = ref(false);

  async function run<T extends Args>(...params: T) {
    loading.value = true;

    const willUseParams = (params || options?.params || []) as Args;

    try {
      const _result = await promise(...willUseParams);
      result.value = isRecord(result.value) && isRecord(_result) ? merge(result.value, _result) : _result;

      options?.onResolve?.(result.value);
    } catch (_error) {
      result.value = options?.initialData as Result;
      error.value = _error;

      options?.onReject?.(_error);
    } finally {
      loading.value = false;

      options?.onFinally?.();
    }
  }

  if (options?.immediate || typeIs.undef(options?.immediate)) {
    run(...((options?.params || []) as Args));
  }

  return {
    loading,
    result,
    error,
    run,
  };
}
