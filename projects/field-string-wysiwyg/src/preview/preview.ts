import { Subscription } from 'rxjs';
import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/controls/element-event-listener.model';
import { classLog } from '../../../eav-ui/src/app/shared/logging';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { connectorToDisabled$, registerCustomElement } from '../editor/editor-helpers';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.scss';

export const wysiwygPreviewTag = 'field-string-wysiwyg-preview';

/**
 * Preview for the WYSIWYG field.
 * Will be registered as a custom element below.
 */
export class FieldStringWysiwygPreview extends HTMLElement implements EavCustomInputField<string> {

  log = classLog({FieldStringWysiwygPreview});

  fieldInitialized = false;
  connector: Connector<string>;

  private eventListeners: ElementEventListener[];
  private subscriptions = new Subscription();

  constructor() {
    super();
    this.log.a(`constructor`);
  }

  connectedCallback(): void {
    if (this.fieldInitialized) return;
    this.fieldInitialized = true;

    this.log.a(`connectedCallback`);

    this.eventListeners = [];

    this.innerHTML = buildTemplate(template.default, styles.default);
    const previewContainer = this.querySelector<HTMLDivElement>('.wysiwyg-preview');

    const expand = () => this.connector.dialog.open();

    previewContainer.addEventListener('click', expand);
    this.eventListeners.push({ element: previewContainer, type: 'click', listener: expand });

    this.subscriptions.add(
      this.connector.data.value$.subscribe(value => {
        previewContainer.innerHTML = !value
          ? ''
          : value
            .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
            .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
      })
    );
    this.subscriptions.add(
      connectorToDisabled$(this.connector).subscribe(isDisabled => {
        previewContainer.classList.toggle('disabled', isDisabled);
      }),
    );
  }

  disconnectedCallback(): void {
    this.log.a(`disconnectedCallback called`);
    this.eventListeners.forEach(({ element, type, listener }) => element.removeEventListener(type, listener));
    this.subscriptions.unsubscribe();
  }
}

registerCustomElement(wysiwygPreviewTag, FieldStringWysiwygPreview);
