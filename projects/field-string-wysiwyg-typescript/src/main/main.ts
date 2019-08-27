import { EavExperimentalInputField } from '../shared/models';
import { buildTemplate } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.css';

class FieldStringWysiwyg extends EavExperimentalInputField<string> {
  constructor() {
    super();
    console.log('FieldStringWysiwyg constructor called');
  }

  connectedCallback() {
    console.log('FieldStringWysiwyg connectedCallback called');
    this.innerHTML = buildTemplate(template, styles);
  }

  disconnectedCallback() {
    console.log('FieldStringWysiwyg disconnectedCallback called');
  }
}

customElements.define('field-string-wysiwyg', FieldStringWysiwyg);
