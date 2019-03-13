class SxcCustomElement extends HTMLElement {
  host: any;
}

// Create a class for the element
class FieldCustomGps extends SxcCustomElement {
  static get observedAttributes() {
    return ['language'];
  }

  myInput: HTMLInputElement;
  constructor() {
    super();

    const shadowRoot = this.attachShadow({ mode: 'open' });
    const myInput = document.createElement('input');
    myInput.value = 'Hello World';
    shadowRoot.appendChild(myInput);
    this.myInput = myInput;
  }

  connectedCallback() {
    this.host.setInitValues();
    console.log('Petar from web component, language:', this.getAttribute('language'));
    const _this = this;
    this.myInput.addEventListener('blur', function () {
      const customEvent = new CustomEvent('field-custom-gps', { bubbles: true, detail: { inputValue: _this.myInput.value } });
      _this.dispatchEvent(customEvent);
      _this.host.update(_this.myInput.value);
    });
  }

  attributeChangedCallback(name: string, oldValue: string, newValue: string) {
    if (name === 'language') {
      console.log('Petar from web component, language:', newValue);
    }
  }
}

// Define the new element
customElements.define('field-custom-gps', FieldCustomGps);
