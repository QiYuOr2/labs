<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(defineProps<{
  targetCenter?: { x: number, y: number }
}>(), {
  targetCenter: () => ({ x: 0, y: 0 }),
})

const modelValue = defineModel<boolean>()

const position = computed(() => ({
  left: `${props.targetCenter.x}px`,
  top: `${props.targetCenter.y + 24}px`,
}))
</script>

<template>
  <div v-if="modelValue" class="mask" @click.self="modelValue = false">
    <div class="dropdown">
      <slot />
    </div>
  </div>
</template>

<style>
.mask {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
}

.dropdown {
  position: fixed;
  left: v-bind('position.left');
  top: v-bind('position.top');
  transform: translateX(-50%);

  display: flex;
  flex-direction: column;
  box-sizing: border-box;
  width: 216px;
  padding: 8px 8px 10px;
  border: 1px solid var(--table-border-color);
  border-radius: var(--radius);
  background: var(--table-bg-color);
  backdrop-filter: blur(24px);
  z-index: 101;
}
</style>
