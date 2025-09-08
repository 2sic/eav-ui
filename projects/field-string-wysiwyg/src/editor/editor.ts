// Important! tinymce has to be imported before themes and plugins
// So this group of imports has to be first
import 'tinymce/tinymce';
// Keep at least one empty line after this, to ensure order of imports!

// Import all the plugins and themes to ensure it's in the bundle
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

import { Subscription } from 'rxjs';
// tslint:disable-next-line: no-duplicate-imports
import type { Editor, EditorEvent } from 'tinymce/tinymce';
import { classLog } from '../../../../projects/eav-ui/src/app/shared/logging';
import { Connector } from '../../../edit-types/src/Connector';
import { EavCustomInputField } from '../../../edit-types/src/EavCustomInputField';
import { WysiwygReconfigure } from '../../../edit-types/src/WysiwygReconfigure';
import { tinyMceBaseUrl, wysiwygEditorHtmlTag } from '../../internal-constants';
import { WysiwygConstants } from '../../shared/wysiwyg.constants';
import { RawEditorOptionsExtended } from '../config/raw-editor-options-extended';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import { TranslationsLoader } from '../config/translation-loader';
import { AddEverythingToRegistry } from '../config/ui-registry/add-everything-to-registry';
import { attachAdam } from '../connector/adam';
import * as WysiwygDialogModes from '../constants/display-modes';
import { buildTemplate } from '../shared/helpers';
import { connectorToDisabled$, registerCustomElement } from './editor-helpers';
import * as template from './editor.html';
import * as styles from './editor.scss';
import { fixMenuPositions } from './fix-menu-positions.helper';
import * as skinOverrides from './skin-overrides.scss';

const logSpecs = {
  all: false,
  constructor: true,
  connectedCallback: true,
  disconnectedCallback: true,
  TinyMceInitialized: false,
  PastePreProcess: true,
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

  #editorContent: string; // saves editor content to prevent slow update when first using editor
  #subscriptions = new Subscription();
  #editor: Editor;
  #isDrop = false;
  #firstInit: boolean;
  #dialogIsOpen: boolean;
  #menuObserver: MutationObserver;

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
    l.end();
  }

  #tinyMceScriptLoaded(): void {
    this.log.a(`tinyMceScriptLoaded`);

    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      this.#containerClass,
      this.#toolbarContainerClass,
      this.mode === 'inline',
      // setup callback when the editor is initialized by TinyMCE
      (editor: Editor) => this.#tinyMceSetup(editor, tinyOptions),
    );

    this.#firstInit = true;
    this.configurator.addTranslations();
    window.tinymce.baseURL = tinyMceBaseUrl;
    window.tinymce.init(tinyOptions);
  }

  /** This will initialized an instance of an editor. Everything else is kind of global. */
  #tinyMceSetup(editor: Editor, rawEditorOptions: RawEditorOptionsExtended): void {

    // Capture Ctrl + Enter to prevent inserting a line break in the WYSIWYG editor 
    editor.on('keydown', (event: KeyboardEvent) => {
      if (event.ctrlKey && event.key === "Enter")
        event.preventDefault();
    });

    const pasteImage = this.connector._experimental.isFeatureEnabled['PasteImageFromClipboard'];
    this.#editor = editor;
    editor.on('init', _event => {
      const l = this.log.fnIf('TinyMceInitialized', { editor });
      this.reconfigure?.editorOnInit?.(editor);

      new AddEverythingToRegistry({
        field: this,
        editor,
        adam: this.connector._experimental.adam,
        options: rawEditorOptions,
      }).register();

      if (!this.reconfigure?.disableAdam)
        attachAdam(editor, this.connector._experimental.adam);

      this.#menuObserver = fixMenuPositions(this);

      // Shared subscriptions
      this.#subscriptions.add(
        this.connector.data.value$.subscribe(newValue => {
          if (this.#editorContent === newValue) return;
          this.#editorContent = newValue;
          editor.setContent(this.#editorContent);
        })
      );
      this.#subscriptions.add(
        connectorToDisabled$(this.connector).subscribe(disabled => {
          this.log.a(`Field config disabled`, { disabled, mode: editor.mode.get() });
          this.classList.toggle('disabled', disabled);
          this.#editor.mode.set(disabled ? 'readonly' : 'design');
        }),
      );

      const delayFocus = () => setTimeout(() => editor.focus(false), 100);

      // If not inline mode always focus on init
      if (this.mode !== WysiwygDialogModes.DisplayInline)
        delayFocus();
      else {
        // If is inline mode skip focus on first init
        if (!this.#firstInit)
          delayFocus()

        // Inline only subscriptions
        this.#subscriptions.add(this.connector._experimental.isExpanded$.subscribe(isExpanded => {
          this.#dialogIsOpen = isExpanded;

          if (!this.#firstInit && !this.#dialogIsOpen)
            delayFocus();
        }));
      }
      this.#firstInit = false;
    });

    // called after TinyMCE editor is removed
    editor.on('remove', _event => {
      this.log.a(`TinyMCE removed`, _event);
      this.#clearData();
    });

    // called before PastePreProcess
    // this is needed so drag and drop will function even if pasteClipboardImage feature is false
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('drop', _event => { this.#isDrop = true });

    // called before PastePreProcess
    // this is needed so paste will only work depending on pasteClipboardImage feature
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('paste', _event => { this.#isDrop = false });

    // called before actual image upload so _event.preventDefault(); can stop pasting
    // this is needed because only here we can read clipboard content
    editor.on('PastePreProcess', event => {
      const l = this.log.fnIf('PastePreProcess', { event });
      if (!pasteImage() && event.content.startsWith('<img src=') && !this.#isDrop) {
        event.preventDefault();
        this.connector._experimental.featureDisabledWarning('PasteImageFromClipboard');
        return l.end('disabled');
      }
      l.end('enabled');
    });

    const handleFocus = (focused: boolean, _event: EditorEvent<unknown>) => {
      this.classList.toggle('focused', focused);
      this.log.a(`TinyMCE focused ${focused}`, _event);
      if (this.mode === 'inline')
        this.connector._experimental.setFocused(focused);
    };

    editor.on('focus', _event => {
      handleFocus(true, _event);
      if (!this.reconfigure?.disableAdam)
        attachAdam(editor, this.connector._experimental.adam);
    });

    editor.on('blur', _event => {
      handleFocus(false, _event);
    });

    // on change, undo and redo, save/push the value
    ['change', 'undo', 'redo', 'input'].forEach(name => editor.on(name, () => this.#saveValue()));

    // if the system has a reconfigure object, run it's code now
    this.reconfigure?.configureEditor?.(editor);
  }

  #saveValue(): void {
    const l = this.log.fn(`saveValue`);
    // Check what's new
    let newContent = this.#editor.getContent();

    // If the new thing is an image in the middle of an upload,
    // exit and wait for the change to be finalized
    if (newContent.includes('<img src="data:image'))
      return;

    // this is necessary for adding data-cmsid attribute to image attributes
    if (newContent.includes("?tododata-cmsid=")) {
      // imageStrings becomes array of strings where every string except first starts with 'imageName"'
      let imageStrings = newContent.split("?tododata-cmsid=");
      newContent = "";
      imageStrings.forEach((x, i) => {
        // after each string in array except last one we add '" data-cmsid="file:' attribute
        if (i != imageStrings.length - 1)
          newContent += x + '" data-cmsid="file:';
        else
          newContent += x;
      });
      this.#editor.setContent(newContent);
    }
    // remember for change detection
    this.#editorContent = newContent;

    // broadcast the change
    this.connector.data.update(this.#editorContent);
    l.end('done')
  }

  #clearData(): void {
    this.#subscriptions.unsubscribe();
    this.#editor?.destroy();
    this.#editor?.remove();
    this.#editorContent = null;
    this.#menuObserver?.disconnect();
    this.#menuObserver = null;
  }

  disconnectedCallback(): void {
    this.log.fnIf('disconnectedCallback');
    this.#clearData();
  }
}

// Register the custom element
registerCustomElement(wysiwygEditorHtmlTag, FieldStringWysiwygEditor);
