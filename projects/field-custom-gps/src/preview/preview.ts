import { EavCustomInputField, Connector } from '../../../edit-types';
import { customGpsIcons, buildTemplate, parseLatLng } from '../shared/helpers';
import { defaultCoordinates } from '../shared/constants';
import * as template from './preview.html';
import * as styles from './preview.css';
import { ElementEventListener } from '../../../shared/element-event-listener.model';
import { webpackConsoleLog } from '../../../shared/webpack-console-log.helper';

class FieldCustomGps extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  latContainer: HTMLSpanElement;
  lngContainer: HTMLSpanElement;

  private eventListeners: ElementEventListener[];

  constructor() {
    super();
    webpackConsoleLog('FieldCustomGps constructor called');
  }

  connectedCallback() {
    webpackConsoleLog('FieldCustomGps connectedCallback called');
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
    webpackConsoleLog('FieldCustomGps disconnectedCallback called');
    this.eventListeners.forEach(evListener => {
      evListener.element.removeEventListener(evListener.type, evListener.listener);
    });
    this.eventListeners = null;
  }
}

customElements.define('field-custom-gps', FieldCustomGps);
