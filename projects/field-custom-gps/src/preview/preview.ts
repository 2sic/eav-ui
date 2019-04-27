import { EavCustomInputField } from '../../../shared/eav-custom-input-field';
import { buildTemplate } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.css';
import { parseLatLng } from '../main/main.helpers';

class FieldCustomGpsPreview extends EavCustomInputField<string> {
  latContainer: HTMLSpanElement;
  lngContainer: HTMLSpanElement;

  constructor() {
    super();
    console.log('FieldCustomGpsPreview constructor called');
  }

  connectedCallback() {
    console.log('FieldCustomGpsPreview connectedCallback called');
    this.innerHTML = buildTemplate(template, styles);
    this.latContainer = this.querySelector('#lat-container');
    this.lngContainer = this.querySelector('#lng-container');
    this.updateHtml(this.connector.data.value);

    this.connector.data.onValueChange(this.updateHtml.bind(this));
  }

  updateHtml(value: string) {
    const latLng = parseLatLng(value);
    this.latContainer.innerText = latLng.lat.toString();
    this.lngContainer.innerText = latLng.lng.toString();
  }

  disconnectedCallback() {
    console.log('FieldCustomGpsPreview disconnectedCallback called');
  }
}

customElements.define('field-custom-gps-preview', FieldCustomGpsPreview);
