// Important! tinymce has to be imported before themes and plugins
// So this group of imports has to be first
import 'tinymce/tinymce';
// Keep at least one empty line after this, to ensure order of imports!

// Import all the plugins and themes to ensure it's in the bundle
import '@pangaeatech/tinymce-paste-from-word-plugin';
import 'tinymce/icons/default';
import 'tinymce/models/dom';
import 'tinymce/plugins/anchor';
import 'tinymce/plugins/autolink';
import 'tinymce/plugins/charmap';
import 'tinymce/plugins/code';
import 'tinymce/plugins/image';
import 'tinymce/plugins/link';
import 'tinymce/plugins/lists';
import 'tinymce/plugins/media';
import 'tinymce/plugins/nonbreaking';
import 'tinymce/plugins/searchreplace';
import 'tinymce/plugins/table';
import 'tinymce/themes/silver';
// Keep at least one empty line after this, to ensure order of imports!

// tslint:disable-next-line: no-duplicate-imports
import type { Editor } from 'tinymce/tinymce';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { classLog } from '../../../shared/logging';
import { WysiwygConstants } from '../../shared/wysiwyg.constants';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { TranslationsLoader } from '../config/translation-loader';
import { tinyMceBaseUrl } from '../constants/internal-constants';
import { TinyMceSetup } from '../editor/tiny-mce-setup';
import * as template from './field-string-wysiwyg-editor.html';
import * as styles from './field-string-wysiwyg-editor.scss';
import { buildHtmlAndStyles } from './html-helpers';
import { registerCustomElement } from './register-custom-element';
import * as skinOverrides from './skin-overrides.scss';

export const wysiwygEditorHtmlTag = 'field-string-wysiwyg-editor';

const logSpecs = {
  all: false,
  constructor: true,
  connectedCallback: true,
  disconnectedCallback: true,
  setupDom: true,
  TinyMceInitialized: false,
  tinyMceScriptLoaded: true,
  setup: true,
  cleanup: true,
};

/**
 * Class which is an HTML element containing the WYSIWYG editor.
 * It is registered as a custom-element in the browser (below)
 * Start dev-wysiwyg
 * connectedCallback call by FieldStringWysiwyg
 */
export class FieldStringWysiwygEditor extends HTMLElement implements EavCustomInputField<string> {

  log = classLog({ FieldStringWysiwygEditor }, logSpecs);

  fieldInitialized = false;
  connector: Connector<string>;
  mode?: 'inline' | 'normal';
  reconfigure?: WysiwygReconfigure;

  /** Responsible for configuring TinyMCE, will be created later on connectedCallback */
  configurator: TinyMceConfigurator;

  /** random, unique ID for this instance of the editor to keep them separate */
  #instanceId = `${Math.floor(Math.random() * 99999)}`;

  /** class to uniquely identify this editor */
  #containerClass = `tinymce-container-${this.#instanceId}`;

  /** class to uniquely identify the toolbar area */
  #toolbarContainerClass = `tinymce-toolbar-container-${this.#instanceId}`;

  #editor: Editor;
  firstInit: boolean;
  dialogIsOpen: boolean;
  #tinyMceSetup = new TinyMceSetup();

  constructor() {
    super();
    this.log.fnIf('constructor');
  }

  /**
   * connectedCallback call by FieldStringWysiwyg
   * This will be called by the system once the data is ready
   */
  connectedCallback(): void {
    const l = this.log.fnIf(`connectedCallback`, { fieldInitialized: this.fieldInitialized });
    
    if (this.fieldInitialized)
      return l.end();
    this.fieldInitialized = true;

    // Create dom with classes having a unique, random ID
    // so we can be sure to target the right elements when we load tinyMCE,
    // even if there are multiple editors on the page
    this.#setupDom();

    // Figure out what language tinyMce should use
    const tinyLang = TranslationsLoader.fixTranslationKey(this.connector._experimental.translateService.currentLang);

    // Tell the system to load some scripts / language resources, and then trigger the next step
    this.connector.loadScript(
      [
        {
          test: () => tinyLang === 'en' || Object.keys(window.tinymce.i18n.getData()).includes(tinyLang),
          src: `${tinyMceBaseUrl}/i18n/${tinyLang}.js`,
        },
      ],
      () => this.#tinyMceScriptLoaded(),
    );

    this.connector._experimental.dropzone.setConfig({ disabled: false });
    
    // experimental debug info
    l.a(`Debug info for this connector:`, { isDebug: this.connector._experimental.isDebug() });

    this.connector._experimental.debugWatch(isDebug => {
      l.a(`Debug mode changed:`, { isDebug });
    });

    l.end();

  }

  #setupDom(): void {
    const l = this.log.fnIf('setupDom');
    // add the unique classes to the DOM so tiny-mce can find the right container to load into
    this.innerHTML = buildHtmlAndStyles(template.default, styles.default + skinOverrides.default);
    this.querySelector<HTMLDivElement>('.tinymce-container').classList.add(
      // Class so tiny-mce can find the container to load the editor into
      this.#containerClass,
      // Class to add to the DOM so the surrounding Dropzone does everything right
      WysiwygConstants.classToDetectWysiwyg
    );
    this.querySelector<HTMLDivElement>('.tinymce-toolbar-container').classList.add(this.#toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');
    l.end();
  }


  #tinyMceScriptLoaded(): void {
    const l = this.log.fnIf(`tinyMceScriptLoaded`);

    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      {
        selectorClass: this.#containerClass,
        fixedToolbarClass: this.#toolbarContainerClass,
        modeIsInline: this.mode === 'inline',
        isDebug: this.connector._experimental.isDebug(),
        // setup callback when the editor is initialized by TinyMCE
        setup: (editor: Editor) => {
          const lSetup = this.log.fnIf('setup');
          this.#editor = editor; // remember to later clean up
          // must always create a new builder, as the previous one has probably been cleaned up
          this.#tinyMceSetup = this.#tinyMceSetup?.isKilled ?? true
            ? new TinyMceSetup()
            : this.#tinyMceSetup;
          this.#tinyMceSetup.onInit(this, editor, tinyOptions);

          // called after TinyMCE editor is removed
          // this should be here, as it's responsibility is on this class
          editor.on('remove', _event => {
            this.log.a(`TinyMCE removed`, _event);
            this.cleanup();
          });
          lSetup.end();
        },
      },
    );

    this.firstInit = true;
    this.configurator.addTranslations();
    window.tinymce.baseURL = tinyMceBaseUrl;
    window.tinymce.init(tinyOptions);
    l.end();
  }

  /**
   * System callback if the editor is removed from the DOM, but also called by this class when the editor is removed (see onInit) to do cleanup.
   */
  disconnectedCallback(): void {
    const l = this.log.fnIf('disconnectedCallback');
    this.cleanup();
    l.end();
  }
  cleanup(): void {
    const l = this.log.fnIf('cleanup');
    // Do cleanup
    this.#tinyMceSetup?.cleanup();
    this.#tinyMceSetup = null;
    this.#editor?.destroy();
    this.#editor?.remove();
    l.end();
  }
}

// Register the custom element
registerCustomElement(wysiwygEditorHtmlTag, FieldStringWysiwygEditor);
