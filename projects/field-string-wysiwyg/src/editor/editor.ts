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
import { consoleLogWebpack } from '../../../field-custom-gps/src/shared/console-log-webpack.helper';
import { TinyMceConfigurator } from '../config/tinymce-configurator';
import * as WysiwygDialogModes from '../constants/display-modes';
import { RawEditorOptionsExtended } from '../config/raw-editor-options-extended';
import { TinyMceTranslations } from '../config/translations';
import { AddEverythingToRegistry } from '../config/ui-registry/add-everything-to-registry';
import { attachAdam } from '../connector/adam';
import { tinyMceBaseUrl, wysiwygEditorHtmlTag } from '../../internal-constants';
import { buildTemplate } from '../shared/helpers';
import * as template from './editor.html';
import * as styles from './editor.scss';
import { fixMenuPositions } from './fix-menu-positions.helper';
import * as skinOverrides from './skin-overrides.scss';

declare const window: EavWindow;

export class FieldStringWysiwygEditor extends HTMLElement implements EavCustomInputField<string> {
  fieldInitialized: boolean;
  connector: Connector<string>;
  mode?: 'inline' | 'normal';
  reconfigure?: WysiwygReconfigure;
  /** Responsible for configuring TinyMCE */
  configurator: TinyMceConfigurator;

  private instanceId: string;
  private containerClass: string;
  private toolbarContainerClass: string;
  private subscriptions: Subscription[];
  private editorContent: string; // saves editor content to prevent slow update when first using editor
  private pasteClipboardImage$ = new BehaviorSubject<boolean>(false);
  private subscription: Subscription = new Subscription();
  private editor: Editor;
  private isDrop: boolean = false;
  private firstInit: boolean;
  private dialogIsOpen: boolean;
  private menuObserver: MutationObserver;

  constructor() {
    super();
    consoleLogWebpack(`${wysiwygEditorHtmlTag} constructor called`);
    this.subscriptions = [];
    this.fieldInitialized = false;
    this.instanceId = `${Math.floor(Math.random() * 99999)}`;
    this.containerClass = `tinymce-container-${this.instanceId}`;
    this.toolbarContainerClass = `tinymce-toolbar-container-${this.instanceId}`;
  }

  connectedCallback(): void {
    if (this.fieldInitialized) { return; }
    this.fieldInitialized = true;
    consoleLogWebpack(`${wysiwygEditorHtmlTag} connectedCallback called`);

    this.innerHTML = buildTemplate(template.default, styles.default + skinOverrides.default);
    this.querySelector<HTMLDivElement>('.tinymce-container').classList.add(this.containerClass);
    this.querySelector<HTMLDivElement>('.tinymce-toolbar-container').classList.add(this.toolbarContainerClass);
    this.classList.add(this.mode === 'inline' ? 'inline-wysiwyg' : 'full-wysiwyg');
    this.subscription.add(this.connector._experimental.isFeatureEnabled$('PasteImageFromClipboard')
      .pipe(distinctUntilChanged())
      .subscribe(this.pasteClipboardImage$)
    );

    const tinyLang = TinyMceTranslations.fixTranslationKey(this.connector._experimental.translateService.currentLang);
    this.connector.loadScript(
      [
        {
          test: () => tinyLang === 'en' || Object.keys(window.tinymce.i18n.getData()).includes(tinyLang),
          src: `${tinyMceBaseUrl}/i18n/${tinyLang}.js`,
        },
      ],
      () => {
        this.tinyMceScriptLoaded();
      }
    );

    this.connector._experimental.dropzone.setConfig({ disabled: false });
  }

  private tinyMceScriptLoaded(): void {
    consoleLogWebpack(`${wysiwygEditorHtmlTag} tinyMceScriptLoaded called`);
    this.configurator = new TinyMceConfigurator(this.connector, this.reconfigure);
    const tinyOptions = this.configurator.buildOptions(
      this.containerClass,
      this.toolbarContainerClass,
      this.mode === 'inline',
      (editor: Editor) => { this.tinyMceSetup(editor, tinyOptions); },
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
      consoleLogWebpack(`${wysiwygEditorHtmlTag} TinyMCE initialized`, editor);
      this.reconfigure?.editorOnInit?.(editor);
      new AddEverythingToRegistry({ field: this, editor, adam: this.connector._experimental.adam, options: rawEditorOptions }).register();
      if (!this.reconfigure?.disableAdam) {
        attachAdam(editor, this.connector._experimental.adam);
      }
      this.menuObserver = fixMenuPositions(this);
      // Shared subscriptions
      this.subscriptions.push(
        this.connector.data.value$.subscribe(newValue => {
          if (this.editorContent === newValue) { return; }
          this.editorContent = newValue;
          editor.setContent(this.editorContent);
        }),
        this.connector.field$.subscribe(fieldConfig => {
          if (fieldConfig.settings.Disabled) {
            this.classList.add('disabled');
          } else {
            this.classList.remove('disabled');
          }
        }),
      );
      if (this.mode !== WysiwygDialogModes.DisplayInline) {
        setTimeout(() => { editor.focus(false); }, 100); // If not inline mode always focus on init
      } else {
        if (!this.firstInit) { setTimeout(() => { editor.focus(false); }, 100); } // If is inline mode skip focus on first init
        // Inline only subscriptions
        this.subscriptions.push(this.connector._experimental.isExpanded$.subscribe(isExpanded => {
          this.dialogIsOpen = isExpanded;

          if (!this.firstInit && !this.dialogIsOpen) { setTimeout(() => { editor.focus(false); }, 100); }
        }));
      }
      this.firstInit = false;
    });

    // called after TinyMCE editor is removed
    editor.on('remove', _event => {
      consoleLogWebpack(`${wysiwygEditorHtmlTag} TinyMCE removed`, _event);
      this.clearData();
    });

    // called before PastePreProcess
    // this is needed so drag and drop will function even if pasteClipboardImage feature is false
    editor.on('drop', _event => {
      this.isDrop = true;
    });

    // called before PastePreProcess
    // this is needed so paste will only work depending on pasteClipboardImage feature
    editor.on('paste', _event => {
      this.isDrop = false;
    });

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
      consoleLogWebpack(`${wysiwygEditorHtmlTag} TinyMCE focused`, _event);
      if (!this.reconfigure?.disableAdam) {
        attachAdam(editor, this.connector._experimental.adam);
      }
      if (this.mode === 'inline') {
        this.connector._experimental.setFocused(true);
      }
    });

    editor.on('blur', _event => {
      this.classList.remove('focused');
      consoleLogWebpack(`${wysiwygEditorHtmlTag} TinyMCE blurred`, _event);
      if (this.mode === 'inline') {
        this.connector._experimental.setFocused(false);
      }
    });

    editor.on('change', () => { this.saveValue(); });
    editor.on('undo', () => { this.saveValue(); });
    editor.on('redo', () => { this.saveValue(); });
    this.reconfigure?.configureEditor?.(editor);
  }

  private saveValue(): void {
    let newContent = this.editor.getContent();
    if (newContent.includes('<img src="data:image')) { return; }

    // this is necessary for adding data-cmsid attribute to image attributes
    if (newContent.includes("?tododata-cmsid=")) {
      let imageStrings = newContent.split("?tododata-cmsid=file:");
      newContent = "";
      imageStrings.forEach((x, i) => {
        if (i != imageStrings.length - 1)
          newContent += x + '" data-cmsid="file:';
        else
          newContent += x;
      });
      this.editor.setContent(newContent);
    }

    this.editorContent = newContent;
    this.connector.data.update(this.editorContent);
  }

  private clearData(): void {
    this.subscriptions.forEach(subscription => {
      subscription.unsubscribe();
    });
    this.subscriptions = [];
    this.editor?.destroy();
    this.editor?.remove();
    this.editorContent = null;
    this.menuObserver?.disconnect();
    this.menuObserver = null;
  }

  disconnectedCallback(): void {
    consoleLogWebpack(`${wysiwygEditorHtmlTag} disconnectedCallback called`);
    this.clearData();
    this.subscription.unsubscribe();
  }
}

if (!customElements.get(wysiwygEditorHtmlTag)) {
  customElements.define(wysiwygEditorHtmlTag, FieldStringWysiwygEditor);
}
