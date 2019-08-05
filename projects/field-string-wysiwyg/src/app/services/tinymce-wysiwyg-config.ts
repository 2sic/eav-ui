import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable, ɵConsole } from '@angular/core';
import { tap, catchError, map } from 'rxjs/operators';
import { of } from 'rxjs';

@Injectable()
export class TinymceWysiwygConfig {

  constructor(
    private http: HttpClient,
  ) { }
  svc = () => {
    return {
      // cdn root
      // cdnRoot: '//cdn.tinymce.com/4',
      // these are the sizes we can auto-resize to
      imgSizes: [100, 75, 70, 66, 60, 50, 40, 33, 30, 25, 10],

      // the default language, in which we have all labels/translations
      defaultLanguage: 'en',

      // all other languages
      languages: 'de,es,fr,it,uk,nl'.split(','),

      // tinyMCE plugins we're using
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

      validateAlso: '@[class]' // allow classes on all elements,
        + ',i' // allow i elements (allows icon-font tags like <i class='fa fa-...'>)
        + ',hr[sxc|guid]' // experimental: allow inline content-blocks
    };
  }

  buildModes = (settings) => {
    // the WYSIWYG-modes we offer, standard with simple toolbar and advanced with much more
    return {
      standard: {
        menubar: false,
        toolbar: ' undo redo removeformat '
          + '| bold formatgroup '
          + '| h1 h2 hgroup '
          + '| listgroup '
          + '| linkfiles linkgroup '
          + '| ' + (settings.enableContentBlocks ? ' addcontentblock ' : '') + 'modeadvanced ',
        contextmenu: 'charmap hr' + (settings.enableContentBlocks ? ' addcontentblock' : '')
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
    // return modes;
  }

  getDefaultOptions = (settings) => {
    const modes = this.buildModes(settings);
    const svc = this.svc();
    return {
      // baseURL: svc.cdnRoot, // main script is loaded as a dependency to this webcomponent in eav-field.directive.ts
      inline: true, // use the div, not an iframe
      fixed_toolbar_container: '.' + settings.toolbarContainerClass,
      automatic_uploads: false, // we're using our own upload mechanism
      modes: modes, // for later switch to another mode
      menubar: modes.standard.menubar, // basic menu (none)
      toolbar: modes.standard.toolbar, // basic toolbar
      plugins: svc.plugins.join(' '),
      contextmenu: modes.standard.contextmenu, // 'link image | charmap hr adamimage',
      autosave_ask_before_unload: false,
      paste_as_text: true,
      extended_valid_elements: svc.validateAlso,
      // '@[class]' // allow classes on all elements,
      // + ',i' // allow i elements (allows icon-font tags like <i class='fa fa-...'>)
      // + ',hr[sxc|guid]', // experimental: allow inline content-blocks
      custom_elements: 'hr',

      // Url Rewriting in images and pages
      // convert_urls: false,  // don't use this, would keep the domain which is often a test-domain
      // keep urls with full path so starting with a '/' - otherwise it would rewrite them to a '../../..' syntax
      relative_urls: false,
      default_link_target: '_blank', // auto-use blank as default link-target
      object_resizing: false, // don't allow manual scaling of images

      // General looks
      skin: 'oxide',
      theme: 'silver',
      statusbar: true,    // doesn't work in inline :(

      language: svc.defaultLanguage,

      debounce: false, // DONT slow-down model updates - otherwise we sometimes miss the last changes
    };
  }

  // add paste wysiwyg ability feature if enabled
  getPasteWysiwygAbilityOptions = () => {
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

      paste_preprocess: function (e, args) {
        console.log('stv paste preprocess', e, args);
      },

      paste_postprocess: function (plugin, args) {
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

  // add paste wysiwyg ability feature if enabled
  getPasteImageOptions = (uploadUrl: string, headers: HttpHeaders) => {
    return {
      automatic_uploads: true,
      images_reuse_filename: true,
      paste_data_images: true,
      paste_filter_drop: false,
      paste_block_drop: false,
      images_upload_url: uploadUrl,
      images_upload_base_path: '/images_upload_base_path/',
      images_upload_handler: this.imagesUploadHandler,
      upload_headers: headers,
    };
  }

  private imagesUploadHandler = (blobInfo, success, failure) => {
    const settings = (window as any).tinymce.activeEditor.settings;

    const formData = new FormData();
    formData.append('file', blobInfo.blob(), blobInfo.filename());

    console.log('stv upload', settings);

    this.http.post<any>(settings.images_upload_url, formData, { headers: settings.upload_headers }).pipe(
      map(({ Path }) => Path),
      tap(imagePath => success(imagePath)),
      catchError(e => of(failure(e))),
    ).subscribe();
  }

  setLanguageOptions = (currentLang, options) => {
    // check if it's an additionally translated language and load the translations
    const lang2 = currentLang.substr(0, 2); //  /* 'de' */
    if (this.svc().languages.indexOf(lang2) >= 0) {
      options = Object.assign(options, {
        language: lang2,
        language_url: '/DesktopModules/ToSIC_SexyContent/dist/i18n/lib/tinymce/' + lang2 + '.js'
      });
    }
    return options;
  }

  // added tinymce
  addTranslations(language, translateService, tinymce) {
    const primaryLan = this.svc().defaultLanguage;
    const keys = [], mceTranslations = {}, prefix = 'Extension.TinyMce', prefixDot = 'Extension.TinyMce.'; //  pLen = prefix.length;

    // find all relevant keys by querying the primary language
    // var all = translateService.getTranslationTable(primaryLan);
    const all = translateService.translations[primaryLan];
    // ReSharper disable once MissingHasOwnPropertyInForeach
    for (const key in all) {
      if (key.indexOf(prefix) === 0) {
        keys.push(key);
      }
    }

    const translations = translateService.instant(keys);

    for (let k = 0; k < keys.length; k++) {
      mceTranslations[keys[k].replace(prefixDot, '')] = translations[keys[k]];
    }

    tinymce.addI18n(language, translations[keys[0]]);
  }
}

