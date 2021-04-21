/** The default plugins we're activating on TinyMce */
export const DefaultPlugins = [
  'code', // allow view / edit source
  'autolink', // automatically convert www.xxx links to real links
  'tabfocus', // get in an out of the editor with tab
  'image', // image button and image-settings
  'link', // link button + ctrl+k to add link
  'paste', // enables paste as text from word etc. https://www.tinymce.com/docs/plugins/paste/
  'anchor', // allows users to set an anchor inside the text
  'charmap', // character map https://www.tinymce.com/docs/plugins/visualchars/
  'hr', // hr
  'media', // video embed
  'nonbreaking', // add button to insert &nbsp; https://www.tinymce.com/docs/plugins/nonbreaking/
  'searchreplace', // search/replace https://www.tinymce.com/docs/plugins/searchreplace/
  'table', // https://www.tinymce.com/docs/plugins/searchreplace/
  'lists', // should fix bug with fonts in list-items (https://github.com/tinymce/tinymce/issues/2330),
  'textpattern' // enable typing like '1. text' to create lists etc.
];
