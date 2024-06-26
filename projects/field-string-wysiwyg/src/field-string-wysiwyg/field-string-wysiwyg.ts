import { EavLogger } from '../../../../projects/eav-ui/src/app/shared/logging/eav-logger';
import { Connector, EavCustomInputField, WysiwygReconfigure } from '../../../edit-types';
import { wysiwygEditorHtmlTag } from '../../internal-constants';
import { FieldStringWysiwygEditor } from '../editor/editor';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from '../preview/preview';
import * as styles from './field-string-wysiwyg.scss';

const logThis = false;
const nameOfThis = 'FieldStringWysiwyg';

const wysiwygTag = 'field-string-wysiwyg';

/** Acts like a switcher that decides whether to load preview or the editor  */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  private log = new EavLogger(nameOfThis, logThis);

  constructor() {
    super();
    this.log.a(`constructor`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    this.log.a(`connectedCallback`);

    this.innerHTML = `<style>${styles.default}</style>`;
    this.classList.add('wysiwyg-switcher');

    const previewMode = this.isPreviewMode();
    if (previewMode) {
      this.createPreview();
    } else {
      this.createEditor();
    }
  }

  private isPreviewMode(): boolean {
    let previewMode = this.connector.field.settings?.Dialog === 'dialog';
    if (this.mode != null || this.getAttribute('mode') != null) {
      previewMode = this.mode === 'preview' || this.getAttribute('mode') === 'preview';
    }

    return previewMode;
  }

  private createPreview(): void {
    const previewName = wysiwygPreviewTag;
    const previewEl = document.createElement(previewName) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    this.appendChild(previewEl);
  }

  private createEditor(): void {
    const editorTagName = wysiwygEditorHtmlTag;
    const editorEl = document.createElement(editorTagName) as FieldStringWysiwygEditor;
    editorEl.connector = this.connector;
    editorEl.mode = 'inline';
    editorEl.reconfigure = this.reconfigure;
    this.appendChild(editorEl);
  }

  disconnectedCallback(): void {
    this.log.a(`disconnectedCallback called`);
  }
}

if (!customElements.get(wysiwygTag)) {
  customElements.define(wysiwygTag, FieldStringWysiwyg);
}
