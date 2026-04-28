import {
  Action,
  ActionPanel,
  Detail,
  Icon,
  openExtensionPreferences,
  useNavigation,
} from "@raycast/api";
import { useEffect, useState } from "react";
import { UI_TEXT } from "../constants";
import { toErrorMessage, translateToChinese } from "../deepseek";

type TranslationResultProps = {
  // 用于翻译并展示的原始文本。
  sourceText: string;
  // 原文区域使用的标题。
  sourceTitle?: string;
  // 用户手动触发时，用于重新读取源文本。
  onRefreshSource?: () => Promise<void> | void;
  // 翻译成功后触发，供外层记录状态。
  onTranslationComplete?: (translation: string) => Promise<void> | void;
};

function buildMarkdownSection(title: string, content: string) {
  return `### ${title}\n\n${content}`;
}

function joinMarkdownSections(sections: string[]) {
  return sections.join("\n\n---\n\n");
}

function buildErrorMarkdown(error: string, sourceTitle: string, sourceText: string) {
  return joinMarkdownSections([
    buildMarkdownSection(UI_TEXT.translationErrorHeading, error),
    buildMarkdownSection(sourceTitle, sourceText),
  ]);
}

function buildSuccessMarkdown(translation: string, sourceTitle: string, sourceText: string) {
  return joinMarkdownSections([
    buildMarkdownSection(UI_TEXT.translationHeading, translation),
    buildMarkdownSection(sourceTitle, sourceText),
  ]);
}

function buildLoadingMarkdown(sourceTitle: string, sourceText: string) {
  return joinMarkdownSections([
    buildMarkdownSection(UI_TEXT.loadingTranslationHeading, UI_TEXT.loadingTranslationMessage),
    buildMarkdownSection(sourceTitle, sourceText),
  ]);
}

function getTranslationMarkdown(params: {
  error?: string;
  translation?: string;
  sourceTitle: string;
  sourceText: string;
}) {
  const { error, translation, sourceTitle, sourceText } = params;

  if (error) {
    return buildErrorMarkdown(error, sourceTitle, sourceText);
  }

  if (translation) {
    return buildSuccessMarkdown(translation, sourceTitle, sourceText);
  }

  return buildLoadingMarkdown(sourceTitle, sourceText);
}

export function TranslationResult({
  sourceText,
  sourceTitle = UI_TEXT.sourceHeading,
  onRefreshSource,
  onTranslationComplete,
}: TranslationResultProps) {
  const { pop } = useNavigation();
  const [translation, setTranslation] = useState<string>();
  const [annotatedSourceText, setAnnotatedSourceText] = useState(sourceText);
  const [error, setError] = useState<string>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    async function runTranslation() {
      setIsLoading(true);
      setError(undefined);
      setTranslation(undefined);
      setAnnotatedSourceText(sourceText);

      try {
        const result = await translateToChinese(sourceText);
        if (cancelled) {
          return;
        }

        setTranslation(result.translation);
        setAnnotatedSourceText(result.annotatedSourceText);
        await onTranslationComplete?.(result.translation);
      } catch (translationError) {
        if (!cancelled) {
          setError(toErrorMessage(translationError));
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    void runTranslation();

    return () => {
      cancelled = true;
    };
  }, [onTranslationComplete, sourceText]);

  const markdown = getTranslationMarkdown({
    error,
    translation,
    sourceTitle,
    sourceText: annotatedSourceText,
  });

  return (
    <Detail
      isLoading={isLoading}
      markdown={markdown}
      navigationTitle={UI_TEXT.translationResultTitle}
      actions={
        <ActionPanel>
          {translation ? <Action.CopyToClipboard title={UI_TEXT.copyTranslationAction} content={translation} /> : null}
          <Action.CopyToClipboard title={`复制${sourceTitle}`} content={annotatedSourceText} shortcut={{ modifiers: ["cmd"], key: "." }} />
          {onRefreshSource ? (
            <Action
              title={UI_TEXT.refreshClipboardAction}
              icon={Icon.ArrowClockwise}
              onAction={onRefreshSource}
              shortcut={{ modifiers: ["cmd"], key: "r" }}
            />
          ) : null}
          <Action title={UI_TEXT.extensionPreferencesAction} icon={Icon.Gear} onAction={openExtensionPreferences} />
          <Action title={UI_TEXT.backAction} icon={Icon.ArrowLeft} onAction={pop} />
        </ActionPanel>
      }
    />
  );
}
