import { Subscription } from 'rxjs';
import { EavExperimentalInputFieldObservable } from '../shared/models';
import { buildTemplate, randomIntFromInterval } from '../shared/helpers';
import { FeaturesGuidsConstants } from '../../../shared/features-guids.constants';
import * as template from './main.html';
import * as styles from './main.css';
import { getTinyOptions, addTranslations } from './tinymce-options';
import { addTinyMceToolbarButtons } from './tinymce-toolbar';
import { attachDnnBridgeService } from './tinymce-dnnbridge-service';
import { attachAdam } from './tinymce-adam-service';
import * as skinOverrides from './oxide-skin-overrides.scss';
import * as contentStyle from './tinymce-content.css';
import { fixMenuPositions } from './fix-menu-positions-helper';
declare const tinymce: any;

class FieldStringWysiwyg extends EavExperimentalInputFieldObservable<string> {
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[] = [];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteImageFromClipboardEnabled: boolean;
  private editor: any;
  private firstInit: boolean;
  private tinyMceBaseUrl = 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.1.6';
  private dialogIsOpen: boolean;
  private observer: MutationObserver;

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
    const instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${instanceId}`;
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    if (this.experimental.wysiwygSettings.inlineMode) {
      this.classList.add('inline-wysiwyg');
    } else {
      this.classList.add('full-wysiwyg');
    }

    const tinyMceSrc = `${this.tinyMceBaseUrl}/tinymce.min.js`;

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
    // enable content blocks if there is another field after this one and it's type is entity-content-blocks
    const contentBlocksEnabled = (this.experimental.allInputTypeNames.length > this.connector.field.index + 1)
      ? this.experimental.allInputTypeNames[this.connector.field.index + 1].inputType === 'entity-content-blocks'
      : false;

    const pasteFormattedTextEnabled = this.experimental.isFeatureEnabled(FeaturesGuidsConstants.PasteWithFormatting);
    this.pasteImageFromClipboardEnabled = this.experimental.isFeatureEnabled(FeaturesGuidsConstants.PasteImageFromClipboard);
    const dropzoneConfig = this.experimental.dropzoneConfig$.value;

    const tinyOptions = getTinyOptions({
      containerClass: this.containerClass,
      fixedToolbarClass: this.toolbarContainerClass,
      contentStyle: contentStyle.default,
      setup: this.tinyMceSetup.bind(this),
      currentLang: this.experimental.translateService.currentLang,
      contentBlocksEnabled,
      pasteFormattedTextEnabled,
      pasteImageFromClipboardEnabled: this.pasteImageFromClipboardEnabled,
      imagesUploadUrl: dropzoneConfig.url as string,
      uploadHeaders: dropzoneConfig.headers,
      inlineMode: this.experimental.wysiwygSettings.inlineMode,
      buttonSource: this.experimental.wysiwygSettings.buttonSource,
      buttonAdvanced: this.experimental.wysiwygSettings.buttonAdvanced,
    });
    this.firstInit = true;
    if (tinymce.baseURL !== this.tinyMceBaseUrl) { tinymce.baseURL = this.tinyMceBaseUrl; }
    tinymce.init(tinyOptions);
  }

  private tinyMceSetup(editor: any) {
    this.editor = editor;
    editor.on('init', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized', event);
      addTinyMceToolbarButtons(this, editor, this.experimental.expand);
      attachDnnBridgeService(this, editor);
      attachAdam(this, editor);
      addTranslations(editor.settings.language, this.experimental.translateService, editor.editorManager);
      this.observer = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
      );
      if (!this.experimental.wysiwygSettings.inlineMode) {
        setTimeout(() => { editor.focus(false); }, 100); // If not inline mode always focus on init
      } else {
        if (!this.firstInit) { setTimeout(() => { editor.focus(false); }, 100); } // If is inline mode skip focus on first init
        // Inline only subscriptions
        this.subscriptions.push(
          this.experimental.expandedField$.subscribe(expandedFieldId => {
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
    editor.on('remove', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE removed', event);
      this.clearData();
    });

    editor.on('focus', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE focused', event);
      attachDnnBridgeService(this, editor); // spm 2019-09-23 just a workaround. Fix asap
      attachAdam(this, editor); // spm 2019-09-23 just a workaround. Fix asap
      if (this.pasteImageFromClipboardEnabled) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        const dzConfig = { ...this.experimental.dropzoneConfig$.value };
        // tslint:disable-next-line:max-line-length
        dzConfig.acceptedFiles = '.doc, .docx, .dot, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv';
        this.experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.experimental.wysiwygSettings.inlineMode) {
        this.experimental.setFocused(true);
      }
    });

    editor.on('blur', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE blurred', event);
      if (!this.pasteImageFromClipboardEnabled) {
        // Dropzone will handle image uploads again
        const dzConfig = { ...this.experimental.dropzoneConfig$.value };
        delete dzConfig.acceptedFiles;
        this.experimental.dropzoneConfig$.next(dzConfig);
      }
      if (this.experimental.wysiwygSettings.inlineMode) {
        this.experimental.setFocused(false);
      }
    });

    editor.on('change', this.saveValue.bind(this));
    editor.on('undo', this.saveValue.bind(this));
    editor.on('redo', this.saveValue.bind(this));
    this.subscriptions.push(this.connector.data.forceConnectorSave$.subscribe(this.saveValue.bind(this)));
  }

  private saveValue(event: any) {
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
