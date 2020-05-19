import { EavCustomInputField, Connector } from '../../../edit-types';
import { wysiwygPreviewTag, FieldStringWysiwygPreview } from '../preview/preview';
import { wysiwygEditorTag, FieldStringWysiwygEditor } from '../editor/editor';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';

const wysiwygTag = 'field-string-wysiwyg';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;

  constructor() {
    super();
    webpackConsoleLog(`${wysiwygTag} constructor called`);
  }

  connectedCallback() {
    webpackConsoleLog(`${wysiwygTag} connectedCallback called`);
    const inline = this.calculateInline();
    if (!inline) {
      this.runPreviewMode();
    } else {
      this.runInlineMode();
    }
  }

  private calculateInline() {
    const inline = this.connector.field.settings.Dialog === 'inline';
    return inline;
  }

  private runPreviewMode() {
    const previewName = wysiwygPreviewTag;
    const previewEl = document.createElement(previewName) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    previewEl.connector._experimental.inlineMode = true;
    this.appendChild(previewEl);
  }

  private runInlineMode() {
    const dialogName = wysiwygEditorTag;
    const dialogEl = document.createElement(dialogName) as FieldStringWysiwygEditor;
    dialogEl.connector = this.connector;
    dialogEl.connector._experimental.inlineMode = true;
    this.appendChild(dialogEl);
  }

  disconnectedCallback() {
    webpackConsoleLog(`${wysiwygTag} disconnectedCallback called`);
  }
}

customElements.define(wysiwygTag, FieldStringWysiwyg);
