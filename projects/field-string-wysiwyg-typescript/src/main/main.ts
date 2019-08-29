import { Subscription } from 'rxjs';
import { EavExperimentalInputFieldObservable } from '../shared/models';
import { buildTemplate, randomIntFromInterval } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.css';
import { getTinyOptions } from './tinymce-options';
import { addTinyMceToolbarButtons } from './tinymce-toolbar';
import * as style from './oxide-skin-overrides.scss';
import * as contentStyle from './tinymce-content.css';
declare const tinymce: any;

class FieldStringWysiwyg extends EavExperimentalInputFieldObservable<string> {
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[] = [];
  private editorContent: string; // saves editor content to prevent slow update when first using editor

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
    const instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${instanceId}`;
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.innerHTML = buildTemplate(template, styles + style);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);

    const tinyOptions = getTinyOptions({
      containerClass: this.containerClass,
      fixedToolbarClass: this.toolbarContainerClass,
      contentStyle: contentStyle,
      setup: this.tinyMceSetup.bind(this),
      currentLang: 'en', // spm current language can change. Make a subject/subscriber logic. Add translations
      contentBlocksEnabled: false,
      pasteFormattedTextEnabled: false,
      pasteImageFromClipboardEnabled: false,
      imagesUploadUrl: '',
      uploadHeaders: {},
    });
    tinymce.init(tinyOptions);
  }

  private tinyMceSetup(editor: any) {
    editor.on('init', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized', event);
      addTinyMceToolbarButtons(this, editor);
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
    });

    editor.on('blur', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE blurred', event);
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
