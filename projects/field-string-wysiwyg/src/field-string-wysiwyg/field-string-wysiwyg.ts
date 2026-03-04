import { FieldSettings } from 'projects/edit-types/src/FieldSettings';
import { StringWysiwyg } from 'projects/edit-types/src/FieldSettings-String';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { classLog } from '../../../shared/logging';
import { FieldStringWysiwygEditor, wysiwygEditorHtmlTag } from './field-string-wysiwyg-editor';
import { FieldStringWysiwygPreview, wysiwygPreviewTag } from './field-string-wysiwyg-preview';
import * as styles from './field-string-wysiwyg.scss';
import { buildHtmlAndStyles } from './html-helpers';
import { registerCustomElement } from './register-custom-element';

const wysiwygTag = 'field-string-wysiwyg';

const logSpecs = {
  all: false,
  constructor: false,
  connectedCallback: false,
  disconnectedCallback: false,
  isPreviewMode: false,
  createPreview: false,
  createEditor: false,
}

/**
 * Main component for the WYSIWYG field.
 * Acts like a switcher that decides whether to load read-only preview or the editor with all the buttons,
 * based on the mode (edit/preview) and field settings.
 * 
 * This control does not know anything about TinyMCE, it just creates the editor or preview element, and those are responsible for everything else.
 */
class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized = false;
  connector: Connector<string>;
  mode?: 'edit' | 'preview';
  reconfigure?: WysiwygReconfigure;

  private log = classLog({FieldStringWysiwyg}, logSpecs);

  constructor() {
    super();
    this.log.aIf(`constructor`);
  }

  connectedCallback(): void {
    const l = this.log.fnIf(`connectedCallback`, { fieldInitialized: this.fieldInitialized });
    if (this.fieldInitialized)
      return l.end();
    this.fieldInitialized = true;

    this.innerHTML = buildHtmlAndStyles('', styles.default);
    this.classList.add('wysiwyg-switcher');

    const previewMode = this.#isPreviewMode();
    if (previewMode)
      this.#createPreview();
    else
      this.#createEditor();
    l.end(null, { previewMode });
  }

  #isPreviewMode(): boolean {
    const l = this.log.fnIf(`isPreviewMode`);
    // first check if mode is explicitly set and what it is
    const attrMode = this.getAttribute('mode');
    if ((this.mode ?? attrMode) != null)
      return this.mode === 'preview'
        ? l.r(true, `from mode ${this.mode}`)
        : l.r(attrMode === 'preview', `from attribute ${attrMode}`);

    const result = (this.connector.field.settings as FieldSettings & StringWysiwyg)?.Dialog === 'dialog';
    return l.r(result, `Mode: "${result}"` );
  }

  #createPreview(): void {
    const l = this.log.fnIf(`createPreview`);
    const previewEl = document.createElement(wysiwygPreviewTag) as FieldStringWysiwygPreview;
    previewEl.connector = this.connector;
    this.appendChild(previewEl);
    l.end();
  }

  #createEditor(): void {
    const l = this.log.fnIf(`createEditor`);
    const editorEl = document.createElement(wysiwygEditorHtmlTag) as FieldStringWysiwygEditor;
    editorEl.connector = this.connector;
    editorEl.mode = 'inline';
    editorEl.reconfigure = this.reconfigure;
    this.appendChild(editorEl);
    l.end();
  }

  disconnectedCallback(): void {
    const l = this.log.fnIf(`disconnectedCallback`);
    l.end();
  }
}

registerCustomElement(wysiwygTag, FieldStringWysiwyg);
