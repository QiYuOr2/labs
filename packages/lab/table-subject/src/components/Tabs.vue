<script setup lang="ts">
import { provide, ref, useSlots } from 'vue'

defineProps<{
  modelValue?: number
}>()
const emit = defineEmits(['update:modelValue'])
const activeTab = ref(0)
provide('activeTab', activeTab)

const slots = useSlots()

function selectTab(index: number) {
  activeTab.value = index
  emit('update:modelValue', index)
}
</script>

<template>
  <div class="tabs">
    <div class="tabs__label">
      <template v-for="(tab, index) in slots.default?.()" :key="index">
        <div
          v-if="tab.props?.label"
          class="tab" :class="[{ 'tab--active': activeTab === index }]"
          @click="selectTab(index)"
        >
          {{ tab.props.label }}
        </div>
      </template>
    </div>
    <div class="tabs__content">
      <template v-for="(tab, index) in slots.default?.()" :key="index">
        <div v-if="activeTab === index">
          <component :is="tab" />
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.tabs {
  display: flex;
  flex-direction: column;
}

.tabs__label {
  display: flex;
  gap: 3px;
  margin-bottom: 16px;
}

.tabs__content {
  flex: 1;
}

.tab {
  position: relative;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  height: 40px;
  padding: 10px 12px;
  cursor: pointer;
  color: var(--tab-normal-text-color);
}

.tab--active {
  color: var(--tab-active-text-color);
}

.tab--active::after {
  content: '';
  position: absolute;
  bottom: 4.5px;
  left: 8px;
  width: 70px;
  border: 1px solid var(--foreground);
  border-radius: 999px;
}
</style>
