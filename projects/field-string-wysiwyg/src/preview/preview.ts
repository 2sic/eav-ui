import { Subscription } from 'rxjs';

import { EavCustomInputField, Connector } from '../../../edit-types';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';
import { ElementEventListener } from '../../../shared/element-event-listener-model';
import { FieldStringWysiwygDialog } from '../main/main';

class FieldStringWysiwyg extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  private subscription = new Subscription();
  private eventListeners: ElementEventListener[] = [];

  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    const inline = this.connector.field.settings.Dialog === 'inline';
    if (!inline) {
      this.runPreviewMode();
    } else {
      this.runInlineMode();
    }
  }

  private runPreviewMode() {
    this.innerHTML = buildTemplate(template.default, styles.default);
    const previewContainer: HTMLDivElement = this.querySelector('.wysiwyg-preview');
    if (this.connector.field.disabled) {
      previewContainer.classList.add('disabled');
    } else {
      const expand = () => { this.connector.expand(true); };
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

  private runInlineMode() {
    const dialogName = 'field-string-wysiwyg-dialog';
    const dialogEl = document.createElement(dialogName) as FieldStringWysiwygDialog;
    dialogEl.connector = this.connector;
    dialogEl.connector._experimental.inlineMode = true;
    this.appendChild(dialogEl);
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwyg disconnectedCallback called');
    this.eventListeners.forEach(listener => {
      listener.element.removeEventListener(listener.type, listener.listener);
    });
    this.eventListeners = null;
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);

// export class FieldStringWysiwygInline extends FieldStringWysiwyg {
//   inline = true;
// }

// customElements.define('field-string-wysiwyg-inline', FieldStringWysiwyg);
