<script setup lang="ts">
import { useToggle } from '@vueuse/core';
import DraggableButton from './components/DraggableButton.vue';
import FloatingPage from './components/FloatingPage.vue';
import { useGlobalState } from './store/global';

const [visible, toggle] = useToggle(false);

const state = useGlobalState();
</script>

<template>
  <DraggableButton @click="() => toggle()">接口代理</DraggableButton>
  <FloatingPage v-if="visible">
    <component :is="state.page.value" />
  </FloatingPage>
</template>

<style scoped></style>
