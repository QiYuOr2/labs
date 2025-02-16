<script setup lang="ts">
import { useToggle } from '@vueuse/core';
import FloatContainer from './components/FloatContainer.vue';
import Switch from './components/Switch.vue';
import InputWithType from './components/InputWithType.vue';
import { ref } from 'vue';

const [isChecked] = useToggle(true);

const tabs = [
  { name: '关键字', value: 'keywords' },
  { name: '正则', value: 'regex' },
];

const currentTab = ref(tabs[0].value);

const keywords = [
  '关键字1',
  '我',
  '关键字2',
  '落地了',
  '关键字2',
  '这也能缝',
  '关键字2',
]
</script>

<template>
  <FloatContainer>
    <div class="main" box-border w-full px="8px" py="14px">
      <div flex items="center" mb-2>
        <span mr-1>激活隐藏</span>
        <Switch v-model="isChecked" />
      </div>
      <div flex flex-col>
        <InputWithType mb-1 />

        <div my-2 flex items-start gap-2>
          <div v-for="tab in tabs" :key="tab.value" :class="{ 'text-stone-500': currentTab !== tab.value }"
            cursor-pointer @click="currentTab = tab.value" transition-all duration-200>
            <span>{{ tab.name }}列表</span>
          </div>
        </div>

        <ul p-0 m-0>
          <li v-for="keyword in keywords" :key="keyword" text-sm text-zinc-500 list-none mb-1 flex items-center justify-between>
          <span>{{ keyword }}</span>
          <span cursor-pointer>✕</span>
          </li>
        </ul>
      </div>
    </div>
  </FloatContainer>
</template>
