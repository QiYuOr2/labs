<script setup lang="ts">
import { inject } from 'vue'

defineProps<{
  label: string
  index: number
}>()

const activeTab = inject('activeTab')
</script>

<template>
  <div v-if="activeTab === index" class="tab__content">
    <slot />
  </div>
</template>
