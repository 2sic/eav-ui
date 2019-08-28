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
}

export function getTinyOptions(config: Config) {
  let options = {
    selector: `.${config.containerClass}`,
    fixed_toolbar_container: `.${config.fixedToolbarClass}`,
    setup: config.setup, // callback function during setup
    skin: 'oxide',
    theme: 'silver',
    body_class: 'field-string-wysiwyg-mce-box',
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

  const modesOptions = getModesOptions(config.contentBlocksEnabled);
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

function getModesOptions(contentBlocksEnabled: boolean) {
  const modes = {
    standard: {
      menubar: false,
      toolbar: ' undo redo removeformat '
        + '| bold formatgroup '
        + '| h1 h2 hgroup '
        + '| listgroup '
        + '| linkfiles linkgroup '
        + '| ' + (contentBlocksEnabled ? ' addcontentblock ' : '') + 'modeadvanced ',
      contextmenu: 'charmap hr' + (contentBlocksEnabled ? ' addcontentblock' : '')
    },
    advanced: {
      menubar: true,
      toolbar: ' undo redo removeformat '
        + '| styleselect '
        + '| bold italic '
        + '| h1 h2 hgroup '
        + '| bullist numlist outdent indent '
        + '| images linkfiles linkgrouppro '
        + '| code modestandard ',
      contextmenu: 'link image | charmap hr adamimage'
    }
  };
  return {
    modes: modes, // for later switch to another mode
    menubar: modes.standard.menubar, // basic menu (none)
    toolbar: modes.standard.toolbar, // basic toolbar
    contextmenu: modes.standard.contextmenu, // 'link image | charmap hr adamimage',
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

function imagesUploadHandler(blobInfo: any, success: () => any, failure: () => any) {
  const settings = (window as any).tinymce.activeEditor.settings;

  const formData = new FormData();
  formData.append('file', blobInfo.blob(), blobInfo.filename());

  console.log('TinyMCE upload settings', settings);
  // spm test this!
  fetch(settings.images_upload_url, {
    method: 'POST',
    mode: 'cors',
    headers: settings.uploadHeaders,
    body: JSON.stringify(formData),
  }).then(response =>
    response.json()
  ).then(data => {
    console.log('TinyMCE upload data', data);
  }).catch(error => {
    console.log('TinyMCE upload error:', error);
  });

  // this.http.post<any>(settings.images_upload_url, formData, { headers: settings.upload_headers }).pipe(
  //   map(({ Path }) => Path),
  //   tap(imagePath => success(imagePath)),
  //   catchError(e => of(failure(e))),
  // ).subscribe();
}
