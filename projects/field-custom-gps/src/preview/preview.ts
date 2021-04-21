import { Connector, EavCustomInputField } from '../../../edit-types';
import { ElementEventListener } from '../../../edit/shared/models';
import { consoleLogWebpack } from '../shared/console-log-webpack.helper';
import { defaultCoordinates } from '../shared/constants';
import { buildTemplate, customGpsIcons, parseLatLng } from '../shared/helpers';
import * as styles from './preview.css';
import * as template from './preview.html';

const gpsTag = 'field-custom-gps';

class FieldCustomGps extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;
  latContainer: HTMLSpanElement;
  lngContainer: HTMLSpanElement;

  private eventListeners: ElementEventListener[];

  constructor() {
    super();
    consoleLogWebpack(`${gpsTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback() {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${gpsTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default);
    const mapIconContainer = this.querySelector('#map-icon-container');
    mapIconContainer.innerHTML = customGpsIcons.mapMarker;
    this.latContainer = this.querySelector('#lat-container');
    this.lngContainer = this.querySelector('#lng-container');
    this.eventListeners = [];
    const expandBound = this.expand.bind(this);
    this.addEventListener('click', expandBound);
    this.eventListeners.push({ element: this, type: 'click', listener: expandBound });

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

  private updateHtml(latLng: google.maps.LatLngLiteral) {
    this.latContainer.innerText = latLng.lat ? latLng.lat.toString() : '';
    this.lngContainer.innerText = latLng.lng ? latLng.lng.toString() : '';
  }

  private expand() {
    this.connector.dialog.open();
  }

  disconnectedCallback() {
    consoleLogWebpack(`${gpsTag} disconnectedCallback called`);
    this.eventListeners.forEach(evListener => {
      evListener.element.removeEventListener(evListener.type, evListener.listener);
    });
    this.eventListeners = null;
  }
}

if (!customElements.get(gpsTag)) {
  customElements.define(gpsTag, FieldCustomGps);
}
