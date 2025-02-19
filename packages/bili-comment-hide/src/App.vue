<script setup lang="ts">
import { useToggle } from '@vueuse/core';
import FloatContainer from './components/FloatContainer.vue';
import Switch from './components/Switch.vue';
import InputWithType from './components/InputWithType.vue';
import { ref, watch } from 'vue';
import { useRequestHook } from './composables/useRequest';
import { useGMValue } from './composables/useGMValue';

const [isChecked] = useToggle(true);

const tabs = [
  { name: '关键词', value: 'keywords' },
  // { name: '正则', value: 'regex' },
];

const currentTab = ref(tabs[0].value);

const keywords = useGMValue<string[]>('keywords', []);


function filterWithKeywords(reply: any) {
  return keywords.value.every(keyword => reply.content.message.indexOf(keyword) === -1);
}

const requestHook = useRequestHook({
  rules: [
    {
      url: "x/v2/reply/wbi/main",
      response: (originResponse: any) => {
        if (originResponse?.data?.replies) {
          const replies = originResponse.data.replies.slice().filter(filterWithKeywords);
          originResponse.data.replies = replies;
        }
        return originResponse;
      },
    },
  ],
  immediate: true,
});

watch(isChecked, (value) => {
  value ? requestHook.enable() : requestHook.disable();
});


function addKeyword(value: string) {
  if (value) {
    keywords.value.push(value);
  }
}

function remove(value: string) {
  const index = keywords.value.indexOf(value);
  if (index > -1) {
    keywords.value.splice(index, 1);
  }
}
</script>

<template>
  <FloatContainer>
    <div class="main" box-border w-full px="8px" py="14px">
      <div flex items="center" mb-2>
        <span mr-1>激活隐藏</span>
        <Switch v-model="isChecked" />
      </div>
      <div flex flex-col>
        <InputWithType mb-1 @add="addKeyword" />

        <div my-2 flex items-start gap-2>
          <div v-for="tab in tabs" :key="tab.value" :class="{ 'text-stone-500': currentTab !== tab.value }"
            cursor-pointer @click="currentTab = tab.value" transition-all duration-200>
            <span>{{ tab.name }}列表</span>
          </div>
        </div>

        <ul p-0 m-0 overflow-y-scroll h="430px" v-if="keywords.value.length > 0">
          <li v-for="keyword in keywords.value" :key="keyword" text-sm text-zinc-500 list-none mb-1 flex items-center
            justify-between pr-1>
            <span truncate mr-.5>{{ keyword }}</span>
            <span cursor-pointer p-.5 @click="remove(keyword)">✕</span>
          </li>
        </ul>
        <div text-sm text-zinc-500 flex justify-center items-center mt-30>这里是空的</div>
      </div>
    </div>
  </FloatContainer>
</template>
