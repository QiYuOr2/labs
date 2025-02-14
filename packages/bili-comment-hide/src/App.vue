<script setup lang="ts">
import FloatContainer from './components/FloatContainer.vue';
import Switch from './components/Switch.vue';
</script>

<template>
  <FloatContainer>
    <div class="main" w="300px" px="10px">
      <div class="actions" flex>
        <span>开关</span>
        <Switch />
      </div>
    </div>
  </FloatContainer>
</template>

<style>
.after::after {
  content: '';
}
</style>
