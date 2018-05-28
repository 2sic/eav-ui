import tinymceWysiwygConfig from './tinymce-wysiwyg-config.js'
import { addTinyMceToolbarButtons } from './tinymce-wysiwyg-toolbar.js'

(function () {

    class externalTinymceWysiwyg {

        constructor(name, host, config) {
            this.name = name;
            this.host = host;
            this.config = config;
        }

        initialize(host, options) {
            this.host = host;
            // this.options = somethingWithCallbacks.options;
            console.log('myComponent initialize', this.host);
            // this.host.update('update value');
        }

        render(container) {
            container.innerHTML = `<div class="wrap-float-label">
            <div id="mytextarea" class="field-string-wysiwyg-mce-box wrap-float-label">Hello, World!</div>
            </div>`;
            // container.innerHTML = `<div ui-tinymce="tinymceOptions"></div>`;

            var settings = {
                enableContentBlocks: false
            };

            //TODO: add languages
            // angular.extend($scope.tinymceOptions, {
            //     language: lang2,
            //     language_url: "../i18n/lib/tinymce/" + lang2 + ".js"
            // });

            var selectorOptions = {
                selector: '#mytextarea',
                //init_instance_callback: this.tinyMceInitCallback
                setup: this.tinyMceInitCallback,// important use .bind(this) if not arrow
                // init_instance_callback: (editor) => {
                //     console.log("Editor: " + editor.id + " is now initialized.");
                //     console.log("Editor config: ", this.host);
                //     editor.on('change', function (e) {
                //         console.log('Editor was change', editor.getContent());
                //         //  this.changeCheck(e, editor.getContent())
                //     });
                // }
            };

            var options = Object.assign(selectorOptions, this.config.getDefaultOptions(settings));
            console.log('oprions: ', options);

            tinymce.init(options);

            // container.getElementsByTagName('input').onchange(this.changeCheck);
            console.log('myComponent render', container);

            var elements = container.getElementsByTagName('input');
            // console.log('elem', container.getElementsByTagName('input'));

            var divElements = container.getElementsByTagName('div');
            console.log('elements value', divElements[1].innerHTML);
            // console.log('elements value', elements[0]);
            console.log('input', divElements[1].innerHTML);
            // elements[0].addEventListener('change', () => {
            //     console.log('input clcik');
            //     // this.changeCheck(event, divElements[1].innerHTML);
            // })

            // divElements[1].addEventListener('change', () => {
            //     console.log('divElements clcik');
            //     this.changeCheck(event, divElements[1].innerHTML);
            // })
        }

        tinyMceInitCallback = (editor) => {
            console.log("Editor1: " + editor.id + " is now initialized.");

            var imgSizes = this.config.svc().imgSizes;
            console.log("Editor1: ", this.config.svc().imgSizes);
            addTinyMceToolbarButtons(this.host, editor, imgSizes);

            editor.on('change', function (e) {
                console.log('Editor was change', editor.getContent());
                this.changeCheck(e, editor.getContent())
            });
            //TODO: this.host can call angular functions
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
        var config = new tinymceWysiwygConfig();
        console.log('customTinymce', config);
        return new externalTinymceWysiwyg(name, null, config);
    }

    window.addOn.register(externalComponent2Factory('tinymce-wysiwyg'));
})();