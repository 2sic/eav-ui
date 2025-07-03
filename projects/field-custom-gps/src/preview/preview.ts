import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/controls/element-event-listener.model';
import { classLog } from '../../../eav-ui/src/app/shared/logging';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { buildTemplate, customGpsIcons, getDefaultCoordinates, isLatLngObject } from '../shared/helpers';
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
  private defaultCoordinates: google.maps.LatLngLiteral;

  constructor() {
    super();
    this.log.a(`${gpsTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) return;
    this.fieldInitialized = true;
    this.log.a(`${gpsTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default);
    const mapIconContainer = this.querySelector<HTMLDivElement>('#map-icon-container');
    mapIconContainer.innerHTML = customGpsIcons.mapMarker;
    this.latContainer = this.querySelector<HTMLSpanElement>('#lat-container');
    this.lngContainer = this.querySelector<HTMLSpanElement>('#lng-container');
    this.eventListeners = [];
    const expand = () => { this.expand(); };
    this.addEventListener('click', expand);
    this.eventListeners.push({ element: this, type: 'click', listener: expand });

    this.defaultCoordinates = getDefaultCoordinates(this.connector);

    // set initial value
    if (this.connector.data.value && isLatLngObject(this.connector.data.value)) {
      this.updateHtml(JSON.parse(this.connector.data.value));
    } else {
      this.updateHtml(this.defaultCoordinates);
    }


    // update on value change
    this.connector.data.onValueChange(value => {
      if (value && isLatLngObject(value)) {
        this.updateHtml(JSON.parse(value));
      } else {
        this.updateHtml(this.defaultCoordinates);
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
    this.log.a(`${gpsTag} disconnectedCallback called`);
    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
  }
}

if (!customElements.get(gpsTag)) {
  customElements.define(gpsTag, FieldCustomGps);
}
