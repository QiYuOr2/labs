import { MaybeRefOrGetter, toValue } from "vue";
import xhook from "xhook";

// x/v2/reply/wbi/main

export interface Rule {
  url: string;
  response: (originResponse: unknown) => xhook.Response;
}

interface UseRequestHookOptions {
  rules: MaybeRefOrGetter<Rule[]>;
  immediate?: boolean;
}

function matchURL(url: string, rule: Rule) {
  return url.includes(rule.url);
}

export function useRequestHook(options?: UseRequestHookOptions) {
  xhook.after((request, response) => {
    const rules = toValue(options?.rules ?? []);

    Object.defineProperty(response, "data", {
      set(v) {

        for (const rule of rules) {
          if (matchURL(request.url, rule)) {
            this._data = rule.response(v);
            return;
          }
        }
        this._data = v;
      },
      get() {
        return this._data;
      },
    });
  });

  if (options?.immediate) {
    xhook.enable();
  }

  return { enable: xhook.enable, disable: xhook.disable };
}
