# AI Memory

## 项目目标

- 这是一个 Raycast 扩展。
- 功能是调用 DeepSeek API，把剪贴板文本或手动输入文本翻译成中文。
- 当前存在两个命令：
  - `clipboard-translate`
  - `text-translate`

## 当前目录结构

- `src/clipboard-translate.tsx`
  - 剪贴板翻译命令入口。
- `src/text-translate.tsx`
  - 手动输入翻译命令入口。
- `src/components/translation-result.tsx`
  - 通用翻译结果页组件。
- `src/hooks/use-clipboard-translation-state.ts`
  - 剪贴板翻译流程的状态机封装。
- `src/clipboard.ts`
  - 统一的剪贴板读取入口。
- `src/deepseek.ts`
  - DeepSeek API 调用与响应解析。
- `src/constants.ts`
  - UI 文案、错误文案、轮询配置。
- `src/preferences.ts`
  - Raycast 偏好读取。

## 状态机设计

`clipboard-translate` 当前使用一个明确的状态机，而不是多个布尔状态：

- `checking`
  - 正在读取和判断当前剪贴板。
- `error`
  - 读取剪贴板失败或状态无法建立。
- `unchanged`
  - 当前剪贴板与上次成功翻译的内容相同，不自动重新翻译。
- `translating`
  - 进入结果页并触发翻译。

## 翻译协议

DeepSeek 被要求返回结构化 JSON：

```json
{
  "translation": "中文译文",
  "annotations": [
    {
      "source": "原文中的片假名或待标注词",
      "western": "对应西文词"
    }
  ]
}
```

含义：

- `translation`
  - 最终中文译文。
- `annotations`
  - 仅用于加工原文显示，不直接展示给用户。

## 原文标注规则

- 用户要求把假名或片假名对应的西文词标注在原文上。
- 当前实现会把原文中的对应词替换成：

```html
<ruby>原词<rt>western</rt></ruby>
```

- 译文仍然单独展示，不与原文标注混在一起。

## 已确认的重要决策

- 不再自动复制译文。
  - 原因：翻译完成后自动复制会导致 Raycast 窗口行为异常。
- 剪贴板读取必须只有一个共享入口。
- 剪贴板读取当前使用 Raycast API：
  - `Clipboard.readText({ offset: 0 })`
- 结果页必须在展示时清晰区分：
  - 译文
  - 原文（带标注）

## 历史尝试与结论

### 1. 剪贴板读取

- 曾尝试使用 Node / PowerShell 直接读取系统剪贴板。
- Windows 下出现过编码乱码。
- 后来回退到 Raycast Clipboard API。

### 2. 再次快捷键打开显示旧结果

- 最初通过结果页挂载时重读剪贴板来修复。
- 该方案依赖组件重新挂载，在 Raycast 视图复用时不稳定。
- 后来改成后台轮询 + 状态机。

### 3. 轮询导致界面抖动

- 轮询期间曾出现反复切状态、结果页循环变化的问题。
- 当前通过状态机和“同一剪贴板内容正在展示时不切走”的规则做约束。

## 当前已知风险

- `src/deepseek.ts` 中仍残留历史乱码文本，需要后续专门清理。
- Raycast 复用视图的行为是这个项目当前最容易引发边界问题的来源。
- 当前使用轮询同步剪贴板，后续如果仍有异常，优先从轮询策略下手。

## 后续建议

1. 清理 `src/deepseek.ts` 中的乱码提示词和示例。
2. 如果 Raycast 有更稳定的窗口激活事件，优先替换轮询。
3. 给状态机再补一层最小化测试思路，特别是：
   - 剪贴板变化
   - 剪贴板未变化
   - 结果页展示中剪贴板变化
4. 如果 `ruby` 在 Raycast Markdown 中兼容性不足，需要准备降级方案。

## 操作约束

- 用户明确要求不要执行任何构建命令。
- 修改时优先保证：
  - 单一职责
  - 状态清晰
  - 共享入口唯一
  - 注释用中文
