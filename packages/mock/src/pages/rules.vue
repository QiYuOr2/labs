<script setup lang="ts">
import { GM_getValue } from '$';
import RuleItem from '../components/RuleItem.vue';
import { Pages, usePageStore, useRuleStore } from '../store';

const ruleStore = useRuleStore();
const router = usePageStore();

function toEdit(index: number) {
  ruleStore.current.value = index;
  router.to(Pages.Edit);
}

function add() {
  ruleStore.current.value = ruleStore.add({ name: '', url: '', response: {}, contains: true, enable: true });
  router.to(Pages.Edit);
}

function showAll() {
  console.log('ruleStore.rules.value', ruleStore.rules.value);
  console.log(`GM_getValue('@uss/mock/rules')`, GM_getValue('@uss/mock/rules'));
}
</script>

<template>
  <div class="rules">
    <div class="button" @click="add">添加新规则</div>
    <div class="button" @click="showAll">控制台输出所有规则</div>
    <div v-if="ruleStore.rules.value.length">
      <RuleItem
        v-for="(rule, i) in ruleStore.rules.value"
        :key="i"
        :index="i"
        :name="rule.name"
        :url="rule.url"
        :contains="rule.contains"
        :enable="rule.enable"
        @click="toEdit(i)"
        style="margin-bottom: 0.5em"
      />
    </div>
    <div class="empty" v-else>啥都没</div>
  </div>
</template>

<style scoped>
.rules {
  padding: 0.8em 0;
}

.button {
  margin: 0 0.7em;
  margin-bottom: 1em;
}

.empty {
  text-align: center;
  color: rgba(0, 0, 0, 0.5);
}
</style>
