import { FieldSettings } from 'projects/edit-types/src/FieldSettings';
import { CustomGps } from 'projects/edit-types/src/FieldSettings-CustomGps';
import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/controls/element-event-listener.model';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { classLog } from '../../../shared/logging';
import { buildTemplate, customGpsIcons, isLatLngObject, parseLatLng } from '../shared/gps-helpers';
import * as template from './preview.html';
import * as styles from './preview.scss';

const gpsTag = 'field-custom-gps';

class FieldCustomGps extends HTMLElement implements EavCustomInputField<string> {

  log = classLog({ FieldCustomGps });

  fieldInitialized: boolean;
  connector: Connector<string>;

  private latContainer: HTMLSpanElement;
  private lngContainer: HTMLSpanElement;
  private eventListeners: ElementEventListener[];

  constructor() {
    super();
    this.log.a(`${gpsTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized)
      return;

    const l = this.log.fn('connectedCallback', () => ({ fieldInitialized: this.fieldInitialized }));
    this.fieldInitialized = true;
    l.a(`${gpsTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default);
    const mapIconContainer = this.querySelector<HTMLDivElement>('#map-icon-container');
    mapIconContainer.innerHTML = customGpsIcons.mapMarker;
    this.latContainer = this.querySelector<HTMLSpanElement>('#lat-container');
    this.lngContainer = this.querySelector<HTMLSpanElement>('#lng-container');
    this.eventListeners = [];
    const expand = () => { this.expand(); };
    this.addEventListener('click', expand);
    this.eventListeners.push({ element: this, type: 'click', listener: expand });

    const defaultCoordinates = (this.connector.field.settings as FieldSettings & CustomGps)._defaults;
    
    l.a('default coordinates from settings', { defaultCoordinates });

    // set initial value
    this.#tryUpdateHtmlCoordinates(this.connector.data.value, defaultCoordinates);

    // update on value change
    this.connector.data.onValueChange(value => {
      this.#tryUpdateHtmlCoordinates(value, defaultCoordinates);
    });
  }

  #tryUpdateHtmlCoordinates(value: string, defaultCoordinates: google.maps.LatLngLiteral | null): void {
    if (value && isLatLngObject(value)) {
      const latLng = parseLatLng(value);  // (normalize with parseLatLng)
      this.updateHtml(latLng);
    } else {
      this.updateHtml(defaultCoordinates);
    }
  }

  private updateHtml(latLng: google.maps.LatLngLiteral | null): void {
    if (!latLng) {
      this.latContainer.innerText = '';
      this.lngContainer.innerText = '';
      return;
    }
    this.latContainer.innerText = latLng.lat?.toString() ?? '';
    this.lngContainer.innerText = latLng.lng?.toString() ?? '';
  }

  private expand(): void {
    this.connector.dialog.open();
  }

  disconnectedCallback(): void {
    this.log.a(`${gpsTag} disconnectedCallback called`);
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
  }
}

if (!customElements.get(gpsTag)) {
  customElements.define(gpsTag, FieldCustomGps);
}