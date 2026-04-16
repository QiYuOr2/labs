import { createGlobalState } from '@vueuse/core';
import { ref } from 'vue';
import { Rule } from '../composables';
import { useGMStorage } from '../composables/useGMStorage';

export const useRuleStore = createGlobalState(() => {
  const rules = useGMStorage<Rule[]>('@uss/mock/rules', []);

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
    return rules.value.length - 1;
  }

  function remove(url: string | RegExp): void;
  function remove(index: number): void;
  function remove(arg1: string | RegExp | number) {
    if (typeof arg1 === 'number') {
      rules.value.splice(arg1, 1);
      return;
    }

    for (let i = 0; i < rules.value.length; i++) {
      if (rules.value[i].url === arg1) {
        rules.value.splice(i, 1);
        return;
      }
    }
  }

  const current = ref<number>(-1);

  const record = new Map<string, Rule>();

  return { rules, add, remove, get, set, current, record };
});
