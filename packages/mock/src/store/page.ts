import { createGlobalState } from '@vueuse/core';
import { ref } from 'vue';

export const Pages = {
  Rules: 'page-rules',
  Edit: 'page-edit',
};

export const usePageStore = createGlobalState(() => {
  const current = ref(Pages.Rules);

  function to(name: (typeof Pages)[keyof typeof Pages]) {
    current.value = name;
  }

  return { current, to };
});
