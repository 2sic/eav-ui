import { EavCustomInputField, EavCustomInputFieldObservable } from '../../shared/eav-custom-input-field';
import { MyEventListenerModel } from './models';

// Create a class for the element
class FieldCustomGps extends EavCustomInputFieldObservable<string> {
  shadow: ShadowRoot;
  myInputOldWay: HTMLInputElement;
  myOldWayListeners: MyEventListenerModel[];
  myInputWithObservable: HTMLInputElement;
  myInputWithFunctions: HTMLInputElement;

  constructor() {
    console.log('Petar order EavCustomInputField constructor');
    super();
    this.shadow = this.attachShadow({ mode: 'open' });

    this.myOldWayListeners = [];
    this.myInputOldWay = this.createInput('Old way:');

    this.myInputWithObservable = this.createInput('With observables:');

    this.myInputWithFunctions = this.createInput('With valueChangeListeners:');
  }

  createInput(labelText: string) {
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

    // old way
    this.myInputOldWay.value = this.connector.data.field.value;
    function oldWayUpdate() {
      this.connector.data.update(this.myInputOldWay.value);
    }
    const oldWayUpdateBound = oldWayUpdate.bind(this);
    this.myInputOldWay.addEventListener('change', oldWayUpdateBound);
    const oldWayListener: MyEventListenerModel = { element: this.myInputOldWay, type: 'change', listener: oldWayUpdateBound };
    this.myOldWayListeners.push(oldWayListener);

    // with observable
    // Host will complete observable in ngOnDestroy and there is no need to call unsubscribe()
    this.connector.data.value$.subscribe(newValue => {
      this.myInputWithObservable.value = newValue;
    });

    // with functions
    this.myInputWithFunctions.value = this.connector.data.field.value;
    function myOnChangeFunction(newValue: string) {
      this.myInputWithFunctions.value = newValue;
    }
    const myOnChangeFunctionBound = myOnChangeFunction.bind(this);
    this.connector.data.onValueChange(myOnChangeFunctionBound);
  }

  disconnectedCallback() {
    this.myOldWayListeners.forEach(oldWayListener => {
      const element = oldWayListener.element;
      const type = oldWayListener.type;
      const listener = oldWayListener.listener;
      element.removeEventListener(type, listener);
    });
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
