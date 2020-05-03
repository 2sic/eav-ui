import { Subscription } from 'rxjs';
import { EavCustomInputField, Connector } from '../../../edit-types';
import { buildTemplate, randomIntFromInterval } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.css';
import { TinyMceButtons } from '../config/buttons';
import { attachDnnBridgeService } from '../connector/dnn-page-picker';
import { attachAdam } from '../connector/adam';
import * as skinOverrides from './oxide-skin-overrides.scss';
import { fixMenuPositions } from './fix-menu-positions-helper';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { FeaturesGuidsConstants } from '../../../shared/features-guids.constants';
import { webpackConsoleLog } from '../../../shared/webpack-console-log';
declare const tinymce: any;

const extWhitelist = '.doc, .docx, .dot, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv';
const tinyMceBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.1.6';

export class FieldStringWysiwygDialog extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  reconfigure?: WysiwygReconfigure;
  private instanceId: string;
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[] = [];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteImageFromClipboardEnabled: boolean;
  private editor: any;
  private firstInit: boolean;
  private dialogIsOpen: boolean;
  private observer: MutationObserver;

  /** The object that's responsible for configuring tinymce */
  public configurator: TinyMceConfigurator;

  constructor() {
    super();
    webpackConsoleLog('FieldStringWysiwygDialog constructor called');
    this.instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${this.instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${this.instanceId}`;
  }

  connectedCallback() {
    webpackConsoleLog('FieldStringWysiwygDialog connectedCallback called');
    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    // TODO: SPM Why does this still come from outside on _experimental?
    // Shouldn't it come from the settings directly, to which this component has access?
    // or from a tag attribute - that would make way more sense
    this.classList.add(this.connector._experimental.inlineMode ? 'inline-wysiwyg' : 'full-wysiwyg');
    if (this.connector.field.disabled) {
      this.classList.add('disabled');
    }
    this.connector.loadScript('tinymce', `${tinyMceBaseUrl}/tinymce.min.js`, () => { this.tinyMceScriptLoaded(); });
  }

  private tinyMceScriptLoaded() {
    webpackConsoleLog('FieldStringWysiwygDialog tinyMceScriptLoaded called');
    this.configurator = new TinyMceConfigurator(tinymce, this.connector, this.reconfigure);
    this.pasteImageFromClipboardEnabled = this.connector._experimental.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard);
    const tinyOptions = this.configurator.buildOptions(this.containerClass, this.toolbarContainerClass, this.tinyMceSetup.bind(this));
    this.firstInit = true;
    if (tinymce.baseURL !== tinyMceBaseUrl) { tinymce.baseURL = tinyMceBaseUrl; }
    // FYI: SPM - moved this here from Setup as it's actually global
    this.configurator.addTranslations();
    tinymce.init(tinyOptions);
  }

  /**
   * This will initialized an instance of an editor.
   * Everything else is kind of global.
   */
  private tinyMceSetup(editor: any) {
    this.editor = editor;
    editor.on('init', (_event: any) => {
      webpackConsoleLog('FieldStringWysiwygDialog TinyMCE initialized', editor);
      this.reconfigure?.editorInit?.(editor);
      // FYI: SPM - anything against using the more () => syntax?
      TinyMceButtons.registerAll(this, editor, (exp) => this.expand(exp)); // .bind(this));
      // tslint:disable: curly
      if (!this.reconfigure?.disablePagePicker) attachDnnBridgeService(this, editor);
      if (!this.reconfigure?.disableAdam) attachAdam(this, editor);
      this.observer = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
      );
      if (!this.connector._experimental.inlineMode) {
        setTimeout(() => { editor.focus(false); }, 100); // If not inline mode always focus on init
      } else {
        if (!this.firstInit) { setTimeout(() => { editor.focus(false); }, 100); } // If is inline mode skip focus on first init
        // Inline only subscriptions
        this.subscriptions.push(
          this.connector._experimental.expandedField$.subscribe(expandedFieldId => {
            const dialogShouldBeOpen = (this.connector.field.index === expandedFieldId);
            if (dialogShouldBeOpen === this.dialogIsOpen) { return; }
            this.dialogIsOpen = dialogShouldBeOpen;

            if (!this.firstInit && !this.dialogIsOpen) { setTimeout(() => { editor.focus(false); }, 100); }
          }),
        );
      }
      this.firstInit = false;
    });

    // called after tinymce editor is removed
    editor.on('remove', (_event: any) => {
      webpackConsoleLog('FieldStringWysiwygDialog TinyMCE removed', _event);
      this.clearData();
    });

    editor.on('focus', (_event: any) => {
      this.classList.add('focused');
      webpackConsoleLog('FieldStringWysiwygDialog TinyMCE focused', _event);
      if (!this.reconfigure?.disablePagePicker) attachDnnBridgeService(this, editor); // TODO: spm 2019-09-23 just a workaround. Fix asap
      if (!this.reconfigure?.disableAdam) attachAdam(this, editor); // TODO: spm 2019-09-23 just a workaround. Fix asap
      if (this.pasteImageFromClipboardEnabled) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        const dzConfig = { ...this.connector._experimental.dropzoneConfig$.value };
        dzConfig.acceptedFiles = extWhitelist;
        this.connector._experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.connector._experimental.inlineMode) {
        this.connector._experimental.setFocused(true);
      }
    });

    editor.on('blur', (_event: any) => {
      this.classList.remove('focused');
      webpackConsoleLog('FieldStringWysiwygDialog TinyMCE blurred', _event);
      if (!this.pasteImageFromClipboardEnabled) {
        // Dropzone will handle image uploads again
        const dzConfig = { ...this.connector._experimental.dropzoneConfig$.value };
        delete dzConfig.acceptedFiles;
        this.connector._experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.connector._experimental.inlineMode) {
        this.connector._experimental.setFocused(false);
      }
    });

    editor.on('change', this.saveValue.bind(this));
    editor.on('undo', this.saveValue.bind(this));
    editor.on('redo', this.saveValue.bind(this));
    this.reconfigure?.editorReady?.(editor);
    this.subscriptions.push(this.connector.data.forceConnectorSave$.subscribe(this.saveValue.bind(this)));
  }

  private expand(expand: boolean) {
    this.connector.expand(expand);
  }

  private saveValue() {
    this.editorContent = this.editor.getContent();
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
    if (this.editorContent !== null) {
      this.editorContent = null;
    }
    if (this.observer !== null) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  disconnectedCallback() {
    webpackConsoleLog('FieldStringWysiwygDialog disconnectedCallback called');
    this.clearData();
  }
}

customElements.define('field-string-wysiwyg-dialog', FieldStringWysiwygDialog);
