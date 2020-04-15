import { Subscription } from 'rxjs';
import { EavCustomInputFieldObservable, ConnectorObservable } from '../../../edit-types';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';

class FieldStringWysiwygPreview extends HTMLElement implements EavCustomInputFieldObservable<string> {
  connector: ConnectorObservable<string>;
  private subscriptions: Subscription[] = [];

  constructor() {
    super();
    console.log('FieldStringWysiwygPreview constructor called');
  }

  connectedCallback() {
    console.log('FieldStringWysiwygPreview connectedCallback called');
    this.innerHTML = buildTemplate(template.default, styles.default);
    const previewContainer = this.querySelector('.wysiwyg-preview');
    this.connector.data.value$.subscribe(value => {
      previewContainer.innerHTML = !value ? '' : value
        .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
        .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
    });
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwygPreview disconnectedCallback called');
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
    this.subscriptions = null;
  }
}

customElements.define('field-string-wysiwyg-preview', FieldStringWysiwygPreview);
