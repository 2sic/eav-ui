import { FieldSettings } from 'projects/edit-types/src/FieldSettings';
import { StringWysiwyg } from 'projects/edit-types/src/FieldSettings-String';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { classLog } from '../../../shared/logging';
import { registerCustomElement } from '../editor/editor-helpers';
import { FieldStringWysiwygEditor, wysiwygEditorHtmlTag } from './field-string-wysiwyg-editor';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from './field-string-wysiwyg-preview';
import * as styles from './field-string-wysiwyg.scss';

const wysiwygTag = 'field-string-wysiwyg';

/**
 * Main component for the WYSIWYG field.
 * Acts like a switcher that decides whether to load read-only preview or the editor with all the buttons, based on the mode (edit/preview) and field settings.
 */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized = false;
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  private log = classLog({FieldStringWysiwyg});

  constructor() {
    super();
    this.log.a(`constructor`);
  }

  connectedCallback(): void {
    if (this.fieldInitialized)
      return;
    this.fieldInitialized = true;
    this.log.a(`connectedCallback`);

    this.innerHTML = `<style>${styles.default}</style>`;
    this.classList.add('wysiwyg-switcher');

    const previewMode = this.#isPreviewMode();
    if (previewMode)
      this.#createPreview();
    else
      this.#createEditor();
  }

  #isPreviewMode(): boolean {
    // first check if mode is explicitly set and what it is
    const attrMode = this.getAttribute('mode');
    if ((this.mode ?? attrMode) != null)
      return this.mode === 'preview' || attrMode === 'preview';

    return (this.connector.field.settings as FieldSettings & StringWysiwyg)?.Dialog === 'dialog';
  }

  #createPreview(): void {
    const previewEl = document.createElement(wysiwygPreviewTag) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    this.appendChild(previewEl);
  }

  #createEditor(): void {
    const editorEl = document.createElement(wysiwygEditorHtmlTag) as FieldStringWysiwygEditor;
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
