import { EavExperimentalInputField, MyEventListenerModel } from './models';
import { buildTemplate } from './helpers';
import { } from 'google-maps';

// Create a class for the element
class FieldCustomGps extends EavExperimentalInputField<string> {
  defaultCoordinates: google.maps.LatLngLiteral;
  eventListeners: MyEventListenerModel[];
  fieldInitialized: boolean;
  formattedAddress: HTMLSpanElement;
  hostAddressMask: string;
  hostLatFieldName: string;
  hostLngFieldName: string;
  latField: HTMLInputElement;
  lngField: HTMLInputElement;
  map: google.maps.Map;
  mapApiKey: string;
  mapApiUrl: string;
  mapContainer: HTMLDivElement;
  marker: google.maps.Marker;

  constructor() {
    // Always call super first in constructor
    super();
    this.mapApiKey = 'AIzaSyDPhnNKpEg8FmY8nooE7Zwnue6SusxEnHE';
    this.mapApiUrl = `https://maps.googleapis.com/maps/api/js?key=${this.mapApiKey}`;
    this.defaultCoordinates = { lat: 47.17465989999999, lng: 9.469142499999975 };
    this.fieldInitialized = false;
    this.eventListeners = [];
  }

  connectedCallback() {
    // spm prevents connectedCallback from being called more than once. Don't know if it's necessary
    // https://html.spec.whatwg.org/multipage/custom-elements.html#custom-element-conformance
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;

    this.innerHTML = buildTemplate();
    this.latField = <HTMLInputElement>this.querySelector('#lat');
    this.lngField = <HTMLInputElement>this.querySelector('#lng');
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

  initConnectedFormFields() {
    this.hostLatFieldName = this.connector.field.settings.LatField;
    this.hostLngFieldName = this.connector.field.settings.LongField;
    // spm add addressMask initialization and resolver logic
    this.hostAddressMask = this.connector.field.settings.AddressMask || this.connector.field.settings['Address Mask'];
    console.log('FieldCustomGps connectedCallback settings', this.connector.field.settings);

    const allInputTypes = this.hiddenProps.allInputTypeNames.map(inputType => inputType.name);
    if (this.hostLatFieldName && allInputTypes.indexOf(this.hostLatFieldName) === -1) {
      this.hostLatFieldName = null;
    }
    if (this.hostLngFieldName && allInputTypes.indexOf(this.hostLngFieldName) === -1) {
      this.hostLngFieldName = null;
    }
  }

  mapLoaded(): void {
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: this.defaultCoordinates });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });

    if (this.connector.data.value) {
      const latLng: google.maps.LatLngLiteral = this.readValue();
      this.updatePosition(latLng);
      this.updateFields(latLng);
    }

    const _this = this;
    this.marker.addListener('dragend', function (event: google.maps.MouseEvent) {
      const newLatLng: google.maps.LatLngLiteral = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      _this.updatePosition(newLatLng);
      _this.updateFields(newLatLng);
      _this.saveValue(newLatLng);
    });

    this.initValueChangeListeners();
  }

  updatePosition(latLng: google.maps.LatLngLiteral): void {
    this.map.setCenter(latLng);
    this.marker.setPosition(latLng);
  }

  updateFields(latLng: google.maps.LatLngLiteral): void {
    this.latField.value = latLng.lat.toString();
    this.lngField.value = latLng.lng.toString();
    // spm update address mask with other fields from settings
    this.formattedAddress.innerText = latLng.lat + ',' + latLng.lng;
  }

  saveValue(newLatLng: google.maps.LatLngLiteral) {
    const newValue = JSON.stringify(newLatLng).replace('lat', 'latitude').replace('lng', 'longitude');
    this.connector.data.update(newValue);
    if (this.hostLatFieldName) {
      this.hiddenProps.updateField(this.hostLatFieldName, newLatLng.lat);
    }
    if (this.hostLngFieldName) {
      this.hiddenProps.updateField(this.hostLngFieldName, newLatLng.lng);
    }
  }

  readValue(): google.maps.LatLngLiteral {
    const latLng: google.maps.LatLngLiteral = JSON.parse(this.connector.data.value.replace('latitude', 'lat').replace('longitude', 'lng'));
    return latLng;
  }

  initValueChangeListeners(): void {
    this.connector.data.onValueChange(this.onControlChangedValue.bind(this));

    // spm subscribe to value changes in Longitude and Latitude fields in the form
    if (this.hostLatFieldName || this.hostLngFieldName) {
      this.hiddenProps.fieldStates$.subscribe(fieldStates => {
        console.log('FieldCustomGps init LongLat fields in form fieldStates', fieldStates);
        const value: google.maps.LatLngLiteral = this.readValue();
        let valueChanged = false;

        const hostLatField = fieldStates.filter(fieldState => fieldState.name === this.hostLatFieldName)[0];
        const hostLngField = fieldStates.filter(fieldState => fieldState.name === this.hostLngFieldName)[0];
        console.log('FieldCustomGps init LatLng fields in form hostLatField:', hostLatField, 'hostLngField:', hostLngField);

        if (hostLatField && hostLatField.value && hostLatField.value !== value.lat) {
          value.lat = hostLatField.value;
          valueChanged = true;
        }
        if (hostLngField && hostLngField.value && hostLngField.value !== value.lng) {
          value.lng = hostLngField.value;
          valueChanged = true;
        }

        if (valueChanged) {
          console.log('FieldCustomGps init LongLat fields in form value:', value);
          this.saveValue(value);
        }
      });
    }

    // spm add listeners to value changes in Longitute and Latitude fields in this template
    const onLatLngChangeBound = this.onLatLngChange.bind(this);
    this.latField.addEventListener('change', onLatLngChangeBound);
    this.lngField.addEventListener('change', onLatLngChangeBound);

    this.eventListeners.push({ element: this.latField, type: 'change', listener: onLatLngChangeBound });
    this.eventListeners.push({ element: this.lngField, type: 'change', listener: onLatLngChangeBound });
  }

  onLatLngChange() {
    const newLatLng: google.maps.LatLngLiteral = {
      lat: parseFloat(this.latField.value),
      lng: parseFloat(this.lngField.value),
    };
    this.saveValue(newLatLng);
  }

  onControlChangedValue(): void {
    const currentPosition = this.marker.getPosition();
    const newLatLng: google.maps.LatLngLiteral = this.readValue();

    // if value was updated from the outside it will be different from the current marker position
    const positionChanged = (currentPosition.lat() !== newLatLng.lat) || (currentPosition.lng() !== newLatLng.lng);
    console.log('Petar onControlChangedValue newLatLng', newLatLng, 'positionChanged:', positionChanged);
    if (!positionChanged) {
      return;
    }

    this.updatePosition(newLatLng);
    this.updateFields(newLatLng);
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
