import { Connector, EavCustomInputField } from '../../../edit-types';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { consoleLogWebpack } from '../../../ng-dialogs/src/app/shared/helpers/console-log-webpack.helper';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from '../preview/preview';
import * as styles from './field-string-wysiwyg.css';

const wysiwygTag = 'field-string-wysiwyg';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygTag} constructor called`);
  }

  connectedCallback() {
    consoleLogWebpack(`${wysiwygTag} connectedCallback called`);
    this.innerHTML = `<style>${styles.default}</style>`;
    this.classList.add('wysiwyg-switcher');

    const previewMode = this.isPreviewMode();
    if (previewMode) {
      this.createPreview();
    } else {
      this.createEditor();
    }
  }

  private isPreviewMode() {
    let previewMode = this.connector.field.settings?.Dialog === 'dialog';
    if (this.mode != null || this.getAttribute('mode') != null) {
      previewMode = this.mode === 'preview' || this.getAttribute('mode') === 'preview';
    }

    return previewMode;
  }

  private createPreview() {
    const previewName = wysiwygPreviewTag;
    const previewEl = document.createElement(previewName) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    this.appendChild(previewEl);
  }

  private createEditor() {
    const editorName = wysiwygEditorTag;
    const editorEl = document.createElement(editorName) as FieldStringWysiwygEditor;
    editorEl.connector = this.connector;
    editorEl.mode = 'inline';
    editorEl.reconfigure = this.reconfigure;
    this.appendChild(editorEl);
  }

  disconnectedCallback() {
    consoleLogWebpack(`${wysiwygTag} disconnectedCallback called`);
  }
}

// only register the tag, if it has not been registered before
if (!customElements.get(wysiwygTag)) {
  customElements.define(wysiwygTag, FieldStringWysiwyg);
}
