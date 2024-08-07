import { EavLogger } from '../../../../projects/eav-ui/src/app/shared/logging/eav-logger';
import { Connector, EavCustomInputField, WysiwygReconfigure } from '../../../edit-types';
import { wysiwygEditorHtmlTag } from '../../internal-constants';
import { FieldStringWysiwygEditor } from '../editor/editor';
import { registerCustomElement } from '../editor/editor-helpers';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from '../preview/preview';
import * as styles from './field-string-wysiwyg.scss';

const logThis = false;
const nameOfThis = 'FieldStringWysiwyg';

const wysiwygTag = 'field-string-wysiwyg';

/**
 * Main component for the WYSIWYG field.
 * Acts like a switcher that decides whether to load preview or the editor
 */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized = false;
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  private log = new EavLogger(nameOfThis, logThis);

  constructor() {
    super();
    this.log.a(`constructor`);
  }

  connectedCallback(): void {
    if (this.fieldInitialized) return;
    this.fieldInitialized = true;
    this.log.a(`connectedCallback`);

    this.innerHTML = `<style>${styles.default}</style>`;
    this.classList.add('wysiwyg-switcher');

    const previewMode = this.isPreviewMode();
    if (previewMode)
      this.createPreview();
    else
      this.createEditor();
  }

  private isPreviewMode(): boolean {
    // first check if mode is explicitly set and what it is
    const attrMode = this.getAttribute('mode');
    if ((this.mode ?? attrMode) != null)
      return this.mode === 'preview' || attrMode === 'preview';

    return this.connector.field.settings?.Dialog === 'dialog';
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

registerCustomElement(wysiwygTag, FieldStringWysiwyg);
