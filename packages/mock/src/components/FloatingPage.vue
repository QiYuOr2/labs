<script setup lang="ts">
import { useCssModule } from 'vue';
import { Pages, useGlobalState } from '../store/global';

const styles = useCssModule();

const state = useGlobalState();

const tabs = [
  { label: '全部规则', value: Pages.Rules },
  { label: '编辑', value: Pages.Edit },
];
</script>

<template>
  <div :class="styles.floating">
    <div v-if="false" :class="styles.tabs">
      <div
        v-for="tab in tabs"
        :key="tab.value"
        :class="[styles.tab, { [styles['tab--active']]: state.page.value === tab.value }]"
        @click="state.toPage(tab.value)"
      >
        {{ tab.label }}
      </div>
    </div>
    <slot></slot>
  </div>
</template>

<style module>
.floating {
  position: fixed;
  top: 1rem;
  bottom: 1rem;
  left: 24px;
  width: 400px;
  background: #fff;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  z-index: 99;
  border: 1px solid #efefef;
  border-radius: 0.375rem;
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
