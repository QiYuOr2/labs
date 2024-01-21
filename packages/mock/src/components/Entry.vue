<script setup lang="ts">
import { useDraggable } from '@vueuse/core'
import { ref } from 'vue';

const entry = ref<HTMLElement | null>(null)
const { style } = useDraggable(entry, {
  initialValue: { x: 10, y: 200 },
})
</script>

<template>
  <div ref="entry" class="fixed text-base bg-base p2 rounded cursor-pointer z50 select-none shadow" :style="style">
    <div v-if="true">入口</div>
    <slot v-else></slot>
  </div>
</template>