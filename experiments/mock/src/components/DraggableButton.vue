<script setup lang="ts">
import { ref, watch } from 'vue';
import { useDraggable, useMouseInElement } from '@vueuse/core';

const entry = ref<HTMLElement | null>(null);
const halfHeight = document.documentElement.clientHeight / 2;
const { x, style } = useDraggable(entry, { initialValue: { x: 8, y: halfHeight - 50 }, axis: 'y' });

const { isOutside } = useMouseInElement(entry);

function xTo(target: number, duration: number = 240) {
  const start = x.value;
  const range = target - start;
  const startTime = performance.now();
  let progress = 0;

  function step() {
    progress = (performance.now() - startTime) / duration;
    if (progress < 1) {
      x.value = start + range * progress;
      requestAnimationFrame(step);
    } else {
      x.value = target;
    }
  }

  step();
}

let timer: NodeJS.Timeout;
watch(
  isOutside,
  (value) => {
    if (value) {
      timer = setTimeout(() => {
        xTo(value ? -24 : 8);
      }, 5000);
    } else {
      clearTimeout(timer);

      if (x.value !== 8) {
        xTo(8);
      }
    }
  },
  { immediate: true }
);
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
