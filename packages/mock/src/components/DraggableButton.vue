<script setup lang="ts">
import { ref } from 'vue';
import { useDraggable } from '@vueuse/core';

const entry = ref<HTMLElement | null>(null);
const halfHeight = document.documentElement.clientHeight / 2;
const { style } = useDraggable(entry, { initialValue: { x: 8, y: halfHeight - 50 }, axis: 'y' });
</script>

<template>
  <div ref="entry" class="entry" :style="style">
    <slot></slot>
  </div>
</template>

<style scoped>
.entry {
  writing-mode: vertical-rl;
  position: fixed;
  background-color: #fff;
  z-index: 1999;
  border-radius: 999px;
  user-select: none;
  cursor: pointer;
  box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1);
  padding: 10px 4px;
  font-size: 14px;
  letter-spacing: 2px;
  border: 1px solid #efefef;
  transition: box-shadow 0.3s ease;
}
.entry:hover {
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1);
  transition: box-shadow 0.3s ease;
}
</style>
