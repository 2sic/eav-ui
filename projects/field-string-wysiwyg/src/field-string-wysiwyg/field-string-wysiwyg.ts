import { EavCustomInputField, Connector } from '../../../edit-types';
import { FieldStringWysiwygPreview } from '../preview/preview';
import { FieldStringWysiwygDialog } from '../editor/editor';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;

  constructor() {
    super();
    webpackConsoleLog('FieldStringWysiwyg constructor called');
  }

  connectedCallback() {
    webpackConsoleLog('FieldStringWysiwyg connectedCallback called');
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
    const previewName = 'field-string-wysiwyg-preview';
    const previewEl = document.createElement(previewName) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    previewEl.connector._experimental.inlineMode = true;
    this.appendChild(previewEl);
  }

  private runInlineMode() {
    const dialogName = 'field-string-wysiwyg-dialog';
    const dialogEl = document.createElement(dialogName) as FieldStringWysiwygDialog;
    dialogEl.connector = this.connector;
    dialogEl.connector._experimental.inlineMode = true;
    this.appendChild(dialogEl);
  }

  disconnectedCallback() {
    webpackConsoleLog('FieldStringWysiwyg disconnectedCallback called');
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
