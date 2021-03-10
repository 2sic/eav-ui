import { Subscription } from 'rxjs';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { ElementEventListener } from '../../../edit/shared/models';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';
import { buildTemplate } from '../shared/helpers';
import * as styles from './preview.css';
import * as template from './preview.html';

export const wysiwygPreviewTag = 'field-string-wysiwyg-preview';

export class FieldStringWysiwygPreview extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  private subscription = new Subscription();
  private eventListeners: ElementEventListener[] = [];

  constructor() {
    super();
    webpackConsoleLog(`${wysiwygPreviewTag} constructor called`);
  }

  connectedCallback() {
    webpackConsoleLog(`${wysiwygPreviewTag} connectedCallback called`);
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
    webpackConsoleLog(`${wysiwygPreviewTag} disconnectedCallback called`);
    this.eventListeners.forEach(listener => {
      listener.element.removeEventListener(listener.type, listener.listener);
    });
    this.eventListeners = null;
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}

// only register the tag, if it has not been registered before
if (!customElements.get(wysiwygPreviewTag)) {
  customElements.define(wysiwygPreviewTag, FieldStringWysiwygPreview);
}
