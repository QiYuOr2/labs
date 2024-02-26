<script setup lang="ts">
import { computed } from 'vue';
import { useRuleStore } from '../store';

const ruleStore = useRuleStore();
const rule = computed(() => ruleStore.rules.value[ruleStore.current.value]);
</script>

<template>
  <div>{{ rule.url }}</div>
  <div>{{ rule.response }}</div>
</template>
