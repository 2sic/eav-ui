interface Config {
  containerClass: string;
  fixedToolbarClass: string;
  contentStyle: string;
  setup: (editor: any) => any;
  currentLang: string;
  contentBlocksEnabled: boolean;
  pasteFormattedTextEnabled: boolean;
  pasteImageFromClipboardEnabled: boolean;
  imagesUploadUrl: string;
  uploadHeaders: any;
  inlineMode: boolean; // form inline mode (without expandable). Not to be confused with tinymce inline
  buttonSource: string;
  buttonAdvanced: string;
}

export function getTinyOptions(config: Config) {
  let options = {
    selector: `.${config.containerClass}`,
    fixed_toolbar_container: `.${config.fixedToolbarClass}`,
    setup: config.setup, // callback function during setup
    skin: 'oxide',
    theme: 'silver',
    suffix: '.min', // force minified skin, theme, plugins, etc.
    // body_class: 'field-string-wysiwyg-mce-box',
    content_style: config.contentStyle,
    height: '100%',
    branding: false,
    // statusbar: true, // doesn't work in inline
    inline: true, // use the div, not an iframe
    toolbar_drawer: 'floating',
    automatic_uploads: false, // we're using our own upload mechanism
    autosave_ask_before_unload: false,
    paste_as_text: true,
    plugins: [
      'code', // allow view / edit source
      // 'contextmenu', // right-click menu for things like insert, etc. spm built into tinymce core in v5
      'autolink', // automatically convert www.xxx links to real links
      'tabfocus', // get in an out of the editor with tab
      'image', // image button and image-settings
      'link', // link button + ctrl+k to add link
      // 'autosave',     // temp-backups the content in case the browser crashes, allows restore
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
    ],
    extended_valid_elements: '@[class]' // allow classes on all elements,
      + ',i' // allow i elements (allows icon-font tags like <i class='fa fa-...'>),
      + ',hr[sxc|guid]', // allow inline content-blocks
    custom_elements: 'hr',
    // Url Rewriting in images and pages
    // convert_urls: false,  // don't use this, would keep the domain which is often a test-domain
    // keep urls with full path so starting with a '/' - otherwise it would rewrite them to a '../../..' syntax
    relative_urls: false,
    default_link_target: '_blank', // auto-use blank as default link-target
    object_resizing: false, // don't allow manual scaling of images
    debounce: false, // DONT slow-down model updates - otherwise we sometimes miss the last changes
  };

  const modesOptions = getModesOptions(config.contentBlocksEnabled, config.inlineMode, config.buttonSource, config.buttonAdvanced);
  options = { ...options, ...modesOptions };

  const languageOptions = getLanguageOptions(config.currentLang);
  options = { ...options, ...languageOptions };

  if (config.pasteFormattedTextEnabled) {
    const pasteFormattedTextOptions = getPasteFormattedTextOptions();
    options = { ...options, ...pasteFormattedTextOptions };
  }

  if (config.pasteImageFromClipboardEnabled) {
    const pasteImagesOptions = getPasteImagesOptions(config.imagesUploadUrl, config.uploadHeaders);
    options = { ...options, ...pasteImagesOptions };
  }
  return options;
}

function getModesOptions(contentBlocksEnabled: boolean, inlineMode: boolean, buttonSource: string, buttonAdvanced: string) {
  const modes = {
    inline: {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + '| bold formatgroup '
        + '| h2 h3 hgroup '
        + '| listgroup '
        + '| linkgroup '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + (buttonSource === 'true' ? ' code ' : '')
        + (buttonAdvanced === 'true' ? ' modeadvanced ' : '')
        + ' expandfulleditor ',
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    },
    standard: {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + '| bold formatgroup '
        + '| h2 h3 hgroup '
        + '| listgroup '
        + '| linkfiles linkgroup '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + (buttonSource === 'false' ? '' : ' code ')
        + (buttonAdvanced === 'false' ? '' : ' modeadvanced '),
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    },
    advanced: {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styleselect '
        + '| bold italic '
        + '| h2 h3 hgroup '
        + '| bullist numlist outdent indent '
        + '| ' + (!inlineMode ? ' images linkfiles' : '') + ' linkgrouppro '
        + '| '
        + (contentBlocksEnabled ? ' addcontentblock ' : '')
        + ' code '
        + (inlineMode ? ' modeinline expandfulleditor ' : ' modestandard '),
      contextmenu: 'link image | charmap hr adamimage' + (contentBlocksEnabled ? ' addcontentblock' : '')
    },
  };
  return {
    modes: modes, // for later switch to another mode
    menubar: inlineMode ? modes.inline.menubar : modes.standard.menubar, // basic menu (none)
    toolbar: inlineMode ? modes.inline.toolbar : modes.standard.toolbar, // basic toolbar
    contextmenu: inlineMode ? modes.inline.contextmenu : modes.standard.contextmenu, // 'link image | charmap hr adamimage',
  };
}

function getLanguageOptions(currentLang: string) {
  // default language
  const defaultLanguage = 'en';
  // translated languages
  const languages = 'de,es,fr,it,uk,nl'.split(',');

  // check if it's an additionally translated language and load the translations
  const lang2 = currentLang.substr(0, 2); // 'de'
  if (languages.indexOf(lang2) === -1) {
    return {
      language: defaultLanguage,
    };
  } else {
    return {
      language: lang2,
      language_url: '/DesktopModules/ToSIC_SexyContent/dist/i18n/lib/tinymce/' + lang2 + '.js',
    };
  }
}

/** Paste formatted text, e.g. text copied from MS Word */
function getPasteFormattedTextOptions() {
  return {
    paste_as_text: false,
    paste_enable_default_filters: true,
    paste_create_paragraphs: true,
    paste_create_linebreaks: false,
    paste_force_cleanup_wordpaste: true,
    paste_use_dialog: true,
    paste_auto_cleanup_on_paste: true,
    paste_convert_middot_lists: true,
    paste_convert_headers_to_strong: false,
    paste_remove_spans: true,
    paste_remove_styles: true,

    paste_preprocess: function (e: any, args: any) {
      console.log('paste preprocess', e, args);
    },

    paste_postprocess: function (plugin: any, args: any) {
      try {
        const anchors = args.node.getElementsByTagName('a');
        for (let i = 0; i < anchors.length; i++) {
          if (anchors[i].hasAttribute('target') === false) {
            anchors[i].setAttribute('target', '_blank');
          }
        }
      } catch (e) {
        console.error('error in paste postprocess - will only log but not throw', e);
      }
    }
  };
}

/** Paste image */
function getPasteImagesOptions(uploadUrl: string, headers: any) {
  return {
    automatic_uploads: true,
    images_reuse_filename: true,
    paste_data_images: true,
    paste_filter_drop: false,
    paste_block_drop: false,
    images_upload_url: uploadUrl,
    images_upload_base_path: '/images_upload_base_path/',
    images_upload_handler: imagesUploadHandler,
    upload_headers: headers,
  };
}

function imagesUploadHandler(blobInfo: any, success: (imgPath: string) => any, failure: () => any) {
  const formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());

  const settings = (window as any).tinymce.activeEditor.settings;
  console.log('TinyMCE upload settings', settings);

  fetch(settings.images_upload_url, {
    method: 'POST',
    // mode: 'cors',
    headers: settings.upload_headers,
    body: formData,
  }).then(response =>
    response.json()
  ).then(data => {
    console.log('TinyMCE upload data', data);
    success(data.Path);
  }).catch(error => {
    console.log('TinyMCE upload error:', error);
  });

}

/** Add translations to TinyMCE. Call after TinyMCE is initialized */
export function addTranslations(language: string, translateService: any, editorManager: any) {
  const primaryLan = 'en';
  const keys = [], mceTranslations: any = {}, prefix = 'Extension.TinyMce', prefixDot = 'Extension.TinyMce.'; //  pLen = prefix.length;

  // find all relevant keys by querying the primary language
  // var all = translateService.getTranslationTable(primaryLan);
  const all = translateService.translations[primaryLan];
  for (const key in all) {
    if (key.indexOf(prefix) === 0) {
      keys.push(key);
    }
  }

  const translations = translateService.instant(keys);

  for (let k = 0; k < keys.length; k++) {
    mceTranslations[keys[k].replace(prefixDot, '')] = translations[keys[k]];
  }

  editorManager.addI18n(language, translations[keys[0]]);
}
