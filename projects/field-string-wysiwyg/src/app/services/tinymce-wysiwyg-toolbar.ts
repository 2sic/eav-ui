import { MathHelper } from '../helper/math-helper';

export class TinyMceToolbarButtons {
    /**
     * This is attribute type (not attribute inputType)
     * @param config
     * @param attributeKey
     */
    static addTinyMceToolbarButtons(vm: any, editor: any, imgSizes: any) {
        // call register once the editor-object is ready
        editor.on('init', () => {
            console.log('editor SetContent init registerTinyMceFormats', this);
            this.registerTinyMceFormats(editor, vm.host, imgSizes);
        });

        //#endregion

        // group with adam-link, dnn-link
        editor.addButton('linkfiles', {
            type: 'splitbutton',
            icon: ' eav-icon-file-pdf',
            title: 'Link.AdamFile.Tooltip',
            onclick: () => {
                vm.toggleAdam(false);
            },
            menu: [
                {
                    text: 'Link.AdamFile',
                    tooltip: 'Link.AdamFile.Tooltip',
                    icon: ' eav-icon-file-pdf',
                    onclick: () => {
                        vm.toggleAdam(false);
                    }
                }, {
                    text: 'Link.DnnFile',
                    tooltip: 'Link.DnnFile.Tooltip',
                    icon: ' eav-icon-file',
                    onclick: () => {
                        vm.openDnnDialog('documentmanager');
                    }
                }
            ]
        });

        //#region link group with web-link, page-link, unlink, anchor
        const linkgroup = {
            type: 'splitbutton',
            icon: 'link',
            title: 'Link',
            onPostRender: this.initOnPostRender('link', editor),
            onclick: () => {
                editor.execCommand('mceLink');
            },

            menu: [
                { icon: 'link', text: 'Link', onclick: () => { editor.execCommand('mceLink'); } },
                {
                    text: 'Link.Page',
                    tooltip: 'Link.Page.Tooltip',
                    icon: ' eav-icon-sitemap',
                    onclick: () => {
                        vm.openDnnDialog('pagepicker');
                    }
                }
            ]
        };
        const linkgroupPro = { ...linkgroup };
        linkgroupPro.menu.push({
            icon: ' eav-icon-anchor',
            text: 'Anchor',
            tooltip: 'Link.Anchor.Tooltip',
            onclick: () => { editor.execCommand('mceAnchor'); }
        });
        editor.addButton('linkgroup', linkgroup);
        editor.addButton('linkgrouppro', linkgroupPro);
        //#endregion

        // group with images (adam) - only in PRO mode
        editor.addButton('images', {
            type: 'splitbutton',
            text: '',
            icon: 'image',
            onclick: () => {
                vm.toggleAdam(true);
            },
            menu: [
                {
                    text: 'Image.AdamImage',
                    tooltip: 'Image.AdamImage.Tooltip',
                    icon: 'image',
                    onclick: () => {
                        vm.toggleAdam(true);
                    }
                }, {
                    text: 'Image.DnnImage',
                    tooltip: 'Image.DnnImage.Tooltip',
                    icon: 'image',
                    onclick: () => {
                        vm.toggleAdam(true, true);
                    }
                }, {
                    text: 'Insert\/edit image', // i18n tinyMce standard
                    icon: 'image',
                    onclick: () => { editor.execCommand('mceImage'); }

                },
                // note: all these use i18n from tinyMce standard
                { icon: 'alignleft', tooltip: 'Align left', onclick: () => { editor.execCommand('JustifyLeft'); } },
                { icon: 'aligncenter', tooltip: 'Align center', onclick: () => { editor.execCommand('JustifyCenter'); } },
                { icon: 'alignright', tooltip: 'Align right', onclick: () => { editor.execCommand('JustifyRight'); } }
            ]
        });

        // drop-down with italic, strikethrough, ...
        editor.addButton('formatgroup', {
            type: 'splitbutton',
            tooltip: 'Italic',  // will be autotranslated
            text: '',
            icon: 'italic',
            cmd: 'italic',
            onPostRender: this.initOnPostRender('italic', editor),
            menu: [
                { icon: 'strikethrough', text: 'Strikethrough', onclick: () => { editor.execCommand('strikethrough'); } },
                { icon: 'superscript', text: 'Superscript', onclick: () => { editor.execCommand('superscript'); } },
                { icon: 'subscript', text: 'Subscript', onclick: () => { editor.execCommand('subscript'); } }
            ]
        });

        // drop-down with italic, strikethrough, ...
        editor.addButton('listgroup', {
            type: 'splitbutton',
            tooltip: 'Numbered list',  // official tinymce key
            text: '',
            icon: 'numlist',
            cmd: 'InsertOrderedList',
            // for unknown reasons, this just doesn't activate correctly :( - neither does the bullist
            onPostRender: this.initOnPostRender('numlist', editor),
            menu: [
                {
                    icon: 'bullist',
                    text: 'Bullet list',
                    onPostRender: this.initOnPostRender('bullist', editor),
                    onclick: () => { editor.execCommand('InsertUnorderedList'); }
                },
                { icon: 'outdent', text: 'Outdent', onclick: () => { editor.execCommand('Outdent'); } },
                { icon: 'indent', text: 'Indent', onclick: () => { editor.execCommand('Indent'); } }
            ]
        });


        editor.addButton('modestandard', {
            icon: ' eav-icon-cancel',
            tooltip: 'SwitchMode.Standard',
            onclick: () => { this.switchModes('standard', editor); }
        });

        editor.addButton('modeadvanced', {
            icon: ' eav-icon-pro',
            tooltip: 'SwitchMode.Pro',
            onclick: () => { this.switchModes('advanced', editor); }
        });
        //#endregion

        //#region h1, h2, etc. buttons, inspired by http://blog.ionelmc.ro/2013/10/17/tinymce-formatting-toolbar-buttons/
        // note that the complex array is needede because auto-translate only happens if the string is identical
        [['pre', 'Preformatted', 'Preformatted'],
        ['p', 'Paragraph', 'Paragraph'],
        ['code', 'Code', 'Code'],
        ['h1', 'Heading 1', 'H1'],
        ['h2', 'Heading 2', 'H2'],
        ['h3', 'Heading 3', 'H3'],
        ['h4', 'Heading 4', 'Heading 4'],
        ['h5', 'Heading 5', 'Heading 5'],
        ['h6', 'Heading 6', 'Heading 6']].forEach((tag) => {
            editor.addButton(tag[0], {
                tooltip: tag[1],
                text: tag[2],
                onclick: () => { editor.execCommand('mceToggleFormat', false, tag[0]); },
                onPostRender: function () {
                    const self = this,
                        setup = function () {
                            editor.formatter.formatChanged(tag[0], function (state) {
                                self.active(state);
                            });
                        };
                    const x = editor.formatter ? setup() : editor.on('init', setup);
                }
            });
        });

        // group of buttons with an h3 to start and showing h4-6 + p // ) angular.extend({}, editor.buttons.h3,
        editor.addButton('hgroup', Object.assign({}, editor.buttons.h3,
            {
                type: 'splitbutton',
                menu: [
                    editor.buttons.h4,
                    editor.buttons.h5,
                    editor.buttons.h6,
                    editor.buttons.p
                ]
            }));
        //#endregion

        // #region inside content
        editor.addButton('addcontentblock', {
            icon: ' eav-icon-content-block',
            classes: 'btn-addcontentblock',
            tooltip: 'ContentBlock.Add',
            onclick: () => {
                const guid = MathHelper.uuid().toLowerCase(); // requires the uuid-generator to be included
                editor.insertContent('<hr sxc=\'sxc-content-block\' guid=\'' + guid + '\' />');
            }
        });
        // #endregion

        //#region image alignment / size buttons
        editor.addButton('alignimgleft',
            {
                icon: ' eav-icon-align-left', tooltip: 'Align left', cmd: 'JustifyLeft',
                onPostRender: this.initOnPostRender('alignleft', editor)
            }
        );
        editor.addButton('alignimgcenter',
            {
                icon: ' eav-icon-align-center', tooltip: 'Align center', cmd: 'justifycenter',
                onPostRender: this.initOnPostRender('aligncenter', editor)
            }
        );
        editor.addButton('alignimgright',
            {
                icon: ' eav-icon-align-right', tooltip: 'Align right', cmd: 'justifyright',
                onPostRender: this.initOnPostRender('alignright', editor)
            }
        );

        const imgMenuArray = [];
        for (let imgs = 0; imgs < imgSizes.length; imgs++) {
            const config = {
                icon: ' eav-icon-resize-horizontal',
                tooltip: imgSizes[imgs] + '%',
                text: imgSizes[imgs] + '%',
                onclick: this.makeImgFormatCall(imgSizes[imgs], editor),
                onPostRender: this.initOnPostRender('imgwidth' + imgSizes[imgs], editor)
            };
            editor.addButton('imgresize' + imgSizes[imgs], config);
            imgMenuArray.push(config);

            editor.addButton('resizeimg100', {
                icon: ' eav-icon-resize-horizontal', tooltip: '100%',
                onclick: () => { editor.formatter.apply('imgwidth100'); },
                onPostRender: this.initOnPostRender('imgwidth100', editor)
            });

            // group of buttons to resize an image 100%, 50%, etc.
            editor.addButton('imgresponsive', Object.assign({}, editor.buttons.resizeimg100,
                { type: 'splitbutton', menu: imgMenuArray }));
            //#endregion

            editor.addContextToolbar(this.makeTagDetector('a', editor), 'link unlink');
            editor.addContextToolbar(this.makeTagDetector('img', editor),
                'image | alignimgleft alignimgcenter alignimgright imgresponsive | removeformat | remove');
            editor.addContextToolbar(this.makeTagDetector('li,ol,ul', editor), 'bullist numlist | outdent indent');
        }
    }

    // helper function to add activate/deactivate to buttons like alignleft, alignright etc.
    // tslint:disable-next-line:max-line-length
    static initOnPostRender(name, editor) { // copied/modified from
        // tslint:disable-next-line:max-line-length
        // https://github.com/tinymce/tinymce/blob/ddfa0366fc700334f67b2c57f8c6e290abf0b222/js/tinymce/classes/ui/FormatControls.js#L232-L249
        return () => {
            // const self = this; // keep ref to the current button?
            const watchChange = () => {
                editor.formatter.formatChanged(name, function (state) {
                    this.active(state);
                }
                );
            };
            if (editor.formatter) {
                watchChange();
            } else {
                // TODO: test
                // editor.on('init', () => watchChange());
                editor.on('init', watchChange);
            }
        };
    }

    //#endregion

    //#region register formats

    // the method that will register all formats - like img-sizes
    static registerTinyMceFormats(editor, host, imgSizes: any) {
        const imgformats = {};
        for (let imgs = 0; imgs < imgSizes.length; imgs++) {
            imgformats['imgwidth' + imgSizes[imgs]] = [{ selector: 'img', collapsed: false, styles: { 'width': imgSizes[imgs] + '%' } }];
        }
        editor.formatter.register(imgformats);
    }

    //#region mode switching and the buttons for it
    static switchModes(mode, editor) {
        console.log('switchModes1', editor.settings.modes[mode].toolbar);
        editor.settings.toolbar = editor.settings.modes[mode].toolbar;
        editor.settings.menubar = editor.settings.modes[mode].menubar;
        // editor.settings.contextmenu = editor.settings.modes[mode].contextmenu; - doesn't work at the moment

        // refresh editor toolbar when it's in inline mode  (inline true)
        // editor.theme.panel.remove();    // kill current toolbar
        // editor.theme.renderUI(editor);

        // refresh editor toolbar when it's NOT in inline mode (inline false)
        editor.editorManager.remove(editor);
        editor.editorManager.init(editor.settings);

        editor.execCommand('mceFocus');

        // focus away...
        document.getElementById('dummyfocus').focus();

        // ...and focus back a bit later
        setTimeout(() => {
            editor.focus();
        }, 100);
    }

    static makeImgFormatCall(size, editor) {
        return () => {
            editor.formatter.apply('imgwidth' + size);
        };
    }

    //#region my context toolbars for links, images and lists (ul/li)
    static makeTagDetector(tagWeNeedInTheTagPath, editor) {
        return function tagDetector(currentElement) {
            // check if we are in a tag within a specific tag
            const selectorMatched = editor.dom.is(currentElement, tagWeNeedInTheTagPath) && editor.getBody().contains(currentElement);
            return selectorMatched;
        };
    }
}
