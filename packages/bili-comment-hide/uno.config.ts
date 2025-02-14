import { defineConfig, presetAttributify, presetUno, transformerVariantGroup, transformerDirectives } from "unocss";

export default defineConfig({
  presets: [presetAttributify(), presetUno()],
  transformers: [transformerDirectives(), transformerVariantGroup()],
});
