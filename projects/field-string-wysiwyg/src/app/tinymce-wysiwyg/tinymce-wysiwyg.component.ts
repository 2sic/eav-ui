import { Component, OnInit, Input, OnDestroy, ViewEncapsulation } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { skip, first } from 'rxjs/operators';
import { Subscription } from 'rxjs';

import { TinymceWysiwygConfig } from '../services/tinymce-wysiwyg-config';
import { TinyMceDnnBridgeService } from '../services/tinymce-dnnbridge-service';
import { TinyMceToolbarButtons } from '../services/tinymce-wysiwyg-toolbar';
import { TinyMceAdamService } from '../services/tinymce-adam-service';
import { ConnectorObservable } from '../../../../shared/connector';
// tslint:disable-next-line:max-line-length
import { ExperimentalProps } from '../../../../../src/app/eav-material-controls/input-types/custom/external-webcomponent-properties/external-webcomponent-properties';
import { InputTypeName } from '../../../../../src/app/shared/models/input-field-models';
import * as contentStyle from './tinymce-content.css';

@Component({
  selector: 'app-tinymce-wysiwyg',
  templateUrl: './tinymce-wysiwyg.component.html',
  styleUrls: ['./tinymce-wysiwyg.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class TinymceWysiwygComponent implements OnInit, OnDestroy {
  @Input() connector: ConnectorObservable<string>;
  @Input() experimental: ExperimentalProps;
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
    this.calculateInitialValues();
    this.subscribeToFormChanges();

    const settings = {
      enableContentBlocks: false,
    };

    const selectorOptions = {
      // selector: 'editor#' + this.id,
      body_class: 'field-string-wysiwyg-mce-box', // when inline=false
      content_style: contentStyle,
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
      this.connector.data.update(value);
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
  setValue(newValue = '') {
    const oldValue = this.editor.editorManager.get(this.id).getContent();
    console.log('TinymceWysiwygComponent setValue', 'id:', this.id, 'old:', oldValue, 'new:', newValue);
    if (newValue !== oldValue) {
      this.editor.editorManager.get(this.id).setContent(newValue);
    }
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

  private calculateInitialValues(): void {
    // spm 2019.04.05. id will clash if we open the same entity as a sub form, e.g. in entity-default field
    this.id = `string-wysiwyg-tinymce-${Math.random() * Math.pow(10, 17)}-${this.connector.field.name}`;
    this.connector.data.value$.pipe(first()).subscribe((firstValue: any) => {
      this.initialValue = firstValue;
    });
    this.disabled = this.experimental.formGroup.controls[this.connector.field.name].disabled;
  }

  private subscribeToFormChanges(): void {
    this.subscriptions.push(
      this.connector.data.value$.pipe(skip(1)).subscribe((newValue: any) => {
        this.setValue(newValue);
      }),
      // spm 2019.04.17. disabled check doesn't work when field is translated without value change
      this.experimental.formSetValueChange$.subscribe(formSet => {
        this.disabled = this.experimental.formGroup.controls[this.connector.field.name].disabled;
      })
    );
  }

  private enableContentBlocksIfPossible(settings) {
    // quit if there are no following fields
    if (this.experimental.allInputTypeNames.length === this.connector.field.index + 1) {
      return;
    }
    const nextField: InputTypeName = this.experimental.allInputTypeNames[this.connector.field.index + 1];
    if (nextField.inputType === 'entity-content-blocks') {
      settings.enableContentBlocks = true;
    }
  }
}
