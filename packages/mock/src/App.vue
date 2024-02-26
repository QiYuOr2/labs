<script setup lang="ts">
import { useToggle } from '@vueuse/core';
import DraggableButton from './components/DraggableButton.vue';
import FloatingPage from './components/FloatingPage.vue';
import { usePageStore, useRuleStore } from './store';
import { useRequestHook } from './composables';

const [visible, toggle] = useToggle(false);

const router = usePageStore();
const ruleStore = useRuleStore();

useRequestHook({
  rules: ruleStore.rules,
  immediate: true,
});
</script>

<template>
  <DraggableButton @click="() => toggle()">接口代理</DraggableButton>
  <FloatingPage v-if="visible">
    <component :is="router.current.value" />
  </FloatingPage>
</template>

<style>
.code-text-style {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}
</style>
