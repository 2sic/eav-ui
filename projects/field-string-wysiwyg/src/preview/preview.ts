import type { Subscription } from 'rxjs';
import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/models';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.scss';

export const wysiwygPreviewTag = 'field-string-wysiwyg-preview';

export class FieldStringWysiwygPreview extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;

  private subscriptions: Subscription[];
  private eventListeners: ElementEventListener[];

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygPreviewTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${wysiwygPreviewTag} connectedCallback called`);

    this.subscriptions = [];
    this.eventListeners = [];

    this.innerHTML = buildTemplate(template.default, styles.default);
    const previewContainer = this.querySelector<HTMLDivElement>('.wysiwyg-preview');

    const expand = () => { this.connector.dialog.open(); };
    previewContainer.addEventListener('click', expand);
    this.eventListeners.push({ element: previewContainer, type: 'click', listener: expand });

    this.subscriptions.push(
      this.connector.data.value$.subscribe(value => {
        previewContainer.innerHTML = !value ? '' : value
          .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
          .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
      }),
      this.connector.field$.subscribe(fieldConfig => {
        if (fieldConfig.settings.Disabled || fieldConfig.settings.ForcedDisabled) {
          previewContainer.classList.add('disabled');
        } else {
          previewContainer.classList.remove('disabled');
        }
      }),
    );
  }

  disconnectedCallback(): void {
    consoleLogWebpack(`${wysiwygPreviewTag} disconnectedCallback called`);
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
  }
}

if (!customElements.get(wysiwygPreviewTag)) {
  customElements.define(wysiwygPreviewTag, FieldStringWysiwygPreview);
}
