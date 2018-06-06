import tinymceWysiwygConfig from './tinymce-wysiwyg-config.js'
import { addTinyMceToolbarButtons } from './tinymce-wysiwyg-toolbar.js'

(function () {

    class externalTinymceWysiwyg {

        constructor(name, host, options, config) {
            this.name = name;
            this.host = host;
            this.options = options;
            this.config = config;
        }

        initialize(host, name) {
            // if (!this.host) {
            //     this.host = {};
            // }
            this.host = host;
            this.options = name;
            // this.options = somethingWithCallbacks.options;
            console.log('myComponent initialize', this.host);
            // this.host.update('update value');
        }

        render(container, name) {
            console.log('container.innerHTML name:', name);
            console.log('container.innerHTML name:', container);

            container.innerHTML = `<div class="wrap-float-label">
            <div id="mytextarea` + name + `" class="field-string-wysiwyg-mce-box wrap-float-label"></div>
            </div>`;

            var settings = {
                enableContentBlocks: false,
                auto_focus: false,
            };

            //TODO: add languages
            // angular.extend($scope.tinymceOptions, {
            //     language: lang2,
            //     language_url: "../i18n/lib/tinymce/" + lang2 + ".js"
            // });

            var selectorOptions = {
                selector: '#mytextarea' + name,
                //init_instance_callback: this.tinyMceInitCallback
                setup: this.tinyMceInitCallback.bind(this),
                // content_css: '/tinymce-wysiwyg.css',
            };

            var options = Object.assign(selectorOptions, this.config.getDefaultOptions(settings));
            console.log('options');
            console.table(options);

            tinymce.init(options);


            // var divElements = container.getElementsByTagName('div');
            // console.log('elements value', divElements[1].innerHTML);

            // elements[0].addEventListener('change', () => {
            //     console.log('input clcik');
            //     // this.changeCheck(event, divElements[1].innerHTML);
            // })

            // divElements[1].addEventListener('change', () => {
            //     console.log('divElements clcik');
            //     this.changeCheck(event, divElements[1].innerHTML);
            // })
        }

        /**
         * function call on change
         * @param {*} event 
         * @param {*} value 
         */
        changeCheck(event, value) {
            console.log('changeCheck event', event);
            console.log('changeCheck value', value);

            // do validity checks
            var isValid = this.validateValue(value);
            if (isValid) {
                this.host.update(value);
            }
        }

        /**
         * For validating value
         * @param {*} value 
         */
        validateValue(value) {
            // if (value.length < 3) {
            //     return false;
            // }
            //TODO: show validate message ???
            return true;
        }

        writeOptions(container, config, name, disabled) {
            console.log('set disable', disabled);
            console.log('set disable 1', tinymce.get('mytextarea' + name));
            console.log('set disable 2', tinymce.get('mytextarea' + name).mode);
            var isReadOnly = tinymce.get('mytextarea' + name).readonly;
            if (disabled && !isReadOnly) {
                tinymce.get('mytextarea' + name).setMode('readonly');
            }
            else if (!disabled && isReadOnly) {
                tinymce.get('mytextarea' + name).setMode('code');
                tinymce.get('mytextarea' + name).setMode('code');
            }
        }

        /**w
         * New value from the form into the view
         * This function can be triggered from outside when value changed
         * @param {} container 
         * @param {*} newValue 
         */
        writeValue(container, newValue, name) {
            // var elements = container.getElementsByTagName('div');
            // console.log('Exernal outside valu:', elements[1].innerHTML);
            // console.log('Exernal outside newvalue:', newValue);
            // if (elements[1].innerHTML !== newValue)
            //     elements[1].innerHTML = newValue;

            // TODO: write like this:
            tinymce.get('mytextarea' + name).setContent(newValue);
        }

        /**
         * on tinyMce setup we set toolbarButtons and change event listener
         * @param {*} editor 
         */
        tinyMceInitCallback(editor) {
            console.log("Editor1: " + editor.id + " is now initialized.");
            console.log("Editor host: ", this.host);
            var imgSizes = this.config.svc().imgSizes;
            addTinyMceToolbarButtons(this.host, editor, imgSizes);

            editor.on('change', e => {
                console.log('Editor was change', editor.getContent());
                this.changeCheck(e, editor.getContent())
            });
        }
    }

    function externalComponentFactory(name) {
        var config = new tinymceWysiwygConfig();
        console.log('customTinymce', config);
        return new externalTinymceWysiwyg(name, null, null, config);
    }

    window.addOn.register(externalComponentFactory('tinymce-wysiwyg'));
})();