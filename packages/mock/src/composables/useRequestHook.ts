import { MaybeRefOrGetter, toValue } from 'vue';
import xhook from 'xhook';

export interface Rule {
  url: string | RegExp;
  response: unknown;
  contains?: boolean;
  enable?: boolean;
}

interface UseRequestHookOptions {
  rules: MaybeRefOrGetter<Rule[]>;
  immediate?: boolean;
}

function matchURL(url: string, rule: Rule) {
  if (typeof rule.url === 'string') {
    return rule.contains ? url.includes(rule.url) : url === rule.url;
  }

  return rule.url.test(url);
}

export function useRequestHook(options?: UseRequestHookOptions) {
  xhook.after((request, response) => {
    console.log(request.url);

    const rules = toValue(options?.rules ?? []);

    for (const rule of rules) {
      if (!rule.enable) {
        continue;
      }

      if (matchURL(request.url, rule)) {
        response.data = rule.response as any;
        break;
      }
    }
  });

  if (options?.immediate) {
    xhook.enable();
  }

  return { enable: xhook.enable, disable: xhook.disable };
}
