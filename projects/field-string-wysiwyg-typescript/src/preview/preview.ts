import { EavCustomInputField } from '../../../shared/eav-custom-input-field';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';

class FieldStringWysiwygPreview extends EavCustomInputField<string> {
  constructor() {
    super();
    console.log('FieldStringWysiwygPreview constructor called');
  }

  connectedCallback() {
    console.log('FieldStringWysiwygPreview connectedCallback called');
    this.innerHTML = buildTemplate(template, styles);
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwygPreview disconnectedCallback called');
  }
}

customElements.define('field-string-wysiwyg-preview', FieldStringWysiwygPreview);
