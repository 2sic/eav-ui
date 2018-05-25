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
            var dsf = {
                selector: '#mytextarea',
                // baseURL: 'http://cdn.tinymce.com/4.6/tinymce.min.js',
                //init_instance_callback: this.tinyMceInitCallback
                setup: this.tinyMceInitCallback
            };
            var options = Object.assign(dsf, this.getDefaultOptions(settings));
            console.log('oprions: ', options);

            tinymce.init(options);

            // tinymce.init({
            //     selector: '#mytextarea',
            //     // baseURL: 'http://cdn.tinymce.com/4.6/tinymce.min.js',
            //     //init_instance_callback: this.tinyMceInitCallback
            //     setup: this.tinyMceInitCallback
            // });


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

        tinyMceInitCallback(editor) {
            console.log("Editor: " + editor.id + " is now initialized.");
            var imgSizes = [100, 75, 70, 66, 60, 50, 40, 33, 30, 25, 10];
            addTinyMceToolbarButtons(this.host, editor, imgSizes);

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


        svc() {
            return {
                // cdn root
                cdnRoot: "//cdn.tinymce.com/4",
                // these are the sizes we can auto-resize to
                imgSizes: [100, 75, 70, 66, 60, 50, 40, 33, 30, 25, 10],

                // the default language, in which we have all labels/translations
                defaultLanguage: "en",

                // all other languages
                languages: "de,es,fr,it,uk,nl".split(","),

                // tinyMCE plugins we're using
                plugins: [
                    "code", // allow view / edit source
                    "contextmenu", // right-click menu for things like insert, etc.
                    "autolink", // automatically convert www.xxx links to real links
                    "tabfocus", // get in an out of the editor with tab
                    "image", // image button and image-settings
                    "link", // link button + ctrl+k to add link
                    // "autosave",     // temp-backups the content in case the browser crashes, allows restore
                    "paste", // enables paste as text from word etc. https://www.tinymce.com/docs/plugins/paste/
                    "anchor", // allows users to set an anchor inside the text
                    "charmap", // character map https://www.tinymce.com/docs/plugins/visualchars/
                    "hr", // hr
                    "media", // video embed
                    "nonbreaking", // add button to insert &nbsp; https://www.tinymce.com/docs/plugins/nonbreaking/
                    "searchreplace", // search/replace https://www.tinymce.com/docs/plugins/searchreplace/
                    "table", // https://www.tinymce.com/docs/plugins/searchreplace/
                    "lists", // should fix bug with fonts in list-items (https://github.com/tinymce/tinymce/issues/2330),
                    "textpattern" // enable typing like "1. text" to create lists etc.
                ],

                validateAlso: '@[class]' // allow classes on all elements, 
                    + ',i' // allow i elements (allows icon-font tags like <i class="fa fa-...">)
                    + ",hr[sxc|guid]" // experimental: allow inline content-blocks
            }
        };

        buildModes(settings) {
            // the WYSIWYG-modes we offer, standard with simple toolbar and advanced with much more
            return {
                standard: {
                    menubar: false,
                    toolbar: " undo redo removeformat "
                        + "| bold formatgroup "
                        + "| h1 h2 hgroup "
                        + "| listgroup "
                        + "| linkfiles linkgroup "
                        + "| " + (settings.enableContentBlocks ? " addcontentblock " : "") + "modeadvanced ",
                    contextmenu: "charmap hr" + (settings.enableContentBlocks ? " addcontentblock" : "")
                },
                advanced: {
                    menubar: true,
                    toolbar: " undo redo removeformat "
                        + "| styleselect "
                        + "| bold italic "
                        + "| h1 h2 hgroup "
                        + "| bullist numlist outdent indent "
                        + "| images linkfiles linkgrouppro "
                        + "| code modestandard ",
                    contextmenu: "link image | charmap hr adamimage"
                }
            };
            // return modes;
        }

        getDefaultOptions(settings) {
            var modes = this.buildModes(settings);
            var svc = this.svc();
            return {
                baseURL: svc.cdnRoot,
                inline: true, // use the div, not an iframe
                automatic_uploads: false, // we're using our own upload mechanism
                modes: modes, // for later switch to another mode
                menubar: modes.standard.menubar, // basic menu (none)
                toolbar: modes.standard.toolbar, // basic toolbar
                plugins: svc.plugins.join(" "),
                contextmenu: modes.standard.contextmenu, //"link image | charmap hr adamimage",
                autosave_ask_before_unload: false,
                paste_as_text: true,
                extended_valid_elements: this.svc.validateAlso,
                //'@[class]' // allow classes on all elements, 
                //+ ',i' // allow i elements (allows icon-font tags like <i class="fa fa-...">)
                //+ ",hr[sxc|guid]", // experimental: allow inline content-blocks
                custom_elements: "hr",

                // Url Rewriting in images and pages
                //convert_urls: false,  // don't use this, would keep the domain which is often a test-domain
                relative_urls: false, // keep urls with full path so starting with a "/" - otherwise it would rewrite them to a "../../.." syntax
                default_link_target: "_blank", // auto-use blank as default link-target
                object_resizing: false, // don't allow manual scaling of images

                // General looks
                skin: "lightgray",
                theme: "modern",
                // statusbar: true,    // doesn't work in inline :(

                language: svc.defaultLanguage,

                debounce: false // DONT slow-down model updates - otherwise we sometimes miss the last changes

                //paste_preprocess: function (plugin, args) {
                //    console.log(args.content);
                //    args.content += ' preprocess';
                //},

                //paste_postprocess: function (plugin, args) {
                //    console.log(args.node);
                //    args.node.setAttribute('id', '42');
                //}
            };
        };
    }

    function addTinyMceToolbarButtons(host, editor, imgSizes) {
        var editor = editor;
        //#region helpers like initOnPostRender(name)

        // helper function to add activate/deactivate to buttons like alignleft, alignright etc.
        function initOnPostRender(name) { // copied/modified from https://github.com/tinymce/tinymce/blob/ddfa0366fc700334f67b2c57f8c6e290abf0b222/js/tinymce/classes/ui/FormatControls.js#L232-L249
            return function () {
                var self = this; // keep ref to the current button?

                function watchChange() {
                    editor.formatter.formatChanged(name, function (state) {
                        self.active(state);
                    });
                }

                if (editor.formatter)
                    watchChange();
                else
                    editor.on("init", watchChange());
            };
        }

        //#endregion

        //#region register formats

        // the method that will register all formats - like img-sizes
        function registerTinyMceFormats(editor, host) {
            var imgformats = {};
            for (var is = 0; is < imgSizes.length; is++)
                imgformats["imgwidth" + imgSizes[is]] = [{ selector: "img", collapsed: false, styles: { 'width': imgSizes[is] + "%" } }];
            editor.formatter.register(imgformats);
        }

        // call register once the editor-object is ready
        editor.on('init', function () {
            registerTinyMceFormats(editor, host);
        });

        //#endregion

        //// group with adam-link, dnn-link
        //editor.addButton("linkfiles", {
        //    type: "splitbutton",
        //    icon: " eav-icon-file-pdf",
        //    title: "Link.AdamFile.Tooltip",
        //    onclick: function () {
        //        vm.toggleAdam(false);
        //    },
        //    menu: [
        //        {
        //            text: "Link.AdamFile",
        //            tooltip: "Link.AdamFile.Tooltip",
        //            icon: " eav-icon-file-pdf",
        //            onclick: function () {
        //                vm.toggleAdam(false);
        //            }
        //        }, {
        //            text: "Link.DnnFile",
        //            tooltip: "Link.DnnFile.Tooltip",
        //            icon: " eav-icon-file",
        //            onclick: function () {
        //                vm.openDnnDialog("documentmanager");
        //            }
        //        }
        //    ]
        //});

        //#region link group with web-link, page-link, unlink, anchor
        var linkgroup = {
            type: "splitbutton",
            icon: "link",
            title: "Link",
            onPostRender: initOnPostRender("link"),
            onclick: function () {
                editor.execCommand("mceLink");
            },

            menu: [
                { icon: "link", text: "Link", onclick: function () { editor.execCommand("mceLink"); } },
                {
                    text: "Link.Page",
                    tooltip: "Link.Page.Tooltip",
                    icon: " eav-icon-sitemap",
                    onclick: function () {
                        host.openDnnDialog("pagepicker");
                    }
                }
            ]
        };
        var linkgroupPro = { ...linkgroup };
        linkgroupPro.menu.push({ icon: " eav-icon-anchor", text: "Anchor", tooltip: "Link.Anchor.Tooltip", onclick: function () { editor.execCommand("mceAnchor"); } });
        editor.addButton("linkgroup", linkgroup);
        editor.addButton("linkgrouppro", linkgroupPro);
        //#endregion

        // group with images (adam) - only in PRO mode
        editor.addButton("images", {
            type: "splitbutton",
            text: "",
            icon: "image",
            onclick: function () {
                host.toggleAdam(true);
            },
            menu: [
                {
                    text: "Image.AdamImage",
                    tooltip: "Image.AdamImage.Tooltip",
                    icon: "image",
                    onclick: function () { host.toggleAdam(true); }
                }, {
                    text: "Image.DnnImage",
                    tooltip: "Image.DnnImage.Tooltip",
                    icon: "image",
                    onclick: function () { host.toggleAdam(true, true); }
                }, {
                    text: "Insert\/edit image", // i18n tinyMce standard
                    icon: "image",
                    onclick: function () { editor.execCommand("mceImage"); }

                },
                // note: all these use i18n from tinyMce standard
                { icon: "alignleft", tooltip: "Align left", onclick: function () { editor.execCommand("JustifyLeft"); } },
                { icon: "aligncenter", tooltip: "Align center", onclick: function () { editor.execCommand("JustifyCenter"); } },
                { icon: "alignright", tooltip: "Align right", onclick: function () { editor.execCommand("JustifyRight"); } }
            ]
        });

        // drop-down with italic, strikethrough, ...
        editor.addButton("formatgroup", {
            type: "splitbutton",
            tooltip: "Italic",  // will be autotranslated
            text: "",
            icon: "italic",
            cmd: "italic",
            onPostRender: initOnPostRender("italic"),
            menu: [
                { icon: "strikethrough", text: "Strikethrough", onclick: function () { editor.execCommand("strikethrough"); } },
                { icon: "superscript", text: "Superscript", onclick: function () { editor.execCommand("superscript"); } },
                { icon: "subscript", text: "Subscript", onclick: function () { editor.execCommand("subscript"); } }
            ]

        });

        // drop-down with italic, strikethrough, ...
        editor.addButton("listgroup", {
            type: "splitbutton",
            tooltip: "Numbered list",  // official tinymce key
            text: "",
            icon: "numlist",
            cmd: "InsertOrderedList",
            onPostRender: initOnPostRender("numlist"),  // for unknown reasons, this just doesn't activate correctly :( - neither does the bullist
            menu: [
                { icon: "bullist", text: "Bullet list", onPostRender: initOnPostRender("bullist"), onclick: function () { editor.execCommand("InsertUnorderedList"); } },
                { icon: "outdent", text: "Outdent", onclick: function () { editor.execCommand("Outdent"); } },
                { icon: "indent", text: "Indent", onclick: function () { editor.execCommand("Indent"); } }
            ]

        });

        //#region mode switching and the buttons for it
        function switchModes(mode) {
            editor.settings.toolbar = editor.settings.modes[mode].toolbar;
            editor.settings.menubar = editor.settings.modes[mode].menubar;
            // editor.settings.contextmenu = editor.settings.modes[mode].contextmenu; - doesn't work at the moment

            editor.theme.panel.remove();    // kill current toolbar
            editor.theme.renderUI(editor);
            editor.execCommand("mceFocus");

            // focus away...
            document.getElementById("dummyfocus").focus();

            // ...and focus back a bit later
            setTimeout(function () {
                editor.focus();
            }, 100);
        }

        editor.addButton("modestandard", {
            icon: " eav-icon-cancel",
            tooltip: "SwitchMode.Standard",
            onclick: function () { switchModes("standard"); }
        });

        editor.addButton("modeadvanced", {
            icon: " eav-icon-pro",
            tooltip: "SwitchMode.Pro",
            onclick: function () { switchModes("advanced"); }
        });
        //#endregion

        //#region h1, h2, etc. buttons, inspired by http://blog.ionelmc.ro/2013/10/17/tinymce-formatting-toolbar-buttons/
        // note that the complex array is needede because auto-translate only happens if the string is identical
        [["pre", "Preformatted", "Preformatted"],
        ["p", "Paragraph", "Paragraph"],
        ["code", "Code", "Code"],
        ["h1", "Heading 1", "H1"],
        ["h2", "Heading 2", "H2"],
        ["h3", "Heading 3", "H3"],
        ["h4", "Heading 4", "Heading 4"],
        ["h5", "Heading 5", "Heading 5"],
        ["h6", "Heading 6", "Heading 6"]].forEach(function (tag) {
            editor.addButton(tag[0], {
                tooltip: tag[1],
                text: tag[2],
                onclick: function () { editor.execCommand("mceToggleFormat", false, tag[0]); },
                onPostRender: function () {
                    var self = this,
                        setup = function () {
                            editor.formatter.formatChanged(tag[0], function (state) {
                                self.active(state);
                            });
                        };
                    var x = editor.formatter ? setup() : editor.on("init", setup);
                }
            });
        });

        // group of buttons with an h3 to start and showing h4-6 + p // ) angular.extend({}, editor.buttons.h3,
        editor.addButton("hgroup", Object.assign({}, editor.buttons.h3,
            {
                type: "splitbutton",
                menu: [
                    editor.buttons.h4,
                    editor.buttons.h5,
                    editor.buttons.h6,
                    editor.buttons.p
                ]
            }));
        //#endregion

        // #region inside content
        editor.addButton("addcontentblock", {
            icon: " eav-icon-content-block",
            classes: "btn-addcontentblock",
            tooltip: "ContentBlock.Add",
            onclick: function () {
                var guid = Math.uuid().toLowerCase(); // requires the uuid-generator to be included

                editor.insertContent("<hr sxc=\"sxc-content-block\" guid=\"" + guid + "\" />");
            }
        });
        // #endregion

        //#region image alignment / size buttons
        editor.addButton("alignimgleft", { icon: " eav-icon-align-left", tooltip: "Align left", cmd: "JustifyLeft", onPostRender: initOnPostRender("alignleft") });
        editor.addButton("alignimgcenter", { icon: " eav-icon-align-center", tooltip: "Align center", cmd: "justifycenter", onPostRender: initOnPostRender("aligncenter") });
        editor.addButton("alignimgright", { icon: " eav-icon-align-right", tooltip: "Align right", cmd: "justifyright", onPostRender: initOnPostRender("alignright") });

        var imgMenuArray = [];
        function makeImgFormatCall(size) { return function () { editor.formatter.apply("imgwidth" + size); }; }
        for (var is = 0; is < imgSizes.length; is++) {
            var config = {
                icon: " eav-icon-resize-horizontal",
                tooltip: imgSizes[is] + "%",
                text: imgSizes[is] + "%",
                onclick: makeImgFormatCall(imgSizes[is]),
                onPostRender: initOnPostRender("imgwidth" + imgSizes[is])
            };
            editor.addButton("imgresize" + imgSizes[is], config);
            imgMenuArray.push(config);
        }

        editor.addButton("resizeimg100", {
            icon: " eav-icon-resize-horizontal", tooltip: "100%",
            onclick: function () { editor.formatter.apply("imgwidth100"); },
            onPostRender: initOnPostRender("imgwidth100")
        });

        // group of buttons to resize an image 100%, 50%, etc.
        editor.addButton("imgresponsive", Object.assign({}, editor.buttons.resizeimg100,
            { type: "splitbutton", menu: imgMenuArray }));
        //#endregion

        //#region my context toolbars for links, images and lists (ul/li)
        function makeTagDetector(tagWeNeedInTheTagPath) {
            return function tagDetector(currentElement) {
                // check if we are in a tag within a specific tag
                var selectorMatched = editor.dom.is(currentElement, tagWeNeedInTheTagPath) && editor.getBody().contains(currentElement);
                return selectorMatched;
            };
        }

        editor.addContextToolbar(makeTagDetector("a"), "link unlink");
        editor.addContextToolbar(makeTagDetector("img"), "image | alignimgleft alignimgcenter alignimgright imgresponsive | removeformat | remove");
        editor.addContextToolbar(makeTagDetector("li,ol,ul"), "bullist numlist | outdent indent");
        //#endregion
    }

    function externalComponent2Factory(name) {
        console.log('customTinymce');
        return new customTinyMceWysiwyg(name, null, null);
    }

    window.addOn.register(externalComponent2Factory('tinymce-wysiwyg'));
})();