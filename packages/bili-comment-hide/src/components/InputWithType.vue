<script setup lang="ts">
import { ref } from 'vue';

const value = ref('')

const emits = defineEmits<{
  (event: 'add', value: string): void
}>()
</script>

<template>
  <div flex h-8 border border-slate-200 border-solid rounded>
    <select relative w-16 px-2 text-sm transition-all  appearance-none  text-slate-500    disabled:cursor-not-allowed  disabled:text-slate-400 cursor-pointer
      bg="transparent autofill:transparent disabled:slate-50"
      border="l-none y-none solid slate-200"
      outline="none focus-visible:none focus:none"
    >
      <option value="keywords">关键词</option>
      <!-- <option value="regex">正则</option> -->
    </select>
    <input w-full px-2 text-sm transition-all border-none text-slate-500  invalid:border-pink-500 invalid:text-pink-500 invalid:focus:border-pink-500 disabled:cursor-not-allowed  disabled:text-slate-400
      bg="transparent autofill:transparent disabled:slate-50"
      outline="none focus-visible:none focus:none"
      v-model="value"
    />
    <!-- 发送按钮 -->
    <button w-16 h-full bg-emerald-500 hover:bg-emerald-300 text-white text-sm disabled:bg-slate-200 disabled:text-slate-400 cursor-pointer
    rounded-r
    border="1px solid slate-200"
      disabled:cursor-not-allowed
      outline="none focus-visible:none focus:none" @click="emits('add', value)">添加</button>
  </div>
</template>