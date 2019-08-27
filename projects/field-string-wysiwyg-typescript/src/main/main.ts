import { EavExperimentalInputField } from '../shared/models';
import { buildTemplate, randomIntFromInterval } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.css';
import { Subscription } from 'rxjs';
declare const tinymce: any;

class FieldStringWysiwyg extends EavExperimentalInputField<string> {
  private instanceId = `${randomIntFromInterval(1, 1000000)}`;
  private tinymceContainerId = `tinymce-container-${this.instanceId}`;
  private tinymceToolbarContainerId = `tinymce-toolbar-container-${this.instanceId}`;
  private tinymceContainer: HTMLDivElement;
  private tinymceToolbarContainer: HTMLDivElement;
  private editor: any;
  private dialogIsOpen = false;
  private subscriptions: Subscription[] = [];

  private settings = {
    selector: `.${this.tinymceContainerId}`,
    fixed_toolbar_container: `.${this.tinymceToolbarContainerId}`,
    toolbar_drawer: 'floating',
    inline: true, // use the div, not an iframe
    setup: this.tinySetup.bind(this),
  };

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
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
    this.tinymceContainer = this.querySelector('.tinymce-container');
    this.tinymceToolbarContainer = this.querySelector('.tinymce-toolbar-container');
    this.tinymceContainer.classList.add(this.tinymceContainerId);
    this.tinymceToolbarContainer.classList.add(this.tinymceToolbarContainerId);
    tinymce.init({ ...this.settings });
  }

  private tinySetup(editor: any) {
    this.editor = editor;

    this.editor.on('init', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE initialized');
      if (!this.dialogIsOpen) { return; }
      try {
        editor.focus();
      } catch (error) {
        // console.error('error when focusing editor', error);
      }
    });

    this.editor.on('focus', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE focused');
    });

    this.editor.on('blur', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE blurred');
    });

    this.editor.on('change', (event: any) => {
      console.log('FieldStringWysiwyg TinyMCE value changed');
    });
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwyg disconnectedCallback called');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    tinymce.remove(`.${this.tinymceContainerId}`);
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
