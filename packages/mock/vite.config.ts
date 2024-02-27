import { Plugin, defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';

// 将所有`window`替换为`unsafeWindow`
// 处理 xhook 不支持 unsafeWindow 的问题
function supportUnsafeWindow(): Plugin {
  return {
    name: 'support-unsafe-window',
    enforce: 'pre',
    transform(code, id) {
      if (id.endsWith('.js')) {
        return code.replace(/\bwindow\b/g, 'unsafeWindow');
      }
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'qiyuor2/mock',
        include: '*',
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
