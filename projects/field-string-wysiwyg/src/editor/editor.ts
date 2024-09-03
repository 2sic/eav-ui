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

import { BehaviorSubject, distinctUntilChanged, Subscription } from 'rxjs';
// tslint:disable-next-line: no-duplicate-imports
import type { Editor } from 'tinymce/tinymce';
import { EavWindow } from '../../../eav-ui/src/app/shared/models/eav-window.model';
import { Connector, EavCustomInputField, WysiwygReconfigure } from '../../../edit-types';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import * as WysiwygDialogModes from '../constants/display-modes';
import { RawEditorOptionsExtended } from '../config/raw-editor-options-extended';
import { TranslationsLoader } from '../config/translation-loader';
import { AddEverythingToRegistry } from '../config/ui-registry/add-everything-to-registry';
import { attachAdam } from '../connector/adam';
import { tinyMceBaseUrl, wysiwygEditorHtmlTag } from '../../internal-constants';
import { buildTemplate } from '../shared/helpers';
import * as template from './editor.html';
import * as styles from './editor.scss';
import { fixMenuPositions } from './fix-menu-positions.helper';
import * as skinOverrides from './skin-overrides.scss';
import { EavLogger } from '../../../../projects/eav-ui/src/app/shared/logging/eav-logger';
import { connectorToDisabled$, registerCustomElement } from './editor-helpers';
import { DropzoneWysiwyg } from '../../../eav-ui/src/app/edit/fields/wrappers/dropzone/dropzone-wysiwyg';
import { effect, runInInjectionContext } from '@angular/core';

const logThis = false;
const nameOfThis = 'FieldStringWysiwygEditor';

declare const window: EavWindow;

/**
 * Class which is an HTML element containing the WYSIWYG editor.
 * It is registered as a custom-element in the browser (below)
 */
export class FieldStringWysiwygEditor extends HTMLElement implements EavCustomInputField<string> {
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
  #adamIntegrationClass = DropzoneWysiwyg.classToDetectWysiwyg;

  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteClipboardImage$ = new BehaviorSubject<boolean>(false);
  private subscriptions: Subscription = new Subscription();
  private editor: Editor;
  private isDrop = false;
  private firstInit: boolean;
  private dialogIsOpen: boolean;
  private menuObserver: MutationObserver;

  private log = new EavLogger(nameOfThis, logThis);

  constructor() {
    super();
    this.log.a(`constructor`);
  }

  /** This will be called by the system once the data is ready */
  connectedCallback(): void {
    if (this.fieldInitialized)
      return;

    this.fieldInitialized = true;
    this.log.a(`connectedCallback`);

    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector<HTMLDivElement>('.tinymce-container').classList.add(this.#containerClass, this.#adamIntegrationClass);
    this.querySelector<HTMLDivElement>('.tinymce-toolbar-container').classList.add(this.#toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');

    // ensure it respects activated features for Paste-Image
    this.subscriptions.add(this.connector._experimental.isFeatureEnabled$('PasteImageFromClipboard')
      .pipe(distinctUntilChanged())
      .subscribe(this.pasteClipboardImage$)
    );

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
      () => this.tinyMceScriptLoaded(),
    );

    this.connector._experimental.dropzone.setConfig({ disabled: false });
  }

  private tinyMceScriptLoaded(): void {
    this.log.a(`tinyMceScriptLoaded`);

    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      this.#containerClass,
      this.#toolbarContainerClass,
      this.mode === 'inline',
      // setup callback when the editor is initialized by TinyMCE
      (editor: Editor) => this.tinyMceSetup(editor, tinyOptions),
    );

    this.firstInit = true;
    this.configurator.addTranslations();
    window.tinymce.baseURL = tinyMceBaseUrl;
    window.tinymce.init(tinyOptions);
  }

  /** This will initialized an instance of an editor. Everything else is kind of global. */
  private tinyMceSetup(editor: Editor, rawEditorOptions: RawEditorOptionsExtended): void {
    this.editor = editor;
    editor.on('init', _event => {
      this.log.a(`TinyMCE initialized`, {editor});
      this.reconfigure?.editorOnInit?.(editor);

      new AddEverythingToRegistry({
        field: this,
        editor,
        adam: this.connector._experimental.adam,
        options: rawEditorOptions,
      }).register();

      if (!this.reconfigure?.disableAdam)
        attachAdam(editor, this.connector._experimental.adam);

      this.menuObserver = fixMenuPositions(this);

      // Shared subscriptions
      this.subscriptions.add(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) return;
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        })
      );
      this.subscriptions.add(
        connectorToDisabled$(this.connector).subscribe(disabled => {
          this.log.a(`Field config disabled`, { disabled, mode: editor.mode.get() });
          this.classList.toggle('disabled', disabled);
          this.editor.mode.set(disabled ? 'readonly' : 'design');
        }),
      );

      // // new with effects
      // // runInInjectionContext(this.connector._experimental.injector, () => {
      //   effect(() => {
      //     const disabled = this.connector.fieldConfigSignal().disabled;
      //     this.log.a(`Field config disabled with effect`, { disabled, mode: editor.mode.get() });
      //     this.classList.toggle('disabled', disabled);
      //     this.editor.mode.set(disabled ? 'readonly' : 'design');
      //   }, { injector: this.connector._experimental.injector });
      // // });

      const delayFocus = () => setTimeout(() => editor.focus(false), 100);

      // If not inline mode always focus on init
      if (this.mode !== WysiwygDialogModes.DisplayInline)
        delayFocus();
      else {
        // If is inline mode skip focus on first init
        if (!this.firstInit)
          delayFocus()

        // Inline only subscriptions
        this.subscriptions.add(this.connector._experimental.isExpanded$.subscribe(isExpanded => {
          this.dialogIsOpen = isExpanded;

          if (!this.firstInit && !this.dialogIsOpen)
            delayFocus();
        }));
      }
      this.firstInit = false;
    });

    // called after TinyMCE editor is removed
    editor.on('remove', _event => {
      this.log.a(`TinyMCE removed`, _event);
      this.clearData();
    });

    // called before PastePreProcess
    // this is needed so drag and drop will function even if pasteClipboardImage feature is false
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('drop', _event => { this.isDrop = true });

    // called before PastePreProcess
    // this is needed so paste will only work depending on pasteClipboardImage feature
    // important: the { ... } brackets are necessary for `this` to be the correct object
    editor.on('paste', _event => { this.isDrop = false });

    // called before actual image upload so _event.preventDefault(); can stop pasting
    // this is needed beacuse only here we can read clipboard content
    editor.on('PastePreProcess', _event => {
      if (!this.pasteClipboardImage$.value && _event.content.startsWith('<img src=') && !this.isDrop) {
        _event.preventDefault();
        this.connector._experimental.featureDisabledWarning('PasteImageFromClipboard');
      }
    });

    editor.on('focus', _event => {
      this.classList.add('focused');
      this.log.a(`TinyMCE focused`, _event);
      if (!this.reconfigure?.disableAdam)
        attachAdam(editor, this.connector._experimental.adam);

      if (this.mode === 'inline')
        this.connector._experimental.setFocused(true);
    });

    editor.on('blur', _event => {
      this.classList.remove('focused');
      this.log.a(`TinyMCE blurred`, _event);
      if (this.mode === 'inline')
        this.connector._experimental.setFocused(false);
    });

    // on change, undo and redo, save/push the value
    editor.on('change', () => this.saveValue());
    editor.on('undo', () => this.saveValue());
    editor.on('redo', () => this.saveValue());
    this.reconfigure?.configureEditor?.(editor);
  }

  private saveValue(): void {
    // Check what's new
    let newContent = this.editor.getContent();

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
      this.editor.setContent(newContent);
    }
    // remember for change detection
    this.editorContent = newContent;

    // broadcast the change
    this.connector.data.update(this.editorContent);
  }

  private clearData(): void {
    this.subscriptions.unsubscribe();
    this.editor?.destroy();
    this.editor?.remove();
    this.editorContent = null;
    this.menuObserver?.disconnect();
    this.menuObserver = null;
  }

  disconnectedCallback(): void {
    this.log.a(`disconnectedCallback`);
    this.clearData();
    this.subscriptions.unsubscribe();
  }
}

// Register the custom element
registerCustomElement(wysiwygEditorHtmlTag, FieldStringWysiwygEditor);
