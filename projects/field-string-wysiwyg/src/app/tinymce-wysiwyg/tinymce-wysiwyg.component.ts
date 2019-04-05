import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { skip, first } from 'rxjs/operators';

import { TinymceWysiwygConfig } from '../services/tinymce-wysiwyg-config';
import { TinyMceDnnBridgeService } from '../services/tinymce-dnnbridge-service';
import { TinyMceToolbarButtons } from '../services/tinymce-wysiwyg-toolbar';
import { TinyMceAdamService } from '../services/tinymce-adam-service';
import { ConnectorObservable } from '../../../../shared/connector';
// tslint:disable-next-line:max-line-length
import { HiddenProps, FieldState } from '../../../../../src/app/eav-material-controls/input-types/custom/external-webcomponent-properties/external-webcomponent-properties';
import { Subscription } from 'rxjs';
import { InputTypeName } from '../../../../../src/app/shared/helpers/input-field-models';
// import tinymceWysiwygConfig from './tinymce-wysiwyg-config.js'
// import { addTinyMceToolbarButtons } from './tinymce-wysiwyg-toolbar.js'
// import { attachAdam } from './tinymce-adam-service.js'
// import { attachDnnBridgeService } from './tinymce-dnnbridge-service.js';

@Component({
  selector: 'app-tinymce-wysiwyg',
  templateUrl: './tinymce-wysiwyg.component.html',
  styleUrls: ['./tinymce-wysiwyg.component.scss']
})
export class TinymceWysiwygComponent implements OnInit, OnDestroy {
  @Input() connector: ConnectorObservable<string>;
  @Input() hiddenProps: HiddenProps;
  @Input() host: any;
  @Input() translateService: TranslateService;
  @Input()
  set adamSetValueCallback(value: any) {
    this.adamSetValue(value);
  }
  get adamSetValueCallback(): any { return this.adamSetValue; }
  @Input()
  set adamAfterUploadCallback(value: any) {
    this.adamAfterUpload(value);
  }
  get adamAfterUploadCallback(): any { return this.adamAfterUpload; }

  id: string;
  initialValue: any;
  disabled: boolean;
  options: any;
  adam: any;
  editor: any;
  setAdamConfig: any;
  adamSetValue: any;
  adamAfterUpload: any;
  processResultOfDnnBridge: any;
  private subscriptions: Subscription[] = [];

  constructor(public tinymceWysiwygConfig: TinymceWysiwygConfig,
    public tinyMceDnnBridgeService: TinyMceDnnBridgeService,
    public tinyMceAdamService: TinyMceAdamService) {
  }

  ngOnInit() {
    this.id = `tinymce-wysiwyg-${this.connector.field.name}`;
    this.connector.data.value$.pipe(first()).subscribe((firstValue: any) => {
      this.initialValue = firstValue;
    });
    this.subscribeToFormChanges();

    const settings = {
      enableContentBlocks: false,
    };

    const selectorOptions = {
      // selector: 'editor#' + this.id,
      body_class: 'field-string-wysiwyg-mce-box', // when inline=false
      content_css: 'assets/elements/field-string-wysiwyg/assets/style/tinymce-wysiwyg.css',
      height: '100%',
      branding: false,
      setup: this.tinyMceInitCallback.bind(this),
    };

    this.enableContentBlocksIfPossible(settings);
    const tempOptions = Object.assign(selectorOptions, this.tinymceWysiwygConfig.getDefaultOptions(settings));

    const currentLang = this.translateService.currentLang;
    this.options = this.tinymceWysiwygConfig.setLanguageOptions(currentLang, tempOptions);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => subscription.unsubscribe());
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
    const oldValue = this.editor.editorManager.get(this.id).getContent();
    if (newValue !== oldValue) {
      this.editor.editorManager.get(this.id).setContent(newValue);
    }
    console.log('Petar wysiwyg order: setValue(newValue)', 'old:', oldValue, 'new:', newValue);
  }

  // /**
  //  * on tinyMce setup we set toolbarButtons and change event listener
  //  * @param {*} editor
  //  */
  tinyMceInitCallback(editor) {
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
      console.log('Petar wysiwyg order: editor.on init => this.host.setInitValues();', editor.getContent());
    });

    editor.on('change', e => {
      this.changeCheck(e, editor.getContent());
      console.log('Petar wysiwyg order: editor.on change => this.changeCheck(e, editor.getContent()); => this.host.update(value);',
        editor.getContent());
    });
  }

  private subscribeToFormChanges(): void {
    this.subscriptions.push(
      this.connector.data.value$.pipe(skip(1)).subscribe((newValue: any) => {
        this.setValue(newValue);
      }),
      this.hiddenProps.fieldStates$.subscribe((fieldStates: FieldState[]) => {
        this.disabled = fieldStates.find(fieldState => fieldState.name === this.connector.field.name).disabled;
      })
    );
  }

  private enableContentBlocksIfPossible(settings) {
    // quit if there are no following fields
    if (this.hiddenProps.allInputTypeNames.length === this.connector.field.index + 1) {
      return;
    }
    const nextField: InputTypeName = this.hiddenProps.allInputTypeNames[this.connector.field.index + 1];
    if (nextField.inputType === 'entity-content-blocks') {
      settings.enableContentBlocks = true;
    }
  }
}
