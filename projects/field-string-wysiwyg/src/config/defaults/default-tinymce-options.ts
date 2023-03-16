import type { RawEditorOptions } from 'tinymce';

export const TinyMceOptionsDefault: RawEditorOptions = {
  skin: '2sxc-tinymce-skin',
  theme: 'silver',
  suffix: '.min', // force minified skin, theme, plugins, etc.
  // body_class: 'field-string-wysiwyg-mce-box',
  height: '100%',
  branding: false,

  // experimental - not working
  // statusbar: true, // doesn't work in inline
  // elementpath: true,
  // resize: true,

  inline: true, // use the div, not an iframe
  toolbar_mode: 'floating',
  automatic_uploads: false, // we're using our own upload mechanism
  autosave_ask_before_unload: false,
  paste_as_text: true,
  // plugins: // Note that plugins are managed separately,
  extended_valid_elements: '@[class]' // allow classes on all elements,
    + ',i' // allow i elements (allows icon-font tags like <i class='fa fa-...'>),
    + ',hr[sxc|guid]', // allow inline content-blocks

  // 2023-03-16 2dm - don't think we need this, disabled
  // custom_elements: 'hr',

  // Url Rewriting in images and pages
  // convert_urls: false,  // don't use this, would keep the domain which is often a test-domain
  // keep urls with full path so starting with a '/' - otherwise it would rewrite them to a '../../..' syntax
  relative_urls: false,
  link_default_target: '_blank', // auto-use blank as default link-target
  object_resizing: false, // don't allow manual scaling of images
  // debounce: false, // DONT slow-down model updates - otherwise we sometimes miss the last changes
  toolbar_persist: true,
};

export const TinyMceOptionsText: RawEditorOptions = {
  ...TinyMceOptionsDefault,
  paste_as_text: true,
  paste_block_drop: true,
  paste_data_images: false,
  invalid_elements: [
    'div',
    'table,tr,td,th,thead,tbody,caption,col,colgroup,tfoot',
    'font,section,article,aside,header,footer,nav,hgroup,address',
    'object,iframe,video,audio,source,track,embed',
    'figure,figcaption',
    'img,picture,map,area,canvas,svg,math',
  ].join(','),
};

export const TinyMceOptionsTextBasic: RawEditorOptions = {
  ...TinyMceOptionsText,
  invalid_elements: TinyMceOptionsText.invalid_elements + ',h1,h2,h3,h4,h5,h6',
};

export const TinyMceOptionsTextMinimal: RawEditorOptions = {
  ...TinyMceOptionsTextBasic,
  invalid_elements: TinyMceOptionsTextBasic.invalid_elements + ',ul,ol,li',
};

export const TinyMceOptionsTextPlain: RawEditorOptions = {
  ...TinyMceOptionsTextMinimal,
  invalid_elements: TinyMceOptionsTextMinimal.invalid_elements + ',strong,b,em,i,a',
};
