<script setup lang="ts">
import { useToggle } from '@vueuse/core';
import DraggableButton from './components/DraggableButton.vue';
import FloatingPage from './components/FloatingPage.vue';
import { usePageStore } from './store';

const [visible, toggle] = useToggle(false);

const router = usePageStore();
</script>

<template>
  <DraggableButton @click="() => toggle()">接口代理</DraggableButton>
  <FloatingPage v-if="visible">
    <component :is="router.current.value" />
  </FloatingPage>
</template>

<style>
#uss-mock-app {
  font-size: 16px;
}

.code-text-style {
  font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, Courier, monospace;
}

.button {
  text-align: center;
  padding: 0.3em 0.45em;
  border: 1px solid #efefef;
  border-radius: 0.125rem;
  cursor: pointer;
}

.button--green {
  background-color: rgb(34 197 94);
  border-color: rgb(34 197 94);
  color: #fff;
}

.button--red {
  background-color: rgb(239 68 68);
  border-color: rgb(239 68 68);
  color: #fff;
}

.button--gray {
  background-color: #f3f4f6;
  border-color: #f3f4f6;
  color: #6b7280;
}

.buttons {
  display: flex;
  gap: 1em;
}

.buttons .button {
  flex: 1;
}
</style>
