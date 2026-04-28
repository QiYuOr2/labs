import { Action, ActionPanel, Detail, Icon } from "@raycast/api";
import { TranslationResult } from "./components/translation-result";
import { UI_TEXT } from "./constants";
import { ClipboardViewState, useClipboardTranslationState } from "./hooks/use-clipboard-translation-state";

function buildMarkdownSection(title: string, content = "") {
  return content ? `# ${title}\n\n${content}` : `# ${title}`;
}

function buildUnchangedClipboardMarkdown(text: string) {
  return [
    buildMarkdownSection(UI_TEXT.clipboardUnchangedHeading, UI_TEXT.clipboardUnchangedMessage),
    buildMarkdownSection(UI_TEXT.clipboardSourceHeading, text),
  ].join("\n\n---\n\n");
}

function getClipboardMarkdown(viewState: ClipboardViewState) {
  switch (viewState.kind) {
    case "error":
      return buildMarkdownSection(UI_TEXT.clipboardErrorHeading, viewState.message);
    case "unchanged":
      return buildUnchangedClipboardMarkdown(viewState.clipboardText);
    case "checking":
      return buildMarkdownSection(UI_TEXT.loadingClipboardHeading);
    case "translating":
      return buildMarkdownSection(UI_TEXT.loadingClipboardHeading);
  }
}

export default function Command() {
  const { viewState, loadClipboard, markClipboardAsTranslated } = useClipboardTranslationState();

  if (viewState.kind === "translating") {
    return (
      <TranslationResult
        key={`${viewState.sessionId}-${viewState.clipboardText}`}
        sourceText={viewState.clipboardText}
        sourceTitle={UI_TEXT.clipboardSourceHeading}
        onRefreshSource={() => loadClipboard({ showRefreshToast: true, forceTranslate: true })}
        onTranslationComplete={async () => {
          await markClipboardAsTranslated(viewState.clipboardText);
        }}
      />
    );
  }

  return (
    <Detail
      isLoading={viewState.kind === "checking"}
      navigationTitle={UI_TEXT.clipboardSourceHeading}
      markdown={getClipboardMarkdown(viewState)}
      actions={
        <ActionPanel>
          <Action
            title={UI_TEXT.refreshClipboardAction}
            icon={Icon.ArrowClockwise}
            onAction={() => loadClipboard({ showRefreshToast: true })}
            shortcut={{ modifiers: ["cmd"], key: "r" }}
          />
          {viewState.kind === "unchanged" ? (
            <Action
              title={UI_TEXT.forceTranslateAction}
              icon={Icon.TextCursor}
              onAction={() => loadClipboard({ showRefreshToast: true, forceTranslate: true })}
            />
          ) : null}
        </ActionPanel>
      }
    />
  );
}
