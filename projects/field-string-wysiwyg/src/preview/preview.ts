import { Subscription } from 'rxjs';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { ElementEventListener } from '../../../edit/shared/models';
import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { buildTemplate } from '../shared/helpers';
import * as styles from './preview.css';
import * as template from './preview.html';

export const wysiwygPreviewTag = 'field-string-wysiwyg-preview';

export class FieldStringWysiwygPreview extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;

  private subscription: Subscription;
  private eventListeners: ElementEventListener[];

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygPreviewTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback() {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${wysiwygPreviewTag} connectedCallback called`);

    this.subscription = new Subscription();
    this.eventListeners = [];

    this.innerHTML = buildTemplate(template.default, styles.default);
    const previewContainer: HTMLDivElement = this.querySelector('.wysiwyg-preview');
    if (this.connector.field.disabled) {
      previewContainer.classList.add('disabled');
    } else {
      const expand = () => { this.connector.dialog.open(); };
      previewContainer.addEventListener('click', expand);
      this.eventListeners.push({ element: previewContainer, type: 'click', listener: expand });
    }
    this.subscription.add(
      this.connector.data.value$.subscribe(value => {
        previewContainer.innerHTML = !value ? '' : value
          .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
          .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
      })
    );
  }

  disconnectedCallback() {
    consoleLogWebpack(`${wysiwygPreviewTag} disconnectedCallback called`);
    this.eventListeners.forEach(listener => {
      listener.element.removeEventListener(listener.type, listener.listener);
    });
    this.subscription.unsubscribe();
  }
}

if (!customElements.get(wysiwygPreviewTag)) {
  customElements.define(wysiwygPreviewTag, FieldStringWysiwygPreview);
}
