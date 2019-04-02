import { EavCustomInputField, EavCustomInputFieldObservable } from '../../shared/eav-custom-input-field';
import { MyEventListenerModel } from './models';

// Create a class for the element
class FieldCustomGps extends EavCustomInputFieldObservable<string> {
  shadow: ShadowRoot;
  myInputWithObservable: HTMLInputElement;
  myInputWithFunctions: HTMLInputElement;
  eventListeners: MyEventListenerModel[] = [];

  constructor() {
    super();
    console.log('Petar order EavCustomInputField constructor');
    this.shadow = this.attachShadow({ mode: 'open' });

    this.myInputWithObservable = this.createInput('With observables:');
    this.myInputWithFunctions = this.createInput('With valueChangeListeners:');
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

    // with observable
    // Host will complete observable in ngOnDestroy and there is no need to call unsubscribe()
    this.connector.data.value$.subscribe(newValue => {
      this.myInputWithObservable.value = newValue;
    });

    const withObservableUpdateBound = this.updateValue.bind(this);
    this.myInputWithObservable.addEventListener('change', withObservableUpdateBound);
    const withObservableListener = { element: this.myInputWithObservable, type: 'change', listener: withObservableUpdateBound };
    this.eventListeners.push(withObservableListener);

    // with functions
    this.myInputWithFunctions.value = this.connector.data.value;
    function myOnChangeFunction(newValue: string) {
      this.myInputWithFunctions.value = newValue;
    }
    const myOnChangeFunctionBound = myOnChangeFunction.bind(this);
    this.connector.data.onValueChange(myOnChangeFunctionBound);

    const withFunctionsUpdateBound = this.updateValue.bind(this);
    this.myInputWithFunctions.addEventListener('change', withFunctionsUpdateBound);
    const withFunctionsListener = { element: this.myInputWithFunctions, type: 'change', listener: withFunctionsUpdateBound };
    this.eventListeners.push(withFunctionsListener);
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
