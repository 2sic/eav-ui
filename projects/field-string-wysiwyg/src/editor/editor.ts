import 'tinymce/tinymce'; // Important! tinymce has to be imported before themes and plugins
import 'tinymce/models/dom'

import type { Subscription } from 'rxjs';
import 'tinymce/icons/default';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/themes/silver';
// tslint:disable-next-line:no-duplicate-imports
import type { Editor, RawEditorOptions } from 'tinymce/tinymce';
import { FeaturesConstants } from '../../../eav-ui/src/app/edit/shared/constants';
import { EavWindow } from '../../../eav-ui/src/app/shared/models/eav-window.model';
import { Connector, EavCustomInputField, WysiwygReconfigure } from '../../../edit-types';
import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { TinyMceButtons } from '../config/buttons';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { RawEditorOptionsWithModes, WysiwygInline } from '../config/tinymce-helper-types';
import { TinyMceTranslations } from '../config/translations';
import { attachAdam } from '../connector/adam';
import { buildTemplate } from '../shared/helpers';
import * as template from './editor.html';
import * as styles from './editor.scss';
import { fixMenuPositions } from './fix-menu-positions.helper';
import * as skinOverrides from './skin-overrides.scss';

declare const window: EavWindow;
export const wysiwygEditorTag = 'field-string-wysiwyg-dialog';
const extWhitelist = '.doc, .docx, .dot, .dotx, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv, .jpg, .jpeg, .png';
const tinyMceBaseUrl = '../../system/field-string-wysiwyg';

export class FieldStringWysiwygEditor extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;
  mode?: 'inline' | 'normal';
  reconfigure?: WysiwygReconfigure;
  /** Responsible for configuring TinyMCE */
  configurator: TinyMceConfigurator;

  private instanceId: string;
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteClipboardImage: boolean;
  private editor: Editor;
  private firstInit: boolean;
  private dialogIsOpen: boolean;
  private menuObserver: MutationObserver;

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygEditorTag} constructor called`);
    this.subscriptions = [];
    this.fieldInitialized = false;
    this.instanceId = `${Math.floor(Math.random() * 99999)}`;
    this.containerClass = `tinymce-container-${this.instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${this.instanceId}`;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${wysiwygEditorTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector<HTMLDivElement>('.tinymce-container').classList.add(this.containerClass);
    this.querySelector<HTMLDivElement>('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');
    this.pasteClipboardImage = this.connector._experimental.isFeatureEnabled(FeaturesConstants.PasteImageFromClipboard);

    const tinyLang = TinyMceTranslations.fixTranslationKey(this.connector._experimental.translateService.currentLang);
    this.connector.loadScript(
      [
        {
          test: () => tinyLang === 'en' || Object.keys(window.tinymce.i18n.getData()).includes(tinyLang),
          src: `${tinyMceBaseUrl}/i18n/${tinyLang}.js`,
        },
      ],
      () => {
        this.tinyMceScriptLoaded();
      }
    );

    this.connector._experimental.dropzone.setConfig({ disabled: false });
  }

  private tinyMceScriptLoaded(): void {
    consoleLogWebpack(`${wysiwygEditorTag} tinyMceScriptLoaded called`);
    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      this.containerClass,
      this.toolbarContainerClass,
      this.mode === 'inline',
      (editor: Editor) => { this.tinyMceSetup(editor, tinyOptions); },
    );
    this.firstInit = true;
    this.configurator.addTranslations();
    window.tinymce.baseURL = tinyMceBaseUrl;
    window.tinymce.init(tinyOptions);
  }

  /** This will initialized an instance of an editor. Everything else is kind of global. */
  private tinyMceSetup(editor: Editor, rawEditorOptions: RawEditorOptionsWithModes): void {
    this.editor = editor;
    editor.on('init', _event => {
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE initialized`, editor);
      this.reconfigure?.editorOnInit?.(editor);
      new TinyMceButtons(this, editor, this.connector._experimental.adam, rawEditorOptions).registerAll();
      if (!this.reconfigure?.disableAdam) {
        attachAdam(editor, this.connector._experimental.adam);
      }
      this.menuObserver = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
        this.connector.field$.subscribe(fieldConfig => {
          if (fieldConfig.settings.Disabled) {
            this.classList.add('disabled');
          } else {
            this.classList.remove('disabled');
          }
        }),
      );
      if (this.mode !== WysiwygInline) {
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

    // called after TinyMCE editor is removed
    editor.on('remove', _event => {
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE removed`, _event);
      this.clearData();
    });

    editor.on('focus', _event => {
      this.classList.add('focused');
      consoleLogWebpack(`${wysiwygEditorTag} TinyMCE focused`, _event);
      if (!this.reconfigure?.disableAdam) {
        attachAdam(editor, this.connector._experimental.adam);
      }
      if (this.pasteClipboardImage) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        this.connector._experimental.dropzone.setConfig({ acceptedFiles: extWhitelist });
      }
      if (this.mode === 'inline') {
        this.connector._experimental.setFocused(true);
      }
    });

    editor.on('blur', _event => {
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

    editor.on('change', () => { this.saveValue(); });
    editor.on('undo', () => { this.saveValue(); });
    editor.on('redo', () => { this.saveValue(); });
    this.reconfigure?.configureEditor?.(editor);
  }

  private saveValue(): void {
    const newContent = this.editor.getContent();
    if (newContent.includes('<img src="data:image')) { return; }

    this.editorContent = newContent;
    this.connector.data.update(this.editorContent);
  }

  private clearData(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.editor?.destroy();
    this.editor?.remove();
    this.editorContent = null;
    this.menuObserver?.disconnect();
    this.menuObserver = null;
  }

  disconnectedCallback(): void {
    consoleLogWebpack(`${wysiwygEditorTag} disconnectedCallback called`);
    this.clearData();
  }
}

if (!customElements.get(wysiwygEditorTag)) {
  customElements.define(wysiwygEditorTag, FieldStringWysiwygEditor);
}
