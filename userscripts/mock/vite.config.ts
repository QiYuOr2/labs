import type { Plugin } from 'vite';
import vue from '@vitejs/plugin-vue';
import { defineConfig } from 'vite-plus';
import monkey, { cdn } from 'vite-plugin-monkey';

// xhook 读写的是 window，油猴隔离环境里要换成 unsafeWindow。
function supportUnsafeWindow(): Plugin {
  return {
    name: 'support-unsafe-window',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.js')) return code.replace(/\bwindow\b/g, 'unsafeWindow');
    },
  };
}

export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        name: '接口模拟',
        namespace: 'qiyuor2/mock',
        match: '://*/*',
        grant: 'unsafeWindow',
        'run-at': 'document-start',
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
    supportUnsafeWindow(),
  ],
});
