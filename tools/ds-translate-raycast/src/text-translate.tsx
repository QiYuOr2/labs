import { Action, ActionPanel, Form, Icon, openExtensionPreferences, useNavigation } from "@raycast/api";
import { useState } from "react";
import { readCurrentClipboardText } from "./clipboard";
import { TranslationResult } from "./components/translation-result";
import { UI_TEXT } from "./constants";

type TranslateFormValues = {
  text: string;
};

export default function Command() {
  const { push } = useNavigation();
  const [text, setText] = useState("");

  return (
    <Form
      navigationTitle={UI_TEXT.translateFormTitle}
      actions={
        <ActionPanel>
          <Action.SubmitForm
            title={UI_TEXT.translateSubmitAction}
            onSubmit={(values: TranslateFormValues) => {
              push(
                <TranslationResult
                  sourceText={values.text}
                  sourceTitle={UI_TEXT.sourceHeading}
                />,
              );
            }}
          />
          <Action
            title={UI_TEXT.pasteClipboardAction}
            icon={Icon.Clipboard}
            onAction={async () => {
              const clipboardText = await readCurrentClipboardText();
              setText(clipboardText);
            }}
            shortcut={{ modifiers: ["cmd"], key: "v" }}
          />
          <Action title={UI_TEXT.extensionPreferencesAction} icon={Icon.Gear} onAction={openExtensionPreferences} />
        </ActionPanel>
      }
    >
      <Form.TextArea
        id="text"
        title={UI_TEXT.translateInputTitle}
        placeholder={UI_TEXT.translateInputPlaceholder}
        value={text}
        onChange={setText}
      />
      <Form.Description
        title={UI_TEXT.descriptionTitle}
        text={UI_TEXT.descriptionWithoutAutoCopy}
      />
    </Form>
  );
}
