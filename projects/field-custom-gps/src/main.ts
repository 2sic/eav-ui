import { EavExperimentalInputField, MyEventListenerModel } from './models';
import { buildTemplate, parseLatLng, stringifyLatLng } from './helpers';
import { FieldMaskService } from '../../shared/field-mask.service';
import { } from 'google-maps';

// Create a class for the element
class FieldCustomGps extends EavExperimentalInputField<string> {
  addressMask: string;
  addressMaskContainer: HTMLDivElement;
  defaultCoordinates: google.maps.LatLngLiteral;
  eventListeners: MyEventListenerModel[];
  fieldInitialized: boolean;
  addressMaskService: FieldMaskService;
  formattedAddressContainer: HTMLSpanElement;
  geocoder: google.maps.Geocoder;
  gpsFieldValue: string;
  iconSearch: HTMLAnchorElement;
  latFieldName: string;
  latFieldValue: number;
  latInput: HTMLInputElement;
  lngFieldName: string;
  lngFieldValue: number;
  lngInput: HTMLInputElement;
  map: google.maps.Map;
  mapApiKey: string;
  mapApiUrl: string;
  mapContainer: HTMLDivElement;
  marker: google.maps.Marker;

  constructor() {
    // Always call super first in constructor
    super();
    console.log('FieldCustomGps constructor called');
    this.mapApiKey = 'AIzaSyDPhnNKpEg8FmY8nooE7Zwnue6SusxEnHE';
    this.mapApiUrl = `https://maps.googleapis.com/maps/api/js?key=${this.mapApiKey}`;
    this.defaultCoordinates = { lat: 47.17465989999999, lng: 9.469142499999975 };
    this.fieldInitialized = false;
    this.eventListeners = [];
  }

  connectedCallback() {
    console.log('FieldCustomGps connectedCallback called');
    // spm prevents connectedCallback from being called more than once. Don't know if it's necessary
    // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;

    this.innerHTML = buildTemplate();
    this.latInput = <HTMLInputElement>this.querySelector('#lat');
    this.lngInput = <HTMLInputElement>this.querySelector('#lng');
    this.addressMaskContainer = <HTMLDivElement>this.querySelector('#address-mask-container');
    this.iconSearch = <HTMLAnchorElement>this.querySelector('#icon-search');
    this.formattedAddressContainer = <HTMLSpanElement>this.querySelector('#formatted-address-container');
    this.mapContainer = <HTMLDivElement>this.querySelector('#map');

    const allInputNames = this.hiddenProps.allInputTypeNames.map(inputType => inputType.name);
    if (allInputNames.indexOf(this.connector.field.settings.LatField) !== -1) {
      this.latFieldName = this.connector.field.settings.LatField;
    }
    if (allInputNames.indexOf(this.connector.field.settings.LongField) !== -1) {
      this.lngFieldName = this.connector.field.settings.LongField;
    }

    this.addressMask = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    this.addressMaskService = new FieldMaskService(this.addressMask, null, this.hiddenProps.formGroup.controls);
    console.log('FieldCustomGps connectedCallback addressMask:', this.addressMask);
    if (this.addressMask) {
      this.addressMaskContainer.classList.remove('hidden');
      this.formattedAddressContainer.innerText = this.addressMaskService.resolve();
    }

    const mapScriptLoaded = !!(window as any).google;
    if (mapScriptLoaded) {
      this.mapLoaded();
    } else {
      const script = document.createElement('script');
      script.src = this.mapApiUrl;
      script.onload = this.mapLoaded.bind(this);
      this.appendChild(script);
    }
  }

  private mapLoaded(): void {
    console.log('FieldCustomGps mapLoaded called');
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: this.defaultCoordinates });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });
    this.geocoder = new google.maps.Geocoder();

    // first value read
    if (this.connector.data.value) {
      this.gpsFieldValue = this.connector.data.value;
      const value = parseLatLng(this.connector.data.value);
      if (this.latFieldName) {
        this.latFieldValue = value.lat;
      }
      if (this.lngFieldName) {
        this.lngFieldValue = value.lng;
      }
      this.latInput.value = value.lat.toString();
      this.lngInput.value = value.lng.toString();
      this.map.setCenter(value);
      this.marker.setPosition(value);
    }

    this.subscribeToFormChanges();

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

    const _this = this;
    this.marker.addListener('dragend', function (event: google.maps.MouseEvent) {
      console.log('FieldCustomGps mapLoaded marker changed');
      const latLng: google.maps.LatLngLiteral = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng(),
      };
      _this.connector.data.update(stringifyLatLng(latLng));
    });
  }

  private onLatLngInputChange() {
    console.log('FieldCustomGps mapLoaded input changed');
    const latLng: google.maps.LatLngLiteral = {
      lat: parseFloat(this.latInput.value),
      lng: parseFloat(this.lngInput.value),
    };
    this.connector.data.update(stringifyLatLng(latLng));
  }

  private autoSelect() {
    const address = this.addressMaskService.resolve();
    this.geocoder.geocode({
      address: address
    }, (results, status) => {
      if (status === google.maps.GeocoderStatus.OK) {
        const result = results[0].geometry.location;
        const latLng: google.maps.LatLngLiteral = {
          lat: result.lat(),
          lng: result.lng(),
        };
        this.connector.data.update(stringifyLatLng(latLng));
      } else {
        alert(`Could not locate address: ${address}`);
      }
    });
  }

  /**
   * On each change we save a local copy of the form fields to figure out which of the fields has been updated.
   * When GPS field is updated we have to update all values.
   * When Latitude or Longitude fields are updated we just have to update GPS field and the change will propagate to all values.
   */
  private subscribeToFormChanges() {
    console.log('FieldCustomGps subscribeToFormChanges called');

    this.hiddenProps.formSetValueChange$.subscribe(formSet => {
      this.formattedAddressContainer.innerText = this.addressMaskService.resolve();

      console.log('FieldCustomGps subscribeToFormChanges values subscription', formSet);
      const gpsFieldValue = formSet[this.connector.field.name];
      const latFieldValue = formSet[this.latFieldName];
      const lngFieldValue = formSet[this.lngFieldName];
      const shouldUpdateGpsField = !this.hiddenProps.formGroup.controls[this.connector.field.name].disabled;
      const shouldUpdateLatField = this.latFieldName && !this.hiddenProps.formGroup.controls[this.latFieldName].disabled;
      const shouldUpdateLngField = this.lngFieldName && !this.hiddenProps.formGroup.controls[this.lngFieldName].disabled;

      if (shouldUpdateGpsField && this.gpsFieldValue !== gpsFieldValue) {
        console.log('FieldCustomGps mapLoaded GPS field changed', 'old:', this.gpsFieldValue, 'new:', gpsFieldValue);
        this.gpsFieldValue = gpsFieldValue;

        const value = parseLatLng(gpsFieldValue);
        if (this.latInput.value !== value.lat.toString()) {
          this.latInput.value = value.lat.toString();
        }
        if (this.lngInput.value !== value.lng.toString()) {
          this.lngInput.value = value.lng.toString();
        }

        const mapCenter = this.map.getCenter();
        if (mapCenter.lat() !== value.lat || mapCenter.lng() !== value.lng) {
          this.map.setCenter(value);
        }

        const markerPosition = this.marker.getPosition();
        if (markerPosition.lat() !== value.lat || markerPosition.lng() !== value.lng) {
          this.marker.setPosition(value);
        }

        if (shouldUpdateLatField && this.latFieldValue !== value.lat) {
          this.latFieldValue = value.lat;
          if (latFieldValue !== value.lat) {
            this.hiddenProps.updateField(this.latFieldName, value.lat);
          }
        }

        if (shouldUpdateLngField && this.lngFieldValue !== value.lng) {
          this.lngFieldValue = value.lng;
          if (lngFieldValue !== value.lat) {
            this.hiddenProps.updateField(this.lngFieldName, value.lng);
          }
        }
        return;
      }

      if (shouldUpdateLatField && this.latFieldValue !== latFieldValue) {
        console.log('FieldCustomGps mapLoaded Latitude field changed', 'old:', this.latFieldValue, 'new', latFieldValue);
        this.latFieldValue = latFieldValue;

        if (shouldUpdateGpsField) {
          const latLng = parseLatLng(gpsFieldValue);
          latLng.lat = latFieldValue;
          this.connector.data.update(stringifyLatLng(latLng));
        }
        return;
      }

      if (shouldUpdateLngField && this.lngFieldValue !== lngFieldValue) {
        console.log('FieldCustomGps mapLoaded Longitude field changed', 'old:', this.lngFieldValue, 'new', lngFieldValue);
        this.lngFieldValue = lngFieldValue;

        if (shouldUpdateGpsField) {
          const latLng = parseLatLng(gpsFieldValue);
          latLng.lng = lngFieldValue;
          this.connector.data.update(stringifyLatLng(latLng));
        }
        return;
      }
    });
  }

  disconnectedCallback() {
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
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
