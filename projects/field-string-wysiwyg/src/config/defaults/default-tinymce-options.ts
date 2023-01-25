import type { RawEditorOptions } from 'tinymce';

export const DefaultOptions: RawEditorOptions = {
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
  // 2020-04-17 2dm - plugins now added later
  // plugins: DefaultPlugins,
  extended_valid_elements: '@[class]' // allow classes on all elements,
    + ',i' // allow i elements (allows icon-font tags like <i class='fa fa-...'>),
    + ',hr[sxc|guid]', // allow inline content-blocks
  custom_elements: 'hr',
  // Url Rewriting in images and pages
  // convert_urls: false,  // don't use this, would keep the domain which is often a test-domain
  // keep urls with full path so starting with a '/' - otherwise it would rewrite them to a '../../..' syntax
  relative_urls: false,
  link_default_target: '_blank', // auto-use blank as default link-target
  object_resizing: false, // don't allow manual scaling of images
  // debounce: false, // DONT slow-down model updates - otherwise we sometimes miss the last changes
  toolbar_persist: true,
  // deprecation_warnings: false, // spm TODO: remove after upgrading to TinyMCE 6

  // experimental #content-divisions - https://www.tiny.cloud/docs/configure/content-filtering/#valid_children
  // valid_children: '+div[p|h1|h2|h3|h4|h5|6h|blockquote]'
};
