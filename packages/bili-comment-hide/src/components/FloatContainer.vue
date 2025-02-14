<script setup lang="ts">
import { useDraggable, useWindowSize } from '@vueuse/core'
import { useTemplateRef } from 'vue';

const el = useTemplateRef('el');

// const INIT_OFFSET_X = 60
const INIT_OFFSET_X = 360

const { width } = useWindowSize()
const { x, y } = useDraggable(el, {
  initialValue: { x: width.value - INIT_OFFSET_X, y: 100 },
})

function toggle() {
  if (x.value < width.value - INIT_OFFSET_X) {
    x.value = width.value - INIT_OFFSET_X
  } else {
    x.value = width.value - 350
  }
}
</script>


<template>
  <div :style="{ left: `${x}px`, top: `${y}px`}" class="float-container">
    <div ref="el" class="float-container__drag-line" @click="toggle"></div>
    <slot></slot>
  </div>
</template>


<style lang="less" scoped>
.float-container {
  position: fixed;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  border-radius: 8px;
  z-index: 99999;

  &__drag-line {
    position: absolute;
    top: 50%;
    transform: translateY(-50%);
    cursor: pointer;
    height: 20px;
    width: 6px;
    background-color: #ccc;
    border-radius: 100000px;
  }
}
</style>