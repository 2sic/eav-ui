import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/models';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { consoleLogWebpack } from '../shared/console-log-webpack.helper';
import { buildTemplate, customGpsIcons, parseLatLng } from '../shared/helpers';
import * as template from './preview.html';
import * as styles from './preview.scss';

const gpsTag = 'field-custom-gps';

class FieldCustomGps extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;

  private latContainer: HTMLSpanElement;
  private lngContainer: HTMLSpanElement;
  private eventListeners: ElementEventListener[];
  private defaultCoordinates: google.maps.LatLngLiteral;

  constructor() {
    super();
    consoleLogWebpack(`${gpsTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${gpsTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default);
    const mapIconContainer = this.querySelector<HTMLDivElement>('#map-icon-container');
    mapIconContainer.innerHTML = customGpsIcons.mapMarker;
    this.latContainer = this.querySelector<HTMLSpanElement>('#lat-container');
    this.lngContainer = this.querySelector<HTMLSpanElement>('#lng-container');
    this.eventListeners = [];
    const expand = () => { this.expand(); };
    this.addEventListener('click', expand);
    this.eventListeners.push({ element: this, type: 'click', listener: expand });

    const defaultCoordinates = this.connector._experimental.getSettings("gps-default-coordinates");
    this.defaultCoordinates = {
      lat: defaultCoordinates.GpsLat,
      lng: defaultCoordinates.GpsLng,
    }

    // set initial value
    if (!this.connector.data.value) {
      this.updateHtml(this.defaultCoordinates);
    } else {
      this.updateHtml(parseLatLng(this.connector.data.value));
    }

    // update on value change
    this.connector.data.onValueChange(value => {
      if (!value) {
        this.updateHtml(this.defaultCoordinates);
      } else {
        const latLng = parseLatLng(value);
        this.updateHtml(latLng);
      }
    });
  }

  private updateHtml(latLng: google.maps.LatLngLiteral): void {
    this.latContainer.innerText = latLng.lat?.toString() ?? '';
    this.lngContainer.innerText = latLng.lng?.toString() ?? '';
  }

  private expand(): void {
    this.connector.dialog.open();
  }

  disconnectedCallback(): void {
    consoleLogWebpack(`${gpsTag} disconnectedCallback called`);
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
  }
}

if (!customElements.get(gpsTag)) {
  customElements.define(gpsTag, FieldCustomGps);
}
