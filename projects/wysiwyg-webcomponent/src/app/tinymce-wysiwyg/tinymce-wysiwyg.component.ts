import { Component, OnInit, Input } from '@angular/core';
import { TinymceWysiwygConfig } from '../services/tinymce-wysiwyg-config';
import { TinyMceDnnBridgeService } from '../services/tinymce-dnnbridge-service';
import { TinyMceToolbarButtons } from '../services/tinymce-wysiwyg-toolbar';
import { FormGroup } from '@angular/forms';
import { TranslateService } from '@ngx-translate/core';
import { TinyMceAdamService } from '../services/tinymce-adam-service';
// import tinymceWysiwygConfig from './tinymce-wysiwyg-config.js'
// import { addTinyMceToolbarButtons } from './tinymce-wysiwyg-toolbar.js'
// import { attachAdam } from './tinymce-adam-service.js'
// import { attachDnnBridgeService } from './tinymce-dnnbridge-service.js';

@Component({
  selector: 'app-tinymce-wysiwyg',
  templateUrl: './tinymce-wysiwyg.component.html',
  styleUrls: ['./tinymce-wysiwyg.component.scss']
})
export class TinymceWysiwygComponent implements OnInit {

  @Input()
  set id(value: string) { this._id = value; }
  get id(): string { return this._id; }
  @Input()
  set config(value: any) { this._config = value; }
  get config(): any { return this._config; }
  @Input()
  set form(value: FormGroup) { this._form = value; }
  get form(): FormGroup { return this._form; }
  @Input()
  set host(value: any) { this._host = value; }
  get host(): any { return this._host; }
  @Input()
  set translateService(value: TranslateService) { this._translateService = value; }
  get translateService(): TranslateService { return this._translateService; }
  @Input()
  set disabled(value: boolean) {
    console.log('set disabled: ', value);
    this._disabled = value;
    this.setOptions(value);
  }
  get disabled(): boolean { return this._disabled; }
  @Input()
  set value(value: any) {
    console.log('set value: ', value);
    this._value = value;
    this.setValue(value);
  }
  get value(): any { return this._value; }

  _id: string;
  _config: any;
  _form: FormGroup;
  _host: any;
  _value: any;
  _disabled: boolean;
  _translateService: TranslateService;
  // config: TinymceWysiwygConfig;
  options: any;
  adam: any;
  editor: any;
  setAdamConfig: any;

  constructor(public tinymceWysiwygConfig: TinymceWysiwygConfig,
    public tinyMceDnnBridgeService: TinyMceDnnBridgeService,
    public tinyMceAdamService: TinyMceAdamService) {
  }

  ngOnInit() {
    console.log('wysiwyg config:', this.config);
    console.log('wysiwyg form:', this.form);
    console.log('wysiwyg host:', this.host);
    console.log('wysiwyg disabled:', this.disabled);
    console.log('wysiwyg value:', this.value);

    const settings = {
      enableContentBlocks: false,
      // auto_focus: false,
    };

    // TODO: add languages
    // angular.extend($scope.tinymceOptions, {
    //     language: lang2,
    //     language_url: "../i18n/lib/tinymce/" + lang2 + ".js"
    // });

    const selectorOptions = {
      // selector: 'textarea#' + this.id,
      body_class: 'field-string-wysiwyg-mce-box', // when inline=false
      content_css: 'assets/script/tinymce-wysiwyg/src/tinymce-wysiwyg.css',
      height: '100%',
      branding: false,
      setup: this.tinyMceInitCallback.bind(this),
    };

    this.enableContentBlocksIfPossible(settings);
    const tempOptions = Object.assign(selectorOptions, this.tinymceWysiwygConfig.getDefaultOptions(settings));

    const currentLang = this.translateService.currentLang;
    this.options = this.tinymceWysiwygConfig.setLanguageOptions(currentLang, tempOptions);

    // tinymce.init(options);
  }

  // /**
  //  * function call on change
  //  * @param {*} event
  //  * @param {*} value
  //  */
  changeCheck(event, value) {
    // do validity checks
    const isValid = this.validateValue(value);
    if (isValid) {
      this.host.update(value);
    }
  }

  // /**
  //  * For validating value
  //  * @param {*} value
  //  */
  validateValue(value) {
    // TODO: show validate message ???
    return true;
  }

  // /**
  //  * On render and change set configuration of control
  //  * @param {*} disabled
  //  */
  setOptions(disabled) {
    console.log('set options disabled:', disabled);
    const isReadOnly = this.editor.editorManager.get(this.id).readonly;
    if (disabled && !isReadOnly) {
      this.editor.editorManager.get(this.id).setMode('readonly');
    } else if (!disabled && isReadOnly) {
      this.editor.editorManager.get(this.id).setMode('code');
    }
  }

  // /**
  //  * New value from the form into the view
  //  * This function can be triggered from outside when value changed
  //  * @param {*} newValue
  //  */
  setValue(newValue) {
    console.log('[set value] tynimce id:', this.id);
    console.log('[set value] editor:', this.editor);
    const oldValue = this.editor.editorManager.get(this.id).getContent();
    if (newValue !== oldValue) {
      this.editor.editorManager.get(this.id).setContent(newValue);
    }
  }

  // /**
  //  * on tinyMce setup we set toolbarButtons and change event listener
  //  * @param {*} editor
  //  */
  tinyMceInitCallback(editor) {
    console.log('editor:', editor.editorManager);
    // set editor
    this.editor = editor;
    // Attach adam
    this.tinyMceAdamService.attachAdam(this, editor.editorManager);
    // Set Adam configuration
    this.setAdamConfig({
      adamModeConfig: { usePortalRoot: false },
      allowAssetsInRoot: true,
      autoLoad: false,
      enableSelect: true,
      folderDepth: 0,
      fileFilter: '',
      metadataContentTypes: '',
      subFolder: '',
      showImagesOnly: false  // adamModeImage?
    });

    if (editor.settings.language) {
      this.tinymceWysiwygConfig.addTranslations(editor.settings.language, this.translateService, editor.editorManager);
    }
    // Attach DnnBridgeService
    this.tinyMceDnnBridgeService.attachDnnBridgeService(this, editor);

    const imgSizes = this.tinymceWysiwygConfig.svc().imgSizes;
    TinyMceToolbarButtons.addTinyMceToolbarButtons(this, editor, imgSizes);
    editor.on('init', e => {
      // editor.selection.select(editor.getBody(), true);
      // editor.selection.collapse(false);

      this.host.setInitValues();
    });

    editor.on('change', e => {
      console.log('[set value] Editor was change', editor.getContent());
      this.changeCheck(e, editor.getContent());
    });
  }

  enableContentBlocksIfPossible(settings) {
    // quit if there are no following fields
    if (this.config.allInputTypeNames.length === this.config.index + 1) {
      return;
    }
    const nextField = this.config.allInputTypeNames[this.config.index + 1];
    if (nextField === 'entity-content-blocks') {
      settings.enableContentBlocks = true;
    }
  }
}
