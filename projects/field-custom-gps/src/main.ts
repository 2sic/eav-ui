import { EavCustomInputField } from '../../shared/eav-custom-input-field';
import { MyEventListenerModel } from './models';
import { buildTemplate } from './helpers';
import { } from 'google-maps';

// Create a class for the element
class FieldCustomGps extends EavCustomInputField<string> {
  shadow: ShadowRoot;
  eventListeners: MyEventListenerModel[] = [];

  latField: HTMLInputElement;
  lngField: HTMLInputElement;
  formattedAddress: HTMLSpanElement;
  mapsApiKey = 'AIzaSyDPhnNKpEg8FmY8nooE7Zwnue6SusxEnHE';
  defaultCoordinates: google.maps.LatLngLiteral = { lat: 47.17465989999999, lng: 9.469142499999975 };
  mapContainer: HTMLDivElement;
  map: google.maps.Map;
  marker: google.maps.Marker;

  constructor() {
    super();
    console.log('Petar order EavCustomInputField constructor');
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = buildTemplate();
  }

  connectedCallback() {
    console.log('Petar order EavCustomInputField connectedCallback');
    this.latField = <HTMLInputElement>this.shadow.querySelector('#lat');
    this.lngField = <HTMLInputElement>this.shadow.querySelector('#lng');
    this.formattedAddress = <HTMLSpanElement>this.shadow.querySelector('#formatted-address');
    this.mapContainer = <HTMLDivElement>this.shadow.querySelector('#map');

    // spm add logic to not load google maps script twice
    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${this.mapsApiKey}`;
    script.onload = this.mapLoaded.bind(this);
    this.shadow.appendChild(script);
  }

  mapLoaded(): void {
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: this.defaultCoordinates });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });

    const _this = this;
    this.marker.addListener('dragend', function (event: google.maps.MouseEvent) {
      const newLatLng: google.maps.LatLngLiteral = { lat: event.latLng.lat(), lng: event.latLng.lng() };
      _this.updatePosition(newLatLng);
      _this.updateFields(newLatLng);
      _this.saveValue(newLatLng);
    });

    this.connector.data.onValueChange(this.onControlChangedValue.bind(this));
    // spm add listener to value changes in Longitute and Latitude fields in the form
    // spm add listeners to value changes in Longitute and Latitude fields in this component

    if (this.connector.data.value) {
      const latLng: google.maps.LatLngLiteral = this.readValue();
      this.updatePosition(latLng);
      this.updateFields(latLng);
    }
  }

  updatePosition(latLng: google.maps.LatLngLiteral): void {
    this.map.setCenter(latLng);
    this.marker.setPosition(latLng);
  }

  updateFields(latLng: google.maps.LatLngLiteral): void {
    this.latField.value = latLng.lat.toString();
    this.lngField.value = latLng.lng.toString();
    this.formattedAddress.innerText = latLng.lat + ',' + latLng.lng;
  }

  saveValue(newLatLng: google.maps.LatLngLiteral) {
    const newValue = JSON.stringify(newLatLng).replace('lat', 'latitude').replace('lng', 'longitude');
    this.connector.data.update(newValue);
  }

  readValue(): google.maps.LatLngLiteral {
    const latLng: google.maps.LatLngLiteral = JSON.parse(this.connector.data.value.replace('latitude', 'lat').replace('longitude', 'lng'));
    return latLng;
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
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
