import { EavCustomInputFieldObservable } from '../../../shared/eav-custom-input-field';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';
import { Subscription } from 'rxjs';

class FieldStringWysiwygPreview extends EavCustomInputFieldObservable<string> {
  subscriptions: Subscription[] = [];

  constructor() {
    super();
    console.log('FieldStringWysiwygPreview constructor called');
  }

  connectedCallback() {
    console.log('FieldStringWysiwygPreview connectedCallback called');
    this.innerHTML = buildTemplate(template, styles);
    const previewContainer = this.querySelector('.preview-container');
    this.connector.data.value$.subscribe(value => {
      previewContainer.innerHTML = value
        .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag;
    });
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwygPreview disconnectedCallback called');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
  }
}

customElements.define('field-string-wysiwyg-preview', FieldStringWysiwygPreview);
