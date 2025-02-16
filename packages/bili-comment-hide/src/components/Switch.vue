<script setup lang="ts">


const modelValue = defineModel<boolean>()
</script>

<template>
  <div relative flex flex-wrap items-center>
    <input :checked="modelValue" @change="modelValue = !modelValue" type="checkbox"
      class="relative appearance-none cursor-pointer shadow-sm shadow-gray-2 focus:outline-none focus-visible:outline-none after:content-[''] after:absolute after:top-0 disabled:cursor-not-allowed "
      w="8 after:4"
      h="4 after:4"
      left="after:0 checked:after:4"
      rounded="lg after:full"
      transition="colors after:all"
      bg="slate-300 hover:slate-400 after:slate-500  after:hover:slate-600 checked:hover:emerald-300 checked:after:hover:emerald-600 checked:focus:emerald-400 checked:after:focus:emerald-700  checked:after:emerald-500  disabled:slate-200 disabled:after:slate-300 checked:emerald-200" />
  </div>
</template>