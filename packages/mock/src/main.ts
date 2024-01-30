import { createApp, Plugin } from 'vue';
import App from './App.vue';

const pages = import.meta.glob('./pages/*.vue', { eager: true });

const Pages: Plugin = {
  install(app) {
    Object.keys(pages).forEach((path) => {
      const name = path.match(/\.\/pages\/(.*)\.vue$/)?.[1];
      app.component(`page-${name}`, (pages[path] as any)['default']);
    });
  },
};

createApp(App)
  .use(Pages)
  .mount(
    (() => {
      const app = document.createElement('div');
      document.body.append(app);
      return app;
    })()
  );
