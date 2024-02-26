import { createGlobalState } from '@vueuse/core';
import { ref } from 'vue';
import { Rule } from '../composables';

const user = {};

export const useRuleStore = createGlobalState(() => {
  const rules = ref<Rule[]>([
    {
      url: 'udc.user.getUserInfoByIdgetUserInfoByIdgetUserInfoById/1.0',
      contains: true,
      response: user,
      enable: false,
    },
  ]);

  function get(url: string | RegExp) {
    return rules.value.find((rule) => rule.url === url);
  }

  function set(index: number, rule: Partial<Rule>): void;
  function set(url: string | RegExp, rule: Partial<Rule>): void;
  function set(arg1: number | string | RegExp, rule: Partial<Rule>) {
    const copyRules = rules.value.slice();

    if (typeof arg1 === 'number') {
      copyRules[arg1] = { ...copyRules[arg1], ...rule };
      rules.value = copyRules;
      return;
    }

    const index = copyRules.findIndex((r) => r.url === arg1);
    if (index === -1) {
      return;
    }

    copyRules[index] = { ...copyRules[index], ...rule };
    rules.value = copyRules;
  }

  function add(rule: Rule) {
    rules.value.push(rule);
  }
  function remove(url: string | RegExp) {
    for (let i = 0; i < rules.value.length; i++) {
      if (rules.value[i].url === url) {
        rules.value.splice(i, 1);
        return;
      }
    }
  }

  const current = ref<number>(-1);

  return { rules, add, remove, get, set, current };
});
