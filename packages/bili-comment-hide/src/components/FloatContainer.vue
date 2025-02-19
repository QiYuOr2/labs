<script setup lang="ts">
import { useToggle } from '@vueuse/core';

const [isExpand, toggleExpand] = useToggle(true);
</script>


<template>
  <div fixed bg-white border border-solid border-stone-2 shadow-sm shadow-stone-400 rounded-xl z="99999" right-2 
    transition-all duration-300 ease-in-out overflow-hidden top="100px" :w="isExpand ? '300px' : '12'"
    :h="isExpand ? '600px' : '12'" :p="isExpand ? '1.3' : '0'">
    <div ref="el" @click="toggleExpand()" flex items-center justify-center h-12 rounded-lg bg-stone-100 
    
      :bg="isExpand ? 'stone-100' : 'white'" :w="isExpand ? 'full' : '12'"  cursor-pointer transition-all duration-300 ease-in-out>
      评论
    </div>
    <div v-show="isExpand" w="300px">
      <slot></slot>
    </div>
  </div>
</template>
