import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';

// Create a class for the element
class FieldCustomGpsPreview extends HTMLElement {

  constructor() {
    // Always call super first in constructor
    super();
    console.log('FieldCustomGpsPreview constructor called');
  }

  connectedCallback() {
    console.log('FieldCustomGpsPreview connectedCallback called');
    this.innerHTML = buildTemplate(template, styles);
    const valueContainer = <HTMLSpanElement>this.querySelector('#value-container');
    valueContainer.innerText = 'My data';
  }

  disconnectedCallback() {
    console.log('FieldCustomGpsPreview disconnectedCallback called');
  }
}

// Define the new element
customElements.define('field-custom-gps-preview', FieldCustomGpsPreview);
