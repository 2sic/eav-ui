(function () {

    class customTinyMceWysiwyg {

        constructor(name, host, options) {
            this.name = name;
            this.host = host;
            this.options = options;
        }

        initialize(host, options) {
            this.host = host;
            // this.options = somethingWithCallbacks.options;
            console.log('myComponent initialize', this.host);
            // this.host.update('update value');
        }

        render(container) {
            container.innerHTML = `<textarea id="mytextarea">Hello, World!</textarea>`;
            // container.innerHTML = `<div ui-tinymce="tinymceOptions"></div>`;


            tinymce.init({
                selector: '#mytextarea',
                baseURL: '//cdn.tinymce.com/4'
            });

            // container.getElementsByTagName('input').onchange(this.changeCheck);
            console.log('myComponent render', container);

            // var elements = container.getElementsByTagName('input');
            // console.log('elem', container.getElementsByTagName('input'));

            // var labelElements = container.getElementsByTagName('label');
            // console.log('elements value', elements[0].value);

            // elements[0].addEventListener('change', () => {
            //     this.changeCheck(event, elements[0].value);
            // })
        }

        changeCheck(event, value) {
            console.log('changeCheck event', event);
            console.log('changeCheck value', value);
            // do validity checks
            var ok = value.length > 3;
            if (ok) {
                this.host.update(value);
            }

        }

        externalChange(container, newValue) {
            var elements = container.getElementsByTagName('textarea');

            if (elements[0].value !== newValue)
                elements[0].value = newValue;
        }
    }

    function externalComponent2Factory(name) {
        console.log('customTinymce');
        return new customTinyMceWysiwyg(name, null, null);
    }

    window.addOn.register(externalComponent2Factory('tinymce-wysiwyg'));
})();