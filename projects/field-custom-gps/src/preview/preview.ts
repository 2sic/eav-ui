import { EavCustomInputField } from '../../../shared/eav-custom-input-field';
import { buildTemplate, parseLatLng } from '../shared/helpers';
import { defaultCoordinates } from '../shared/constants';
import * as template from './preview.html';
import * as styles from './preview.css';

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

    // set initial value
    if (!this.connector.data.value) {
      this.updateHtml(defaultCoordinates);
    } else {
      this.updateHtml(parseLatLng(this.connector.data.value));
    }

    // update on value change
    this.connector.data.onValueChange(value => {
      if (!value) {
        this.updateHtml(defaultCoordinates);
      } else {
        const latLng = parseLatLng(value);
        this.updateHtml(latLng);
      }
    });
  }

  updateHtml(latLng: google.maps.LatLngLiteral) {
    this.latContainer.innerText = latLng.lat ? latLng.lat.toString() : '';
    this.lngContainer.innerText = latLng.lng ? latLng.lng.toString() : '';
  }

  disconnectedCallback() {
    console.log('FieldCustomGpsPreview disconnectedCallback called');
  }
}

customElements.define('field-custom-gps-preview', FieldCustomGpsPreview);
