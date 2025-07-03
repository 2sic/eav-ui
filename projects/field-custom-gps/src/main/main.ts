import { CustomGps } from 'projects/edit-types/src/FieldSettings-CustomGps';
import { ElementEventListener } from '../../../eav-ui/src/app/edit/shared/controls/element-event-listener.model';
import { EditApiKeyPaths } from '../../../eav-ui/src/app/shared/constants/eav.constants';
import { classLog } from '../../../eav-ui/src/app/shared/logging';
import { ApiKeySpecs } from '../../../eav-ui/src/app/shared/models/dialog-context.models';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { FieldSettings } from '../../../edit-types/src/FieldSettings';
import { IFieldMask } from '../../../edit-types/src/IFieldMask';
import { buildTemplate, customGpsIcons, getDefaultCoordinates, isLatLngObject } from '../shared/helpers';
import * as template from './main.html';
import * as styles from './main.scss';

const gpsDialogTag = 'field-custom-gps-dialog';

class FieldCustomGpsDialog extends HTMLElement implements EavCustomInputField<string> {

  log = classLog({ FieldCustomGpsDialog });

  fieldInitialized: boolean;
  connector: Connector<string>;

  private addressMask: IFieldMask;
  private geocoder: google.maps.Geocoder;
  private iconSearch: HTMLAnchorElement;
  private latFieldName: string;
  private latInput: HTMLInputElement;
  private lngFieldName: string;
  private lngInput: HTMLInputElement;
  private map: google.maps.Map;
  private mapContainer: HTMLDivElement;
  private marker: any;
  private eventListeners: ElementEventListener[];
  private defaultCoordinates: google.maps.LatLngLiteral;
  private iconPin: HTMLAnchorElement

  constructor() {
    super();
    this.log.a(`${gpsDialogTag} constructor called`);
    this.fieldInitialized = false;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) return;
    this.fieldInitialized = true;
    this.log.a(`${gpsDialogTag} connectedCallback called`);

    this.eventListeners = [];

    this.innerHTML = buildTemplate(template.default, styles.default);
    this.latInput = this.querySelector<HTMLInputElement>('#lat');
    this.lngInput = this.querySelector<HTMLInputElement>('#lng');
    this.iconSearch = this.querySelector<HTMLAnchorElement>('#icon-search');
    this.iconSearch.insertAdjacentHTML('afterbegin', customGpsIcons.search);
    this.iconPin = this.querySelector<HTMLAnchorElement>('#icon-pin');
    this.iconPin.insertAdjacentHTML('afterbegin', customGpsIcons.locationPin);
    const formattedAddressContainer = this.querySelector<HTMLInputElement>('#formatted-address-container');
    this.mapContainer = this.querySelector<HTMLDivElement>('#map');

    const expConnector = this.connector._experimental;
    const allInputNames = expConnector.allInputTypeNames.map(inputType => inputType.name);
    const settings = this.connector.field.settings as FieldSettings & CustomGps & { 'Address Mask': string };
    if (allInputNames.includes(settings.LatField)) {
      this.latFieldName = settings.LatField;
    }
    if (allInputNames.includes(settings.LongField)) {
      this.lngFieldName = settings.LongField;
    }

    const addressMaskSetting = settings.AddressMask || settings['Address Mask'];
    this.addressMask = expConnector.getFieldMask(addressMaskSetting, 'Gps');

    this.log.a(`${gpsDialogTag} addressMask:`, { addressMaskSetting });
    if (addressMaskSetting)
      formattedAddressContainer.value = this.addressMask.result();
    
    this.defaultCoordinates = getDefaultCoordinates(this.connector);

    const googleMapsParams = (expConnector.getSettings(EditApiKeyPaths.GoogleMaps) as ApiKeySpecs).ApiKey;
    this.connector.loadScript('google', `https://maps.googleapis.com/maps/api/js?key=${googleMapsParams}&callback=Function.prototype`, () => { this.mapScriptLoaded(); });
  }

  private async mapScriptLoaded(): Promise<void> {
    this.log.a(`${gpsDialogTag} mapScriptLoaded called`);

    //@ts-ignore
    const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
    //@ts-ignore
    const { AdvancedMarkerElement } = await google.maps.importLibrary("marker") as google.maps.MarkerLibrary;

    this.map = new Map(this.mapContainer, {
      zoom: 15,
      center: this.defaultCoordinates,
      gestureHandling: 'greedy',
      mapId: 'DEMO_MAP_ID',
      streetViewControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
      zoomControlOptions: {
        position: google.maps.ControlPosition.RIGHT_CENTER,
      },
    });

    this.marker = new AdvancedMarkerElement({
      map: this.map,
      position: this.defaultCoordinates,
      gmpDraggable: true,
    });

    this.geocoder = new google.maps.Geocoder();

    // set initial values
    if (!this.connector.data.value) {
      this.updateHtml(this.defaultCoordinates);
    } else {
      try {
        if (isLatLngObject(this.connector.data.value))
          this.updateHtml(JSON.parse(this.connector.data.value));
      } catch (e) {
        console.error('Invalid data.value:', this.connector.data.value);
        this.updateHtml(this.defaultCoordinates);
      }
    }

    // listen to inputs, iconSearch and marker. Update inputs, map, marker and form
    const onLatLngInputChange = () => { this.onLatLngInputChange(); };
    this.latInput.addEventListener('change', onLatLngInputChange);
    this.lngInput.addEventListener('change', onLatLngInputChange);

    const autoSelect = () => { this.autoSelect(); };

    this.iconSearch.addEventListener('click', autoSelect);
    this.iconPin.addEventListener('click', () => { this.setLocation() });

    this.eventListeners.push(
      { element: this.latInput, type: 'change', listener: onLatLngInputChange },
      { element: this.lngInput, type: 'change', listener: onLatLngInputChange },
      { element: this.iconSearch, type: 'click', listener: autoSelect },
    );

    this.marker.addListener('dragend', (event: google.maps.MapMouseEvent) => {
      this.onMarkerDragend(event);
    });
  }

  private setLocation(): void {
    if (navigator.geolocation) {
      const formattedAddressContainer = this.querySelector<HTMLInputElement>('#formatted-address-container');
      formattedAddressContainer.value = 'Locating...';
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const latLng: google.maps.LatLngLiteral = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          this.updateHtml(latLng);
          this.updateForm(latLng);

          // Use the Google Maps Geocoding API to get address
          this.geocoder.geocode({ location: latLng }, (results, status) => {
            if (status === google.maps.GeocoderStatus.OK && results[0]) {
              formattedAddressContainer.value = results[0].formatted_address;
            } else {
              formattedAddressContainer.value = 'Unable to retrieve address';
            }
          });
        },
        (error) => {
          console.error('Error getting location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  }

  private updateHtml(latLng: google.maps.LatLngLiteral): void {
    this.latInput.value = latLng.lat?.toString() ?? '';
    this.lngInput.value = latLng.lng?.toString() ?? '';
    this.map.setCenter(latLng);
    this.marker.position = latLng;
  }

  private updateForm(latLng: google.maps.LatLngLiteral): void {
    this.connector.data.update(JSON.stringify(latLng));
    if (this.latFieldName) {
      this.connector._experimental.updateField(this.latFieldName, latLng.lat);
    }
    if (this.lngFieldName) {
      this.connector._experimental.updateField(this.lngFieldName, latLng.lng);
    }
  }

  private onLatLngInputChange(): void {
    this.log.a(`${gpsDialogTag} input changed`);
    const latLng: google.maps.LatLngLiteral = {
      lat: this.latInput.value.length > 0 ? parseFloat(this.latInput.value) : null,
      lng: this.lngInput.value.length > 0 ? parseFloat(this.lngInput.value) : null,
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  private autoSelect(): void {
    this.log.a(`${gpsDialogTag} geocoder called`);

    const formattedAddressContainer = this.querySelector<HTMLInputElement>('#formatted-address-container');
    const address = formattedAddressContainer.value;

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
      } else if (!address) {
        alert(`Please enter an address to search for.`);
      } else {
        alert(`Could not locate address: ${address}`);
      }
    });
  }

  private onMarkerDragend(event: google.maps.MapMouseEvent): void {
    this.log.a(`${gpsDialogTag} marker changed`);
    const latLng: google.maps.LatLngLiteral = {
      lat: event.latLng.lat(),
      lng: event.latLng.lng(),
    };
    this.updateHtml(latLng);
    this.updateForm(latLng);
  }

  disconnectedCallback(): void {
    this.log.a(`${gpsDialogTag} disconnectedCallback called`);
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
