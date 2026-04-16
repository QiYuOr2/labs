import { MaybeRefOrGetter, toValue } from 'vue';
import xhook from 'xhook';

export interface Rule {
  name: string;
  url: string | RegExp;
  response: unknown;
  contains?: boolean;
  enable?: boolean;
}

interface UseRequestHookOptions {
  rules: MaybeRefOrGetter<Rule[]>;
  record: MaybeRefOrGetter<Map<string, Rule>>;
  immediate?: boolean;
}

function matchURL(url: string, rule: Rule) {
  if (typeof rule.url === 'string') {
    return rule.contains ? url.includes(rule.url) : url === rule.url;
  }

  return rule.url.test(url);
}

export function useRequestHook(options?: UseRequestHookOptions) {
  const record = toValue(options?.record ?? new Map<string, Rule>());

  xhook.after((request, response) => {
    const rules = toValue(options?.rules ?? []);

    for (const rule of rules) {
      if (!rule.enable) {
        continue;
      }

      if (matchURL(request.url, rule)) {
        response.data = rule.response as any;

        if (response.text) {
          response.text = typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
        }
        return;
      }
    }

    if (response.headers['Content-Type']?.includes('application/json')) {
      record.set(request.url, {
        name: '',
        url: request.url,
        response: response.data,
      });
    }
  });

  if (options?.immediate) {
    xhook.enable();
  }

  return { enable: xhook.enable, disable: xhook.disable };
}
