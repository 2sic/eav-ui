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
declare const tinymce: any;

const extWhitelist = '.doc, .docx, .dot, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv';
const tinyMceBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.1.6';

export class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
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
  private configurator: TinyMceConfigurator;

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
    this.instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${this.instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${this.instanceId}`;
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    this.classList.add(this.connector._experimental.wysiwygSettings.inlineMode
      ? 'inline-wysiwyg'
      : 'full-wysiwyg');

    const tinyMceSrc = `${tinyMceBaseUrl}/tinymce.min.js`;

    // TODO: SPM create method to take care of this on connector.system...
    const scriptLoaded = !!(window as any).tinymce;
    if (scriptLoaded) {
      this.tinyMceScriptLoaded();
    } else {
      const scriptElement = document.querySelector('script[src="' + tinyMceSrc + '"]') as HTMLScriptElement;
      if (scriptElement) {
        scriptElement.addEventListener('load', this.tinyMceScriptLoaded.bind(this), { once: true });
      } else {
        const script = document.createElement('script');
        script.src = tinyMceSrc;
        script.addEventListener('load', this.tinyMceScriptLoaded.bind(this), { once: true });
        this.appendChild(script);
      }
    }
  }

  private tinyMceScriptLoaded() {
    console.log('FieldStringWysiwyg tinyMceScriptLoaded called');
    this.configurator = new TinyMceConfigurator(tinymce, this.connector, this.reconfigure);
    this.pasteImageFromClipboardEnabled = this.connector._experimental.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard);
    const tinyOptions = this.configurator.buildOptions(this.containerClass, this.toolbarContainerClass, this.tinyMceSetup.bind(this));
    this.firstInit = true;
    if (tinymce.baseURL !== tinyMceBaseUrl) { tinymce.baseURL = tinyMceBaseUrl; }
    tinymce.init(tinyOptions);
  }

  private tinyMceSetup(editor: any) {
    this.editor = editor;
    this.reconfigure?.editorInit?.(editor);
    editor.on('init', (_event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized', editor);
      TinyMceButtons.registerAll(this, editor, this.expand.bind(this));
      // tslint:disable: curly
      if (!this.reconfigure?.disablePagePicker) attachDnnBridgeService(this, editor);
      if (!this.reconfigure?.disableAdam) attachAdam(this, editor);
      this.configurator.addTranslations();
      // addTranslations(editor.settings.language, this.connector._experimental.translateService, editor.editorManager);
      this.observer = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
      );
      if (!this.connector._experimental.wysiwygSettings.inlineMode) {
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
      console.log('FieldStringWysiwyg TinyMCE removed', _event);
      this.clearData();
    });

    editor.on('focus', (_event: any) => {
      console.log('FieldStringWysiwyg TinyMCE focused', _event);
      if (!this.reconfigure?.disablePagePicker) attachDnnBridgeService(this, editor); // TODO: spm 2019-09-23 just a workaround. Fix asap
      if (!this.reconfigure?.disableAdam) attachAdam(this, editor); // TODO: spm 2019-09-23 just a workaround. Fix asap
      if (this.pasteImageFromClipboardEnabled) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        const dzConfig = { ...this.connector._experimental.dropzoneConfig$.value };
        dzConfig.acceptedFiles = extWhitelist;
        this.connector._experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.connector._experimental.wysiwygSettings.inlineMode) {
        this.connector._experimental.setFocused(true);
      }
    });

    editor.on('blur', (_event: any) => {
      console.log('FieldStringWysiwyg TinyMCE blurred', _event);
      if (!this.pasteImageFromClipboardEnabled) {
        // Dropzone will handle image uploads again
        const dzConfig = { ...this.connector._experimental.dropzoneConfig$.value };
        delete dzConfig.acceptedFiles;
        this.connector._experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.connector._experimental.wysiwygSettings.inlineMode) {
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
    console.log('FieldStringWysiwyg disconnectedCallback called');
    this.clearData();
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
