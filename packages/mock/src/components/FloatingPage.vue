<script setup lang="ts">
import { Pages, usePageStore } from '../store';

const router = usePageStore();

const tabs = [
  { label: '全部规则', value: Pages.Rules },
  { label: '编辑', value: Pages.Edit },
];
</script>

<template>
  <div class="floating">
    <div v-if="false" class="tabs">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="['tab', { 'tab--active': router.current.value === tab.value }]"
        @click="router.to(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style scoped>
.floating {
  position: fixed;
  top: 1rem;
  bottom: 1rem;
  left: 24px;
  right: 24px;
  max-width: 400px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  z-index: 999;
  border: 1px solid #efefef;
  border-radius: 0.25rem;
}

.tabs {
  display: flex;
  border-bottom: 1px solid #efefef;
  font-size: 14px;
  gap: 0.5rem;
  padding: 0 0.5rem;
}
.tab {
  cursor: pointer;
  padding: 0.5rem;
}
.tab--active {
  font-weight: 500;
}
</style>
