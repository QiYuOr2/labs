<script setup lang="ts">
import RuleItem from '../components/RuleItem.vue';
import { Pages, usePageStore, useRuleStore } from '../store';

const ruleStore = useRuleStore();
const router = usePageStore();

function toEdit(index: number) {
  ruleStore.current.value = index;
  router.to(Pages.Edit);
}
console.log(ruleStore.rules);
</script>

<template>
  <div class="rules">
    <div v-if="ruleStore.rules.value.length">
      <RuleItem
        v-for="(rule, i) in ruleStore.rules.value"
        :key="i"
        :url="rule.url"
        :contains="rule.contains"
        :enable="rule.enable"
        @click="toEdit(i)"
      />
    </div>
    <div v-else>空</div>
  </div>
</template>

<style scoped>
.rules {
  padding: 0.25rem 0.275rem;
}
</style>
