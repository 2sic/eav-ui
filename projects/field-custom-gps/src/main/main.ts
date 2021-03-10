import { } from 'google-maps';
import { Subscription } from 'rxjs';
import { Connector, EavCustomInputField } from '../../../edit-types';
import { FieldMask } from '../../../edit/shared/helpers/field-mask.helper';
import { ElementEventListener } from '../../../edit/shared/models';
import { consoleLogWebpack } from '../../../ng-dialogs/src/app/shared/helpers/console-log-webpack.helper';
import { defaultCoordinates, mapsApiUrl } from '../shared/constants';
import { buildTemplate, parseLatLng, stringifyLatLng } from '../shared/helpers';
import * as styles from './main.css';
import * as template from './main.html';

class FieldCustomGpsDialog extends HTMLElement implements EavCustomInputField<string> {
  connector: Connector<string>;
  eventListeners: ElementEventListener[];
  fieldInitialized: boolean;
  addressMask: FieldMask;
  geocoder: google.maps.Geocoder;
  iconSearch: HTMLAnchorElement;
  latFieldName: string;
  latInput: HTMLInputElement;
  lngFieldName: string;
  lngInput: HTMLInputElement;
  map: google.maps.Map;
  mapApiUrl = mapsApiUrl();
  mapContainer: HTMLDivElement;
  marker: google.maps.Marker;
  private subscription: Subscription;

  constructor() {
    super();
    consoleLogWebpack('FieldCustomGpsDialog constructor called');
    this.fieldInitialized = false;
    this.eventListeners = [];
    this.subscription = new Subscription();
  }

  connectedCallback() {
    consoleLogWebpack('FieldCustomGpsDialog connectedCallback called');
    // spm prevents connectedCallback from being called more than once. Don't know if it's necessary
    // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;

    this.innerHTML = buildTemplate(template.default, styles.default);
    this.latInput = this.querySelector('#lat');
    this.lngInput = this.querySelector('#lng');
    const addressMaskContainer = this.querySelector('#address-mask-container') as HTMLDivElement;
    this.iconSearch = this.querySelector('#icon-search');
    const formattedAddressContainer = this.querySelector('#formatted-address-container') as HTMLSpanElement;
    this.mapContainer = this.querySelector('#map');

    const allInputNames = this.connector._experimental.allInputTypeNames.map(inputType => inputType.name);
    if (allInputNames.indexOf(this.connector.field.settings.LatField) !== -1) {
      this.latFieldName = this.connector.field.settings.LatField;
    }
    if (allInputNames.indexOf(this.connector.field.settings.LongField) !== -1) {
      this.lngFieldName = this.connector.field.settings.LongField;
    }

    const addressMaskSetting = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    this.addressMask = new FieldMask(addressMaskSetting, this.connector._experimental.formGroup.controls, null, null);
    consoleLogWebpack('FieldCustomGpsDialog addressMask:', addressMaskSetting);
    if (addressMaskSetting) {
      addressMaskContainer.classList.remove('hidden');
      formattedAddressContainer.innerText = this.addressMask.resolve();
    }

    this.connector.loadScript('google', this.mapApiUrl, () => { this.mapScriptLoaded(); });
  }

  private mapScriptLoaded() {
    consoleLogWebpack('FieldCustomGpsDialog mapScriptLoaded called');
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: defaultCoordinates, gestureHandling: 'greedy' });
    this.marker = new google.maps.Marker({ position: defaultCoordinates, map: this.map, draggable: true });
    this.geocoder = new google.maps.Geocoder();

    // set initial values
    if (!this.connector.data.value) {
      this.updateHtml(defaultCoordinates);
    } else {
      this.updateHtml(parseLatLng(this.connector.data.value));
    }

    // listen to inputs, iconSearch and marker. Update inputs, map, marker and form
    const onLatLngInputChangeBound = this.onLatLngInputChange.bind(this);
    this.latInput.addEventListener('change', onLatLngInputChangeBound);
    this.lngInput.addEventListener('change', onLatLngInputChangeBound);

    const autoSelectBound = this.autoSelect.bind(this);
    this.iconSearch.addEventListener('click', autoSelectBound);

    this.eventListeners.push(
      { element: this.latInput, type: 'change', listener: onLatLngInputChangeBound },
      { element: this.lngInput, type: 'change', listener: onLatLngInputChangeBound },
      { element: this.iconSearch, type: 'click', listener: autoSelectBound },
    );

    this.marker.addListener('dragend', this.onMarkerDragend.bind(this));
  }

  private updateHtml(latLng: google.maps.LatLngLiteral) {
    this.latInput.value = latLng.lat ? latLng.lat.toString() : '';
    this.lngInput.value = latLng.lng ? latLng.lng.toString() : '';
    this.map.setCenter(latLng);
    this.marker.setPosition(latLng);
  }

  private updateForm(latLng: google.maps.LatLngLiteral) {
    this.connector.data.update(stringifyLatLng(latLng));
    if (this.latFieldName) {
      this.connector._experimental.updateField(this.latFieldName, latLng.lat);
    }
    if (this.lngFieldName) {
      this.connector._experimental.updateField(this.lngFieldName, latLng.lng);
    }
  }

  private onLatLngInputChange() {
    consoleLogWebpack('FieldCustomGpsDialog input changed');
    const latLng: google.maps.LatLngLiteral = {
      lat: this.latInput.value.length > 0 ? parseFloat(this.latInput.value) : null,
      lng: this.lngInput.value.length > 0 ? parseFloat(this.lngInput.value) : null,
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  private autoSelect() {
    consoleLogWebpack('FieldCustomGpsDialog geocoder called');
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

  private onMarkerDragend(event: google.maps.MouseEvent) {
    consoleLogWebpack('FieldCustomGpsDialog marker changed');
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  disconnectedCallback() {
    consoleLogWebpack('FieldCustomGpsDialog disconnectedCallback called');
    if (!!(window as any).google) {
      google.maps.event.clearInstanceListeners(this.marker);
      google.maps.event.clearInstanceListeners(this.map);
    }

    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
    this.subscription.unsubscribe();
    this.subscription = null;
  }
}

customElements.define('field-custom-gps-dialog', FieldCustomGpsDialog);
