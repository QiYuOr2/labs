import { createGlobalState } from '@vueuse/core';
import { ref } from 'vue';

export const Pages = {
  Rules: 'page-rules',
  Edit: 'page-edit',
};

export const useGlobalState = createGlobalState(() => {
  const page = ref(Pages.Rules);
  function toPage(name: (typeof Pages)[keyof typeof Pages]) {
    page.value = name;
  }

  return { page, toPage };
});
