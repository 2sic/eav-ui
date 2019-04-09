import { EavCustomInputField } from '../../shared/eav-custom-input-field';
import { MyEventListenerModel } from './models';
import { } from 'google-maps';

// Create a class for the element
class FieldCustomGps extends EavCustomInputField<string> {
  template = `
  <div class="custom-gps-container">
    <div class="map-info">
      <label for="lat">Lat:</label>
      <input id="lat" type="number" />
      <span>, </span>
      <label for="lng">Lng:</label>
      <input id="lng" type="number" />
    </div>

    <div class="map-info">
      <a ng-click="showMap = !showMap" class="btn btn-default" ng-click="autoSelect">
        <span icon="map-marker">Icon-map-marker</span>
      </a>

      <!-- spm implement addressMask-->
      <a class="btn btn-default" ng-click="autoSelect()" ng-show="hasAddressMask">
        <span icon="search">Icon-search</span>
      </a>
      <span id="formatted-address"></span>
    </div>

    <div id="map"></div>

    <!--
        <div>
          <div ng-if=\"debug.on\">
            <h4>debug info</h4>
            <div>lat field name: '{{latField}}' lng field name: '{{longField}}'</div>
            <pre>{{value | json}}</pre>
          </div>
        -->
    </div>
  </div>
  `;

  css = `
  <style>
    .custom-gps-container {
      display: flex;
      flex-direction: column;
      height: 100%;
    }
    #map {
      flex: 1 1 auto;
      width: 100%;
    }
    .map-info {
      flex: 0 0 32px;
      display: flex;
      align-items: center;
    }
  </style>
  `;

  shadow: ShadowRoot;
  eventListeners: MyEventListenerModel[] = [];

  value: string;
  latField: HTMLInputElement;
  lngField: HTMLInputElement;
  formattedAddress: HTMLSpanElement;
  defaultCoordinates = { lat: 47.17465989999999, lng: 9.469142499999975 };
  mapContainer: HTMLDivElement;
  map: google.maps.Map;
  marker: google.maps.Marker;

  constructor() {
    super();
    console.log('Petar order EavCustomInputField constructor');
    this.shadow = this.attachShadow({ mode: 'open' });
    this.shadow.innerHTML = this.template;
    this.shadow.innerHTML += this.css;
  }

  connectedCallback() {
    console.log('Petar order EavCustomInputField connectedCallback');
    this.latField = <HTMLInputElement>this.shadow.querySelector('#lat');
    this.lngField = <HTMLInputElement>this.shadow.querySelector('#lng');
    this.formattedAddress = <HTMLSpanElement>this.shadow.querySelector('#formatted-address');
    this.mapContainer = <HTMLDivElement>this.shadow.querySelector('#map');

    // set value first time
    this.value = this.connector.data.value;
    // spm add logic to not load google maps script twice
    const script = document.createElement('script');
    script.src = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyDPhnNKpEg8FmY8nooE7Zwnue6SusxEnHE';
    script.onload = this.mapLoaded.bind(this);
    this.shadow.appendChild(script);

    // // add functions to be executed when value changes from the host
    // const onValueChangeBound = this.onValueChange.bind(this);
    // this.connector.data.onValueChange(onValueChangeBound);

    // // add event listener on our input
    // const updateValueBound = this.updateValue.bind(this);
    // this.myInput.addEventListener('change', updateValueBound);

    // const listener = { element: this.myInput, type: 'change', listener: updateValueBound };
    // this.eventListeners.push(listener);
  }

  // private onValueChange(newValue: string) {
  //   this.myInput.value = newValue;
  // }

  // private updateValue(event: Event) {
  //   const newValue = (<HTMLInputElement>event.target).value;
  //   this.connector.data.update(newValue);
  // }

  mapLoaded(): void {
    this.map = new google.maps.Map(this.mapContainer, { zoom: 15, center: this.defaultCoordinates });
    this.marker = new google.maps.Marker({ position: this.defaultCoordinates, map: this.map, draggable: true });

    const _this = this;
    this.marker.addListener('dragend', function (event: google.maps.MouseEvent) {
      _this.markerDragend(event);
    });

    if (this.value) {
      const position = this.readValue();
      this.updatePosition(position);
    }
  }

  markerDragend(event: google.maps.MouseEvent): void {
    const newPosition = { lat: event.latLng.lat(), lng: event.latLng.lng() };
    this.updatePosition(newPosition);
  }

  updatePosition(position: any): void {
    this.writeValue(position);
    this.map.setCenter(position);
    this.marker.setPosition(position);
  }

  readValue() {
    return JSON.parse(this.value.replace('latitude', 'lat').replace('longitude', 'lng'));
  }

  writeValue(newValue: any): void {
    this.latField.value = newValue.lat;
    this.lngField.value = newValue.lng;
    this.formattedAddress.innerText = newValue.lat + ',' + newValue.lng;
    this.value = JSON.stringify(newValue).replace('lat', 'latitude').replace('lng', 'longitude');
    this.connector.data.update(this.value);
  }

  disconnectedCallback() {
    this.eventListeners.forEach(eventListener => {
      const element = eventListener.element;
      const type = eventListener.type;
      const listener = eventListener.listener;
      element.removeEventListener(type, listener);
    });
    // spm clear all google maps event listeners
    google.maps.event.clearInstanceListeners(this.marker);
    google.maps.event.clearInstanceListeners(this.map);
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
