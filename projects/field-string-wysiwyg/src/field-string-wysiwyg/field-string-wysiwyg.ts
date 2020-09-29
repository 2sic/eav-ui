import { Connector, EavCustomInputField } from '../../../edit-types';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';
import { FieldStringWysiwygEditor, wysiwygEditorTag } from '../editor/editor';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from '../preview/preview';
import * as styles from './field-string-wysiwyg.css';

const wysiwygTag = 'field-string-wysiwyg';
const modeEdit = 'edit';
const modePreview = 'preview';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  constructor() {
    super();
    webpackConsoleLog(`${wysiwygTag} constructor called`);
  }

  connectedCallback() {
    webpackConsoleLog(`${wysiwygTag} connectedCallback called`);
    this.innerHTML = `<style>${styles.default}</style>`;
    this.classList.add('wysiwyg-switcher');

    const inline = this.calculateInline();
    if (!inline) {
      this.createPreview();
    } else {
      this.createEditor();
    }
  }

  private calculateInline() {
    let inline = this.connector.field.settings?.Dialog === 'inline';
    if (this.mode != null || this.getAttribute('mode') != null) {
      inline = this.mode === modeEdit || this.getAttribute('mode') === modeEdit;
    }

    return inline;
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
    webpackConsoleLog(`${wysiwygTag} disconnectedCallback called`);
  }
}

// only register the tag, if it has not been registered before
if (!customElements.get(wysiwygTag)) {
  customElements.define(wysiwygTag, FieldStringWysiwyg);
}
