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
declare const tinymce: any;

class FieldStringWysiwyg extends EavExperimentalInputFieldObservable<string> {
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[] = [];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteImageFromClipboardEnabled: boolean;

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
    const instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${instanceId}`;
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.innerHTML = buildTemplate(template, styles + skinOverrides);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);

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
      contentStyle: contentStyle,
      setup: this.tinyMceSetup.bind(this),
      currentLang: this.experimental.translateService.currentLang,
      contentBlocksEnabled: contentBlocksEnabled,
      pasteFormattedTextEnabled: pasteFormattedTextEnabled,
      pasteImageFromClipboardEnabled: this.pasteImageFromClipboardEnabled,
      imagesUploadUrl: dropzoneConfig.url as string,
      uploadHeaders: dropzoneConfig.headers,
    });
    tinymce.init(tinyOptions);
  }

  private tinyMceSetup(editor: any) {
    editor.on('init', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized', event);
      addTinyMceToolbarButtons(this, editor);
      attachDnnBridgeService(this, editor);
      attachAdam(this, editor);
      addTranslations(editor.settings.language, this.experimental.translateService, editor.editorManager);
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
        // field type is FieldConfigAngular
        (this.connector.field as any).expanded.subscribe((expanded: boolean) => {
          if (!expanded) { return; }
          setTimeout(() => { editor.focus(false); }, 100);
        }),
      );
    });

    editor.on('remove', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE removed', event);
      this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
      this.subscriptions = [];
      this.editorContent = null;
    });

    editor.on('focus', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE focused', event);
      if (this.pasteImageFromClipboardEnabled) {
        // When tiny is in focus, let it handle image uploads by removing image types from accepted files in dropzone.
        // Files will be handled by dropzone
        const dzConfig = { ...this.experimental.dropzoneConfig$.value };
        // tslint:disable-next-line:max-line-length
        dzConfig.acceptedFiles = '.doc, .docx, .dot, .xls, .xlsx, .ppt, .pptx, .pdf, .txt, .htm, .html, .md, .rtf, .xml, .xsl, .xsd, .css, .zip, .csv';
        this.experimental.dropzoneConfig$.next(dzConfig);
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
    });

    editor.on('change', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE value changed', event);
      this.editorContent = event.level.content; // editor.getContent()
      this.connector.data.update(this.editorContent);
    });
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwyg disconnectedCallback called');
    tinymce.remove(`.${this.containerClass}`);
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
