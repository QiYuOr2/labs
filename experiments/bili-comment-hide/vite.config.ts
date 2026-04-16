import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import monkey, { cdn } from 'vite-plugin-monkey';
import UnoCSS from 'unocss/vite'


// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    UnoCSS(),
    monkey({
      entry: 'src/main.ts',
      userscript: {
        icon: 'https://vitejs.dev/logo.svg',
        namespace: 'qiyuor2/bili-comment-hide',
        author: 'qiyuor2',
        match: ['*://*.bilibili.com/*'],
        exclude: [
          '*://api.bilibili.com/*',
          '*://api.*.bilibili.com/*',
          '*://*.bilibili.com/api/*',
          '*://member.bilibili.com/studio/bs-editor/*',
          '*://t.bilibili.com/h5/dynamic/specification',
          '*://bbq.bilibili.com/*',
          '*://message.bilibili.com/pages/nav/header_sync',
          '*://s1.hdslb.com/bfs/seed/jinkela/short/cols/iframe.html',
          '*://open-live.bilibili.com/*',
        ],
      },
      build: {
        externalGlobals: {
          vue: cdn.jsdelivr('Vue', 'dist/vue.global.prod.js'),
        },
      },
    }),
  ],
});
