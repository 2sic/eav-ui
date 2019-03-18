import { EavCustomInputField } from '../../shared/eav-custom-input-field';

// Create a class for the element
class FieldCustomGps extends EavCustomInputField {
  shadow: ShadowRoot;
  myInput: HTMLInputElement;
  myTestValue: string;

  constructor() {
    console.log('Petar order EavCustomInputField constructor');
    super();

    this.shadow = this.attachShadow({ mode: 'open' });
    this.myInput = document.createElement('input');
    this.shadow.appendChild(this.myInput);
    this.myTestValue = 'It works!!!';
  }

  connectedCallback() {
    console.log('Petar order EavCustomInputField connectedCallback');
    // @ts-ignore
    // this.host.setInitValues();
    // this.host.update(this.myInput.value);
    // this.connector.data.update('Hello world!');
    // @ts-ignore
    this.myInput.value = this.connector.data.field.value;

    // old way
    const _this = this;
    this.myInput.addEventListener('change', function () {
      _this.connector.data.update(_this.myInput.value);
    });

    // with functions
    function myChangeFunction(newValue: string) {
      console.log('Petar change called in child. myTestValue:', this.myTestValue, 'newValue:', newValue);
      this.myInput.value = newValue;
    }
    this.connector.onChange(myChangeFunction.bind(this));

    // with observable
    this.connector.data.myObservable.subscribe(newValue => {
      this.myInput.value = newValue;
    });
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
