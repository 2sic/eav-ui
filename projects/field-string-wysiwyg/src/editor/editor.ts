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
import { tinyMceBaseUrl, wysiwygEditorHtmlTag } from '../../internal-constants';
import { WysiwygConstants } from '../../shared/wysiwyg.constants';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { TranslationsLoader } from '../config/translation-loader';
import { buildTemplate } from '../shared/helpers';
import { registerCustomElement } from './editor-helpers';
import * as template from './editor.html';
import * as styles from './editor.scss';
import * as skinOverrides from './skin-overrides.scss';
import { TinyMceBuilder } from './tiny-mce-setup';

const logSpecs = {
  all: false,
  constructor: true,
  connectedCallback: true,
  disconnectedCallback: true,
  TinyMceInitialized: false,
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

  /** Responsible for configuring TinyMCE */
  configurator: TinyMceConfigurator;

  /** random, unique ID for this instance of the editor to keep them separate */
  #instanceId = `${Math.floor(Math.random() * 99999)}`;

  /** class to uniquely identify this editor */
  #containerClass = `tinymce-container-${this.#instanceId}`;

  /** class to uniquely identify the toolbar area */
  #toolbarContainerClass = `tinymce-toolbar-container-${this.#instanceId}`;

  /** Class to add to the DOM so the surrounding Dropzone does everything right */
  #adamIntegrationClass = WysiwygConstants.classToDetectWysiwyg;

  #editor: Editor;
  firstInit: boolean;
  dialogIsOpen: boolean;
  #tinyMceBuilder = new TinyMceBuilder();

  constructor() {
    super();
    this.log.fnIf('constructor');
  }

  /** This will be called by the system once the data is ready */
  // connectedCallback call by FieldStringWysiwyg
  connectedCallback(): void {
    if (this.fieldInitialized)
      return;

    this.fieldInitialized = true;
    const l = this.log.fnIf('connectedCallback');

    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector<HTMLDivElement>('.tinymce-container').classList.add(this.#containerClass, this.#adamIntegrationClass);
    this.querySelector<HTMLDivElement>('.tinymce-toolbar-container').classList.add(this.#toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');

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

  #tinyMceScriptLoaded(): void {
    this.log.a(`tinyMceScriptLoaded`);

    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      {
        selectorClass: this.#containerClass,
        fixedToolbarClass: this.#toolbarContainerClass,
        modeIsInline: this.mode === 'inline',
        isDebug: this.connector._experimental.isDebug(),
        // setup callback when the editor is initialized by TinyMCE
        setup: (editor: Editor) => {
          this.#editor = editor; // remember to later clean up
          // must always create a new builder, as the previous one has probably been cleaned up
          this.#tinyMceBuilder = this.#tinyMceBuilder.isKilled
            ? new TinyMceBuilder()
            : this.#tinyMceBuilder;
          this.#tinyMceBuilder.onInit(this, editor, tinyOptions)
        },
      },
    );

    this.firstInit = true;
    this.configurator.addTranslations();
    window.tinymce.baseURL = tinyMceBaseUrl;
    window.tinymce.init(tinyOptions);
  }

  /**
   * System callback if the editor is removed from the DOM, but also called by this class when the editor is removed (see onInit) to do cleanup.
   */
  disconnectedCallback(): void {
    this.log.fnIf('disconnectedCallback');
    // Do cleanup
    this.#tinyMceBuilder?.cleanup();
    this.#tinyMceBuilder = null;
    this.#editor?.destroy();
    this.#editor?.remove();
  }
}

// Register the custom element
registerCustomElement(wysiwygEditorHtmlTag, FieldStringWysiwygEditor);
