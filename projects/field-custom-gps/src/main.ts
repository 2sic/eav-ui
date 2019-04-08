import { EavCustomInputField } from '../../shared/eav-custom-input-field';
import { MyEventListenerModel } from './models';

// Create a class for the element
class FieldCustomGps extends EavCustomInputField<string> {
  shadow: ShadowRoot;
  myInput: HTMLInputElement;
  eventListeners: MyEventListenerModel[] = [];

  constructor() {
    super();
    console.log('Petar order EavCustomInputField constructor');
    this.shadow = this.attachShadow({ mode: 'open' });

    this.myInput = this.createInput('Latitude and longitude:');
  }

  private createInput(labelText: string) {
    const container = document.createElement('div');
    const label = document.createElement('label');
    label.innerText = labelText;
    const input = document.createElement('input');
    container.appendChild(label);
    container.appendChild(input);
    this.shadow.appendChild(container);
    return input;
  }

  connectedCallback() {
    console.log('Petar order EavCustomInputField connectedCallback');

    // set value first time
    this.myInput.value = this.connector.data.value;

    // add functions to be executed when value changes from the host
    const onValueChangeBound = this.onValueChange.bind(this);
    this.connector.data.onValueChange(onValueChangeBound);

    // add event listener on our input
    const updateValueBound = this.updateValue.bind(this);
    this.myInput.addEventListener('change', updateValueBound);

    const listener = { element: this.myInput, type: 'change', listener: updateValueBound };
    this.eventListeners.push(listener);
  }

  private onValueChange(newValue: string) {
    this.myInput.value = newValue;
  }

  private updateValue(event: Event) {
    const newValue = (<HTMLInputElement>event.target).value;
    this.connector.data.update(newValue);
  }

  disconnectedCallback() {
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
