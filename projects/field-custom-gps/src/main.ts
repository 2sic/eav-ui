import { EavExperimentalInputField, MyEventListenerModel } from './models';
import { buildTemplate, parseLatLng, stringifyLatLng } from './helpers';
import { } from 'google-maps';

// Create a class for the element
class FieldCustomGps extends EavExperimentalInputField<string> {
  addressMask: string;
  defaultCoordinates: google.maps.LatLngLiteral;
  eventListeners: MyEventListenerModel[];
  fieldInitialized: boolean;
  formattedAddress: HTMLSpanElement;
  gpsFieldValue: string;
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
    this.formattedAddress = <HTMLSpanElement>this.querySelector('#formatted-address');
    this.mapContainer = <HTMLDivElement>this.querySelector('#map');
    this.initConnectedFormFields();

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

  private initConnectedFormFields() {
    const allInputNames = this.hiddenProps.allInputTypeNames.map(inputType => inputType.name);
    if (allInputNames.indexOf(this.connector.field.settings.LatField) !== -1) {
      this.latFieldName = this.connector.field.settings.LatField;
    }
    if (allInputNames.indexOf(this.connector.field.settings.LongField) !== -1) {
      this.lngFieldName = this.connector.field.settings.LongField;
    }

    // spm add addressMask initialization and resolver logic
    this.addressMask = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    console.log('FieldCustomGps connectedCallback settings', this.connector.field.settings);
  }

  private mapLoaded(): void {
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: this.defaultCoordinates });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });

    this.subscribeToFormChanges();

    const onLatLngInputChangeBound = this.onLatLngInputChange.bind(this);
    this.latInput.addEventListener('change', onLatLngInputChangeBound);
    this.lngInput.addEventListener('change', onLatLngInputChangeBound);
    this.eventListeners.push(
      { element: this.latInput, type: 'change', listener: onLatLngInputChangeBound },
      { element: this.lngInput, type: 'change', listener: onLatLngInputChangeBound },
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

  /**
   * On each change we save a local copy of the form fields to figure out which of the fields has been updated.
   * When GPS field is updated we have to update all values.
   * When Latitude or Longitude fields are updated we just have to update GPS field and the change will propagate to all values.
   */
  private subscribeToFormChanges() {
    this.hiddenProps.fieldStates$.subscribe(fieldStates => {
      const gpsFieldState = fieldStates.filter(fieldState => fieldState.name === this.connector.field.name)[0];
      const latFieldState = fieldStates.filter(fieldState => fieldState.name === this.latFieldName)[0];
      const lngFieldState = fieldStates.filter(fieldState => fieldState.name === this.lngFieldName)[0];

      if (gpsFieldState && gpsFieldState.value !== this.gpsFieldValue) {
        this.gpsFieldValue = gpsFieldState.value;
        console.log('FieldCustomGps mapLoaded GPS field changed');

        const value = parseLatLng(gpsFieldState.value);
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

        if (this.latFieldValue !== value.lat) {
          this.latFieldValue = value.lat;
          this.hiddenProps.updateField(this.latFieldName, value.lat);
        }
        if (this.lngFieldValue !== value.lng) {
          this.lngFieldValue = value.lng;
          this.hiddenProps.updateField(this.lngFieldName, value.lng);
        }
        return;
      }

      if (latFieldState && latFieldState.value !== this.latFieldValue) {
        this.latFieldValue = latFieldState.value;
        console.log('FieldCustomGps mapLoaded Latitude field changed');

        const latLng = parseLatLng(gpsFieldState.value);
        latLng.lat = latFieldState.value;
        this.connector.data.update(stringifyLatLng(latLng));
        return;
      }

      if (lngFieldState && lngFieldState.value !== this.lngFieldValue) {
        this.lngFieldValue = lngFieldState.value;
        console.log('FieldCustomGps mapLoaded Longitude field changed');

        const latLng = parseLatLng(gpsFieldState.value);
        latLng.lng = lngFieldState.value;
        this.connector.data.update(stringifyLatLng(latLng));
        return;
      }
    });
  }

  disconnectedCallback() {
    google.maps.event.clearInstanceListeners(this.marker);
    google.maps.event.clearInstanceListeners(this.map);

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
