import { Subscription } from 'rxjs';
import { EavExperimentalInputField } from '../shared/models';
import { buildTemplate, randomIntFromInterval } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.css';
import { getTinyOptions } from './tinymce-options';
import { addTinyMceToolbarButtons } from './tinymce-toolbar';
declare const tinymce: any;

class FieldStringWysiwyg extends EavExperimentalInputField<string> {
  private containerClass: string;
  private toolbarContainerClass: string;
  private editor: any;
  private dialogIsOpen = false;
  private subscriptions: Subscription[] = [];

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
    const instanceId = `${randomIntFromInterval(1, 1000000)}`;
    this.containerClass = `tinymce-container-${instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${instanceId}`;
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.subscriptions.push(
      (this.connector.field as any).expanded.subscribe((expanded: boolean) => {
        this.dialogIsOpen = expanded;
        if (expanded && this.editor) {
          const editor = this.editor;
          setTimeout(() => {
            try {
              editor.focus();
            } catch (error) {
              // console.error('error when focusing editor', error);
            }
          }, 100);
        }
      }),
    );
    this.innerHTML = buildTemplate(template, styles);
    this.querySelector('.tinymce-container').classList.add(this.containerClass);
    this.querySelector('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);

    const tinyOptions = getTinyOptions({
      containerClass: this.containerClass,
      fixedToolbarClass: this.toolbarContainerClass,
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
    this.editor = editor;

    editor.on('init', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized');
      const imgSizes = [100, 75, 70, 66, 60, 50, 40, 33, 30, 25, 10];
      addTinyMceToolbarButtons(this, editor, imgSizes);
      editor.setContent(this.connector.data.value);
      if (this.dialogIsOpen) {
        try {
          editor.focus();
        } catch (error) {
          // console.error('error when focusing editor', error);
        }
      }
    });

    editor.on('focus', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE focused');
    });

    editor.on('blur', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE blurred');
    });

    editor.on('change', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE value changed');
    });
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwyg disconnectedCallback called');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    tinymce.remove(`.${this.containerClass}`);
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
