(function () {

    class myCustomInputType {

        constructor(name, host, options) {
            this.name = name;
            this.host = host;
            this.options = options;
        }

        initialize(host, options) {
            this.host = host;
            // this.options = somethingWithCallbacks.options;
            console.log('myComponent initialize', this.host);
            this.host.update('update value');
        }

        render(container) {
            container.innerHTML = '<h1>stuff</h1><input id="myfield" type="text">';

            // container.getElementsByTagName('input').onchange(this.changeCheck);
            console.log('myComponent render', container);

            var elements = container.getElementsByTagName('input');
            console.log('elem', container.getElementsByTagName('input'));

            elements[0].addEventListener('change', () => {
                this.changeCheck(event, elements[0].value);
            })
        }

        changeCheck(event, value) {
            console.log('changeCheck event', event);
            console.log('changeCheck value', value);
            // do validity checks
            var ok = value.length > 7;
            if (ok)
                this.host.update(value);
        }

        externalChange(container, newValue) {
            var elements = container.getElementsByTagName('input');

            if (elements[0].value !== newValue)
                elements[0].value = newValue;
        }
    }

    function myComponentFactory(name) {
        console.log('myComponentFactory');
        return new myCustomInputType(name, null, null);
    }

    window.addOn.register(myComponentFactory('custom-type'));
})();