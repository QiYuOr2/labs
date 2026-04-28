# DeepSeek Translate to Chinese

一个 Raycast 插件，使用 DeepSeek API 将剪贴板文本或手动输入文本翻译成中文。

## 功能

- `Translate Clipboard to Chinese`
  - 读取当前剪贴板文本并翻译成中文
  - 可自动把译文重新复制回剪贴板
- `Translate Text to Chinese`
  - 手动输入任意文本并翻译成中文
  - 在结果页查看原文和译文

## 配置

在 Raycast 扩展设置中填写：

- `DeepSeek API Key`
- `Model`
  - 推荐默认值：`deepseek-v4-flash`
- `Auto Copy Result`

## 开发

```bash
pnpm install
pnpm dev
```
