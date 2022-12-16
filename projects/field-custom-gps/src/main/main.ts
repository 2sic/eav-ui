import { FieldMask } from '../../../eav-ui/src/app/edit/shared/helpers/field-mask.helper';
import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/models';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { consoleLogWebpack } from '../shared/console-log-webpack.helper';
import { buildTemplate, parseLatLng, stringifyLatLng } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.scss';

const gpsDialogTag = 'field-custom-gps-dialog';

class FieldCustomGpsDialog extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;

  private addressMask: FieldMask;
  private geocoder: google.maps.Geocoder;
  private iconSearch: HTMLAnchorElement;
  private latFieldName: string;
  private latInput: HTMLInputElement;
  private lngFieldName: string;
  private lngInput: HTMLInputElement;
  private map: google.maps.Map;
  private mapContainer: HTMLDivElement;
  private marker: google.maps.Marker;
  private eventListeners: ElementEventListener[];
  private defaultCoordinates: google.maps.LatLngLiteral;

  constructor() {
    super();
    consoleLogWebpack(`${gpsDialogTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${gpsDialogTag} connectedCallback called`);

    this.eventListeners = [];

    this.innerHTML = buildTemplate(template.default, styles.default);
    this.latInput = this.querySelector<HTMLInputElement>('#lat');
    this.lngInput = this.querySelector<HTMLInputElement>('#lng');
    const addressMaskContainer = this.querySelector<HTMLDivElement>('#address-mask-container');
    this.iconSearch = this.querySelector<HTMLAnchorElement>('#icon-search');
    const formattedAddressContainer = this.querySelector<HTMLSpanElement>('#formatted-address-container');
    this.mapContainer = this.querySelector<HTMLDivElement>('#map');

    const allInputNames = this.connector._experimental.allInputTypeNames.map(inputType => inputType.name);
    if (allInputNames.includes(this.connector.field.settings.LatField)) {
      this.latFieldName = this.connector.field.settings.LatField;
    }
    if (allInputNames.includes(this.connector.field.settings.LongField)) {
      this.lngFieldName = this.connector.field.settings.LongField;
    }

    const addressMaskSetting = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    this.addressMask = new FieldMask(addressMaskSetting, this.connector._experimental.formGroup.controls, null, null);
    consoleLogWebpack(`${gpsDialogTag} addressMask:`, addressMaskSetting);
    if (addressMaskSetting) {
      addressMaskContainer.classList.remove('hidden');
      formattedAddressContainer.innerText = this.addressMask.resolve();
    }

    const defaultCoordinates = this.connector._experimental.getGpsDefaultCoordinates();
    this.defaultCoordinates = {
      lat: defaultCoordinates.GpsLat,
      lng: defaultCoordinates.GpsLng,
    }

    this.connector.loadScript('google', `https://maps.googleapis.com/maps/api/js?key=${this.connector._experimental.getApiKeys().find(x => x.NameId == "google-maps").ApiKey}`, () => { this.mapScriptLoaded(); });
  }

  private mapScriptLoaded(): void {
    consoleLogWebpack(`${gpsDialogTag} mapScriptLoaded called`);
    this.map = new google.maps.Map(this.mapContainer, {
      zoom: 15,
      center: this.defaultCoordinates,
      gestureHandling: 'greedy',
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });
    this.geocoder = new google.maps.Geocoder();

    // set initial values
    if (!this.connector.data.value) {
      this.updateHtml(this.defaultCoordinates);
    } else {
      this.updateHtml(parseLatLng(this.connector.data.value));
    }

    // listen to inputs, iconSearch and marker. Update inputs, map, marker and form
    const onLatLngInputChange = () => { this.onLatLngInputChange(); };
    this.latInput.addEventListener('change', onLatLngInputChange);
    this.lngInput.addEventListener('change', onLatLngInputChange);

    const autoSelect = () => { this.autoSelect(); };
    this.iconSearch.addEventListener('click', autoSelect);

    this.eventListeners.push(
      { element: this.latInput, type: 'change', listener: onLatLngInputChange },
      { element: this.lngInput, type: 'change', listener: onLatLngInputChange },
      { element: this.iconSearch, type: 'click', listener: autoSelect },
    );

    this.marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      this.onMarkerDragend(event);
    });
  }

  private updateHtml(latLng: google.maps.LatLngLiteral): void {
    this.latInput.value = latLng.lat?.toString() ?? '';
    this.lngInput.value = latLng.lng?.toString() ?? '';
    this.map.setCenter(latLng);
    this.marker.setPosition(latLng);
  }

  private updateForm(latLng: google.maps.LatLngLiteral): void {
    this.connector.data.update(stringifyLatLng(latLng));
    if (this.latFieldName) {
      this.connector._experimental.updateField(this.latFieldName, latLng.lat);
    }
    if (this.lngFieldName) {
      this.connector._experimental.updateField(this.lngFieldName, latLng.lng);
    }
  }

  private onLatLngInputChange(): void {
    consoleLogWebpack(`${gpsDialogTag} input changed`);
    const latLng: google.maps.LatLngLiteral = {
      lat: this.latInput.value.length > 0 ? parseFloat(this.latInput.value) : null,
      lng: this.lngInput.value.length > 0 ? parseFloat(this.lngInput.value) : null,
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  private autoSelect(): void {
    consoleLogWebpack(`${gpsDialogTag} geocoder called`);
    const address = this.addressMask.resolve();
    this.geocoder.geocode({
      address,
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const result = results[0].geometry.location;
        const latLng: google.maps.LatLngLiteral = {
          lat: result.lat(),
          lng: result.lng(),
        };
        this.updateHtml(latLng);
        this.updateForm(latLng);
      } else {
        alert(`Could not locate address: ${address}`);
      }
    });
  }

  private onMarkerDragend(event: google.maps.MapMouseEvent): void {
    consoleLogWebpack(`${gpsDialogTag} marker changed`);
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  disconnectedCallback(): void {
    consoleLogWebpack(`${gpsDialogTag} disconnectedCallback called`);
    google?.maps.event.clearInstanceListeners(this.marker);
    google?.maps.event.clearInstanceListeners(this.map);

    this.eventListeners.forEach(({ element, type, listener }) => {
      element.removeEventListener(type, listener);
    });
    this.addressMask.destroy();
  }
}

if (!customElements.get(gpsDialogTag)) {
  customElements.define(gpsDialogTag, FieldCustomGpsDialog);
}
