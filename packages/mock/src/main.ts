import { createApp, Plugin } from 'vue';
import App from './App.vue';
import { useRequestHook } from './composables';
import { useRuleStore } from './store';

const pages = import.meta.glob('./pages/*.vue', { eager: true });

const Pages: Plugin = {
  install(app) {
    Object.keys(pages).forEach((path) => {
      const name = path.match(/\.\/pages\/(.*)\.vue$/)?.[1];
      app.component(`page-${name}`, (pages[path] as any)['default']);
    });
  },
};

const ruleStore = useRuleStore();

useRequestHook({
  rules: ruleStore.rules,
  record: ruleStore.record,
  immediate: true,
});

addEventListener('DOMContentLoaded', () => {
  createApp(App)
    .use(Pages)
    .mount(
      (() => {
        console.log('App mounted');
        const app = document.createElement('div');
        app.id = 'uss-mock-app';
        document.body.append(app);

        return app;
      })()
    );
});
