import { Subscription } from 'rxjs';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { FeaturesConstants } from '../../../edit/shared/constants';
import { consoleLogWebpack } from '../../../ng-dialogs/src/app/shared/helpers/console-log-webpack.helper';
import { TinyMceButtons } from '../config/buttons';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { TinyMceTranslations } from '../config/translations';
import { attachAdam } from '../connector/adam';
import { buildTemplate } from '../shared/helpers';
import * as styles from './editor.css';
import * as template from './editor.html';
import { fixMenuPositions } from './fix-menu-positions.helper';
import * as skinOverrides from './oxide-skin-overrides.scss';

declare const tinymce: any;
export const wysiwygEditorTag = 'field-string-wysiwyg-dialog';
const extWhitelist = '.doc, .docx, .dot, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv';
const tinyMceBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.1.6';
const translationBaseUrl = '../../system/field-string-wysiwyg';

export class FieldStringWysiwygEditor extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  mode?: 'inline' | 'normal';
  reconfigure?: WysiwygReconfigure;
  private instanceId: string;
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[] = [];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteClipboardImage: boolean;
  private editor: any;
  private firstInit: boolean;
  private dialogIsOpen: boolean;
  private observer: MutationObserver;

  /** The object that's responsible for configuring tinymce */
  public configurator: TinyMceConfigurator;

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygEditorTag} constructor called`);
    this.instanceId = `${Math.floor(Math.random() * 99999)}`;
    this.containerClass = `tinymce-container-${this.instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${this.instanceId}`;
  }

  connectedCallback() {
    consoleLogWebpack(`${wysiwygEditorTag} connectedCallback called`);
    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');
    if (this.connector.field.disabled) {
      this.classList.add('disabled');
    }
    let lang = this.connector._experimental.translateService.currentLang;
    lang = TinyMceTranslations.fixTranslationKey(lang);
    this.connector.loadScript([
      { test: 'tinymce', src: `${tinyMceBaseUrl}/tinymce.min.js` },
      {
        test: () => lang === 'en' || Object.keys(tinymce.i18n.getData()).includes(lang)
          || !TinyMceTranslations.supportedLanguages.includes(lang),
        src: `${translationBaseUrl}/i18n/${lang}.js`
      }
    ], () => { this.tinyMceScriptLoaded(); });
    this.connector._experimental.dropzone.setConfig({ disabled: false });
  }

  private tinyMceScriptLoaded() {
    consoleLogWebpack(`${wysiwygEditorTag} tinyMceScriptLoaded called`);
    this.configurator = new TinyMceConfigurator(tinymce, this.connector, this.reconfigure);
    this.pasteClipboardImage = this.connector._experimental.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard);
    const tinyOptions = this.configurator.buildOptions(
      this.containerClass, this.toolbarContainerClass, this.mode === 'inline', this.tinyMceSetup.bind(this)
    );
    this.firstInit = true;
    if (tinymce.baseURL !== tinyMceBaseUrl) { tinymce.baseURL = tinyMceBaseUrl; }
    // FYI: SPM - moved this here from Setup as it's actually global
    this.configurator.addTranslations();
    tinymce.init(tinyOptions);
  }

  /** This will initialized an instance of an editor. Everything else is kind of global. */
  private tinyMceSetup(editor: any) {
    this.editor = editor;
    editor.on('init', (_event: any) => {
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE initialized`, editor);
      this.reconfigure?.editorOnInit?.(editor);
      TinyMceButtons.registerAll(this, editor, this.connector._experimental.adam);
      if (!this.reconfigure?.disableAdam) { attachAdam(editor, this.connector._experimental.adam); }
      this.observer = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
      );
      if (this.mode !== 'inline') {
        setTimeout(() => { editor.focus(false); }, 100); // If not inline mode always focus on init
      } else {
        if (!this.firstInit) { setTimeout(() => { editor.focus(false); }, 100); } // If is inline mode skip focus on first init
        // Inline only subscriptions
        this.subscriptions.push(this.connector._experimental.isExpanded$.subscribe(isExpanded => {
          this.dialogIsOpen = isExpanded;

          if (!this.firstInit && !this.dialogIsOpen) { setTimeout(() => { editor.focus(false); }, 100); }
        }));
      }
      this.firstInit = false;
    });

    // called after tinymce editor is removed
    editor.on('remove', (_event: any) => {
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE removed`, _event);
      this.clearData();
    });

    editor.on('focus', (_event: any) => {
      this.classList.add('focused');
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE focused`, _event);
      if (!this.reconfigure?.disableAdam) { attachAdam(editor, this.connector._experimental.adam); }
      if (this.pasteClipboardImage) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        this.connector._experimental.dropzone.setConfig({ acceptedFiles: extWhitelist });
      }
      if (this.mode === 'inline') {
        this.connector._experimental.setFocused(true);
      }
    });

    editor.on('blur', (_event: any) => {
      this.classList.remove('focused');
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE blurred`, _event);
      if (this.pasteClipboardImage) {
        // Dropzone will handle image uploads again
        this.connector._experimental.dropzone.setConfig({ acceptedFiles: '' });
      }
      if (this.mode === 'inline') {
        this.connector._experimental.setFocused(false);
      }
    });

    editor.on('change', this.saveValue.bind(this));
    editor.on('undo', this.saveValue.bind(this));
    editor.on('redo', this.saveValue.bind(this));
    this.reconfigure?.configureEditor?.(editor);
  }

  private saveValue() {
    const newContent = this.editor.getContent();
    if (newContent.includes('<img src="data:image')) { return; }

    this.editorContent = newContent;
    this.connector.data.update(this.editorContent);
  }

  private clearData() {
    if (this.editor) {
      this.editor.remove();
    }
    if (this.subscriptions.length > 0) {
      this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
      this.subscriptions = [];
    }
    if (this.editorContent != null) {
      this.editorContent = null;
    }
    if (this.observer != null) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  disconnectedCallback() {
    consoleLogWebpack(`${wysiwygEditorTag} disconnectedCallback called`);
    this.clearData();
  }
}

// only register the tag, if it has not been registered before
if (!customElements.get(wysiwygEditorTag)) {
  customElements.define(wysiwygEditorTag, FieldStringWysiwygEditor);
}
