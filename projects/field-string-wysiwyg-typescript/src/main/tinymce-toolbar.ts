import { loadCustomIcons } from './load-icons-helper';

export function addTinyMceToolbarButtons(vm: any, editor: any, imgSizes: any) {
  registerTinyMceFormats(editor, imgSizes);
  loadCustomIcons(editor);

  // Group with adam-link, dnn-link
  editor.ui.registry.addSplitButton('linkfiles', {
    icon: 'custom-file-pdf',
    tooltip: 'Link.AdamFile.Tooltip',
    presets: 'listpreview',
    columns: 3,
    onAction: (_: any) => {
      vm.toggleAdam(false);
    },
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items = [
        {
          type: 'choiceitem',
          text: 'Link.AdamFile',
          tooltip: 'Link.AdamFile.Tooltip',
          icon: 'custom-file-pdf',
          value: (api: any) => { vm.toggleAdam(false); },
        },
        {
          type: 'choiceitem',
          text: 'Link.DnnFile',
          tooltip: 'Link.DnnFile.Tooltip',
          icon: 'custom-file',
          value: (api: any) => { vm.toggleAdam(false, true); },
        },
      ];
      callback(items);
    },
  });

  // Link group with web-link, page-link, unlink, anchor
  const linkgroupItems = [
    {
      type: 'choiceitem',
      text: 'Link',
      tooltip: 'Link',
      icon: 'link',
      value: (api: any) => { editor.execCommand('mceLink'); },
    },
    {
      type: 'choiceitem',
      text: 'Link.Page',
      tooltip: 'Link.Page.Tooltip',
      icon: 'custom-sitemap',
      value: (api: any) => { vm.openDnnDialog('pagepicker'); },
    },
  ];
  const linkgroupProItems = [...linkgroupItems];
  linkgroupProItems.push({
    type: 'choiceitem',
    text: 'Anchor',
    tooltip: 'Link.Anchor.Tooltip',
    icon: 'custom-anchor',
    value: (api) => { editor.execCommand('mceAnchor'); },
  });
  const linkgroup = {
    icon: 'link',
    tooltip: 'Link',
    presets: 'listpreview',
    columns: 3,
    onSetup: initOnPostRender('link', editor),
    onAction: (_: any) => {
      editor.execCommand('mceLink');
    },
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      callback(linkgroupItems);
    },
  };
  const linkgroupPro = { ...linkgroup };
  linkgroupPro.fetch = (callback) => {
    callback(linkgroupProItems);
  };
  editor.ui.registry.addSplitButton('linkgroup', linkgroup);
  editor.ui.registry.addSplitButton('linkgrouppro', linkgroupPro);

  // Group with images (adam) - only in PRO mode
  editor.ui.registry.addSplitButton('images', {
    icon: 'image',
    tooltip: 'Image',
    presets: 'listpreview',
    columns: 3,
    onAction: (_: any) => {
      vm.toggleAdam(true);
    },
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items = [
        {
          type: 'choiceitem',
          text: 'Image.AdamImage',
          tooltip: 'Image.AdamImage.Tooltip',
          icon: 'image',
          value: (api: any) => { vm.toggleAdam(true); },
        },
        {
          type: 'choiceitem',
          text: 'Image.DnnImage',
          tooltip: 'Image.DnnImage.Tooltip',
          icon: 'image',
          value: (api: any) => { vm.toggleAdam(true, true); },
        },
        // note: all these use i18n from tinyMce standard
        {
          type: 'choiceitem',
          text: 'Insert\/edit image',
          tooltip: 'Insert\/edit image',
          icon: 'image',
          value: (api: any) => { editor.execCommand('mceImage'); },
        },
        {
          type: 'choiceitem',
          text: 'Align left',
          tooltip: 'Align left',
          icon: 'align-left',
          value: (api: any) => { editor.execCommand('JustifyLeft'); },
        },
        {
          type: 'choiceitem',
          text: 'Align center',
          tooltip: 'Align center',
          icon: 'align-center',
          value: (api: any) => { editor.execCommand('JustifyCenter'); },
        },
        {
          type: 'choiceitem',
          text: 'Align right',
          tooltip: 'Align right',
          icon: 'align-right',
          value: (api: any) => { editor.execCommand('JustifyRight'); },
        },
      ];
      callback(items);
    },
  });

  // Drop-down with italic, strikethrough, ...
  editor.ui.registry.addSplitButton('formatgroup', {
    tooltip: 'Italic',  // will be autotranslated
    icon: 'italic',
    presets: 'listpreview',
    columns: 3,
    onSetup: initOnPostRender('italic', editor),
    onAction: (_: any) => {
      editor.execCommand('Italic');
    },
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items = [
        {
          type: 'choiceitem',
          text: 'Strikethrough',
          tooltip: 'Strikethrough',
          icon: 'strike-through',
          value: (api: any) => { editor.execCommand('Strikethrough'); },
        },
        {
          type: 'choiceitem',
          text: 'Superscript',
          tooltip: 'Superscript',
          icon: 'superscript',
          value: (api: any) => { editor.execCommand('Superscript'); },
        },
        {
          type: 'choiceitem',
          text: 'Subscript',
          tooltip: 'Subscript',
          icon: 'subscript',
          value: (api: any) => { editor.execCommand('Subscript'); },
        },
      ];
      callback(items);
    },
  });

  // Drop-down with numbered list, bullet list, ...
  editor.ui.registry.addSplitButton('listgroup', {
    tooltip: 'Numbered list',  // official tinymce key
    icon: 'ordered-list',
    presets: 'listpreview',
    columns: 3,
    // for unknown reasons, this just doesn't activate correctly :( - neither does the bullist
    // spm numlist and bullist are not considered formats and don't trigger formatChanged
    onSetup: initOnPostRender('numlist', editor),
    onAction: (_: any) => {
      editor.execCommand('InsertOrderedList');
    },
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items = [
        {
          type: 'choiceitem',
          text: 'Bullet list',
          tooltip: 'Bullet list',
          icon: 'unordered-list',
          value: (api: any) => { editor.execCommand('InsertUnorderedList'); },
        },
        {
          type: 'choiceitem',
          text: 'Outdent',
          tooltip: 'Outdent',
          icon: 'outdent',
          value: (api: any) => { editor.execCommand('Outdent'); },
        },
        {
          type: 'choiceitem',
          text: 'Indent',
          tooltip: 'Indent',
          icon: 'indent',
          value: (api: any) => { editor.execCommand('Indent'); },
        },
      ];
      callback(items);
    },
    // spm fix onPostRender on bullist
    // menu: [
    //     {
    //         icon: 'bullist',
    //         text: 'Bullet list',
    //         onPostRender: initOnPostRender('bullist', editor),
    //         onAction: () => { editor.execCommand('InsertUnorderedList'); }
    //     },
    //     { icon: 'outdent', text: 'Outdent', onAction: () => { editor.execCommand('Outdent'); } },
    //     { icon: 'indent', text: 'Indent', onAction: () => { editor.execCommand('Indent'); } }
    // ]
  });

  // Switch normal / advanced mode
  editor.ui.registry.addButton('modestandard', {
    icon: 'close',
    tooltip: 'SwitchMode.Standard',
    onAction: (_: any) => {
      switchModes('standard', editor);
    },
  });

  editor.ui.registry.addButton('modeadvanced', {
    icon: 'custom-school',
    tooltip: 'SwitchMode.Pro',
    onAction: (_: any) => {
      switchModes('advanced', editor);
    },
  });

  // h1, h2, etc. buttons, inspired by http://blog.ionelmc.ro/2013/10/17/tinymce-formatting-toolbar-buttons/
  // note that the complex array is needed because auto-translate only happens if the string is identical
  [['pre', 'Preformatted', 'Preformatted'],
  ['p', 'Paragraph', 'Paragraph'],
  ['code', 'Code', 'Code'],
  ['h1', 'Heading 1', 'H1'],
  ['h2', 'Heading 2', 'H2'],
  ['h3', 'Heading 3', 'H3'],
  ['h4', 'Heading 4', 'Heading 4'],
  ['h5', 'Heading 5', 'Heading 5'],
  ['h6', 'Heading 6', 'Heading 6']].forEach((tag) => {
    editor.ui.registry.addButton(tag[0], {
      tooltip: tag[1],
      text: tag[2],
      onAction: (_: any) => {
        editor.execCommand('mceToggleFormat', false, tag[0]);
      },
      onSetup: initOnPostRender(tag[0], editor),
    });
  });

  // Group of buttons with an h3 to start and showing h4-6 + p
  editor.ui.registry.addSplitButton('hgroup', {
    ...editor.ui.registry.getAll().buttons.h3,
    presets: 'listpreview',
    columns: 3,
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items = [
        {
          ...editor.ui.registry.getAll().buttons.h4,
          type: 'choiceitem',
          value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h4'); },
        },
        {
          ...editor.ui.registry.getAll().buttons.h5,
          type: 'choiceitem',
          value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h5'); },
        },
        {
          ...editor.ui.registry.getAll().buttons.h6,
          type: 'choiceitem',
          value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'h6'); },
        },
        {
          ...editor.ui.registry.getAll().buttons.p,
          type: 'choiceitem',
          value: (api: any) => { editor.execCommand('mceToggleFormat', false, 'p'); },
        },
      ];
      callback(items);
    },
  });

  // Inside content (contentblocks)
  editor.ui.registry.addButton('addcontentblock', {
    icon: 'custom-content-block',
    tooltip: 'ContentBlock.Add',
    onAction: (_: any) => {
      // const guid = MathHelper.uuid().toLowerCase(); // requires the uuid-generator to be included
      // editor.insertContent(`<hr sxc="sxc-content-block" guid="${guid}" />`); // spm guid generation might be broken
    },
  });

  // Image alignment / size buttons in context menu
  editor.ui.registry.addButton('alignimgleft', {
    icon: 'align-left',
    tooltip: 'Align left',
    onAction: (_: any) => {
      editor.execCommand('JustifyLeft');
    },
    onPostRender: initOnPostRender('alignleft', editor),
  });
  editor.ui.registry.addButton('alignimgcenter', {
    icon: 'align-center',
    tooltip: 'Align center',
    onAction: (_: any) => {
      editor.execCommand('JustifyCenter');
    },
    onPostRender: initOnPostRender('aligncenter', editor),
  });
  editor.ui.registry.addButton('alignimgright', {
    icon: 'align-right',
    tooltip: 'Align right',
    onAction: (_: any) => {
      editor.execCommand('JustifyRight');
    },
    onPostRender: initOnPostRender('alignright', editor),
  });

  const imgMenuArray: any = [];
  for (let imgs = 0; imgs < imgSizes.length; imgs++) {
    const config = {
      icon: 'resize',
      tooltip: `${imgSizes[imgs]}%`,
      text: `${imgSizes[imgs]}%`,
      value: (api: any) => { editor.formatter.apply(`imgwidth${imgSizes[imgs]}`); },
      onAction: (_: any) => {
        editor.formatter.apply(`imgwidth${imgSizes[imgs]}`);
      },
      onPostRender: initOnPostRender(`imgwidth${imgSizes[imgs]}`, editor),
    };
    editor.ui.registry.addButton(`imgresize${imgSizes[imgs]}`, config);
    imgMenuArray.push(config);
  }
  editor.ui.registry.addButton('resizeimg100', {
    icon: 'resize',
    tooltip: '100%',
    onAction: (_: any) => {
      editor.formatter.apply('imgwidth100');
    },
    onPostRender: initOnPostRender('imgwidth100', editor),
  });

  // group of buttons to resize an image 100%, 50%, etc.
  editor.ui.registry.addSplitButton('imgresponsive', {
    ...editor.ui.registry.getAll().buttons.resizeimg100,
    onItemAction: (api: any, value: any) => {
      value(api);
    },
    fetch: (callback: any) => {
      const items: any = [];
      imgMenuArray.forEach((imgSizeOption: any) => {
        items.push({
          ...imgSizeOption,
          type: 'choiceitem',
        });
      });
      callback(items);
    },
  });

  // Context toolbars
  editor.ui.registry.addContextToolbar('a', {
    predicate: makeTagDetector('a', editor),
    items: 'link unlink',
  });
  editor.ui.registry.addContextToolbar('img', {
    predicate: makeTagDetector('img', editor),
    items: 'image | alignimgleft alignimgcenter alignimgright imgresponsive | removeformat | remove',
  });
  editor.ui.registry.addContextToolbar('li,ol,ul', {
    predicate: makeTagDetector('li,ol,ul', editor),
    items: 'bullist numlist | outdent indent',
  });
}

/**
 * Helper function to add activate/deactivate to buttons like alignleft, alignright etc.
 * copied/modified from
 * https://github.com/tinymce/tinymce/blob/ddfa0366fc700334f67b2c57f8c6e290abf0b222/js/tinymce/classes/ui/FormatControls.js#L232-L249
 */
function initOnPostRender(name: any, editor: any) {
  return function (buttonApi: any) {
    function watchChange() {
      editor.formatter.formatChanged(name, function (state: any) {
        try {
          buttonApi.setActive(state);
        } catch (error) {
          // cannot be set active when not visible on toolbar and is behing More... button
          // console.error('button set active error:', error);
        }
      });
    }

    if (editor.formatter) {
      watchChange();
    } else {
      editor.on('init', watchChange);
    }
  };
}

/** Register all formats - like img-sizes */
function registerTinyMceFormats(editor: any, imgSizes: any) {
  const imgformats: any = {};
  for (let imgs = 0; imgs < imgSizes.length; imgs++) {
    imgformats[`imgwidth${imgSizes[imgs]}`] = [{ selector: 'img', collapsed: false, styles: { 'width': `${imgSizes[imgs]}%` } }];
  }
  editor.formatter.register(imgformats);
}

// Mode switching and the buttons for it
function switchModes(mode: any, editor: any) {
  editor.settings.toolbar = editor.settings.modes[mode].toolbar;
  editor.settings.menubar = editor.settings.modes[mode].menubar;

  // refresh editor toolbar
  editor.editorManager.remove(editor);
  editor.editorManager.init(editor.settings);
}

// My context toolbars for links, images and lists (ul/li)
function makeTagDetector(tagWeNeedInTheTagPath: any, editor: any) {
  return function tagDetector(currentElement: any) {
    // check if we are in a tag within a specific tag
    const selectorMatched = editor.dom.is(currentElement, tagWeNeedInTheTagPath) && editor.getBody().contains(currentElement);
    return selectorMatched;
  };
}
