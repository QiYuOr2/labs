<script setup lang="ts">
import { useToggle } from '@vueuse/core';

const [isChecked, toggleChecked] = useToggle()
</script>

<template>
  <div class="relative flex flex-wrap items-center">
    <input :checked="isChecked" @change="toggleChecked()" type="checkbox" />
  </div>
</template>