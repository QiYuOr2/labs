<script setup lang="ts"></script>

<template>
  <div class="floating">
    <slot></slot>
  </div>
</template>

<style scoped>
.floating {
  position: fixed;
  top: 60px;
  bottom: 60px;
  left: 24px;
  right: 24px;
  max-width: 400px;
  background: #fff;
  box-shadow: 0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1);
  z-index: 999;
  border: 1px solid #efefef;
  border-radius: 0.6em;
}
</style>
