import OpenAI from "openai";
import { DEEPSEEK_BASE_URL, ERROR_MESSAGES } from "./constants";
import { getExtensionPreferences } from "./preferences";

type Annotation = {
  source: string;
  western: string;
};

type ParsedTranslationPayload = {
  translation: string;
  annotations: Annotation[];
};

export type TranslationResultData = {
  translation: string;
  annotatedSourceText: string;
  annotations: Annotation[];
};

const SYSTEM_PROMPT = `你是一名严谨的专业翻译。你的任务是把用户输入翻译成简体中文，并返回结构化 JSON。

返回要求：
1. 只能返回合法 JSON，不要返回 Markdown 代码块，不要返回解释。
2. JSON 结构必须是：
{
  "translation": "中文译文",
  "annotations": [
    {
      "source": "原文中的片假名或需要标注的原词",
      "western": "对应西文词"
    }
  ]
}
3. translation 字段里只放最终中文译文。
4. annotations 只用于原文标注。请把需要在原文上补充西文词的信息放进 annotations。
5. 如果原文是日语：
   - 原文中已经是英文或西文缩写的内容，默认保留原样，不要翻译掉。
   - 遇到片假名外来语时，尽量提供其对应西文词，并写入 annotations。
6. 专有名词、品牌名、产品名、API 名、命令名、变量名、函数名、文件名优先保留原样。
7. 如果没有需要标注的内容，annotations 返回空数组。

示例：
输入：ログインしてDashboardを開きます
输出：
{
  "translation": "登录后打开 Dashboard",
  "annotations": [
    { "source": "ログイン", "western": "login" }
  ]
}`;

function createClient() {
  const preferences = getExtensionPreferences();

  return new OpenAI({
    apiKey: preferences.deepseekApiKey,
    baseURL: DEEPSEEK_BASE_URL,
  });
}

function buildUserPrompt(sourceText: string) {
  return `请把下面文本翻译成简体中文，并按约定返回 JSON。

硬性要求：
- 英文单词、西文缩写、品牌名、产品名、API 名、命令名、路径、变量名、函数名、文件名默认保留原样。
- 日语片假名如果能判断出对应西文词，请放到 annotations 中，不要省略。
- 不要输出解释，不要输出 JSON 之外的任何内容。

原文：
${sourceText}`;
}

function parseJsonPayload(content: string): ParsedTranslationPayload {
  const normalized = content
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/i, "")
    .replace(/\s*```$/, "");

  const parsed = JSON.parse(normalized) as Partial<ParsedTranslationPayload>;
  if (typeof parsed.translation !== "string") {
    throw new Error(ERROR_MESSAGES.invalidTranslationPayload);
  }

  const annotations = Array.isArray(parsed.annotations)
    ? parsed.annotations.filter(
        (item): item is Annotation =>
          typeof item === "object" &&
          item !== null &&
          typeof item.source === "string" &&
          item.source.trim().length > 0 &&
          typeof item.western === "string" &&
          item.western.trim().length > 0,
      )
    : [];

  return {
    translation: parsed.translation.trim(),
    annotations,
  };
}

function annotateSourceText(sourceText: string, annotations: Annotation[]) {
  let annotated = sourceText;

  for (const annotation of annotations) {
    const replacement = `<ruby>${annotation.source}<rt>${annotation.western}</rt></ruby>`;
    annotated = annotated.split(annotation.source).join(replacement);
  }

  return annotated;
}

export async function translateToChinese(text: string): Promise<TranslationResultData> {
  const sourceText = text.trim();
  if (!sourceText) {
    throw new Error(ERROR_MESSAGES.emptyTranslationSource);
  }

  const preferences = getExtensionPreferences();
  const client = createClient();
  const response = await client.chat.completions.create({
    model: preferences.model,
    temperature: 0,
    messages: [
      { role: "system", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(sourceText) },
    ],
  });

  const content = response.choices[0]?.message?.content?.trim();
  if (!content) {
    throw new Error(ERROR_MESSAGES.emptyTranslationResult);
  }

  const payload = parseJsonPayload(content);
  if (!payload.translation) {
    throw new Error(ERROR_MESSAGES.emptyTranslationResult);
  }

  return {
    translation: payload.translation,
    annotatedSourceText: annotateSourceText(sourceText, payload.annotations),
    annotations: payload.annotations,
  };
}

export function toErrorMessage(error: unknown) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return ERROR_MESSAGES.unknown;
}
