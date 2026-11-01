import { defineConfig } from 'vite-plus';

const ignored = [
  'dist/**',
  'snippets/**',
  'prompts/**',
  'preview/**',
  'go/**',
  'packages/hw/comm.js',
  'packages/hw/comm.d.ts',
  'pnpm-lock.yaml',
];

export default defineConfig({
  fmt: {
    ignorePatterns: ignored,
    semi: true,
    singleQuote: true,
  },
  lint: {
    ignorePatterns: ignored,
    options: {
      typeAware: false,
      typeCheck: false,
    },
    plugins: ['typescript', 'vue'],
    rules: {
      'no-console': 'off',
    },
    overrides: [
      {
        files: ['apps/ds-translate-raycast/**'],
        plugins: ['react'],
      },
    ],
  },
});
