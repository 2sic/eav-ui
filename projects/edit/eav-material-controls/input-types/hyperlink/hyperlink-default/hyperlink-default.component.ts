import { Component, OnInit, Input, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { Subscription } from 'rxjs';

import { AdamConfig, AdamModeConfig } from '../../../../shared/models/adam/adam-config';
import { DnnBridgeService } from '../../../../shared/services/dnn-bridge.service';
import { EavService } from '../../../../shared/services/eav.service';
import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { FileTypeService } from '../../../../shared/services/file-type.service';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { PagePickerResult } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';
import { EavConfiguration } from '../../../../shared/models/eav-configuration';
import { angularConsoleLog } from '../../../../../ng-dialogs/src/app/shared/helpers/angular-console-log.helper';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'hyperlink-default',
  templateUrl: './hyperlink-default.component.html',
  styleUrls: ['./hyperlink-default.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.DropzoneWrapper, WrappersConstants.EavLocalizationWrapper,
  WrappersConstants.HyperlinkDefaultExpandableWrapper, WrappersConstants.AdamAttachWrapper],
})
export class HyperlinkDefaultComponent implements Field, OnInit, OnDestroy {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  showPreview = true;
  toggleAdamValue = false;
  link = '';
  control: AbstractControl;

  private oldValue: any;
  private eavConfig: EavConfiguration;
  private subscriptions: Subscription[] = [];
  private adamModeConfig: AdamModeConfig = {
    usePortalRoot: false
  };

  get value() { return this.group.controls[this.config.field.name].value; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }
  /**
   * this.config.currentFieldConfig.settings.ShowAdam.values.Where(v => v.Dimensions.Contains("en-en").value) or values[0],
   * then the wrapper will enable/disable the field, depending on the dimension state.
   * So if it's read-only sharing, the input-field is disabled till the globe is clicked to enable edit...
   */
  get showAdam() { return this.config.field.settings.ShowAdam ? this.config.field.settings.ShowAdam : true; }
  get fileFilter() { return this.config.field.settings.FileFilter || ''; }
  get buttons(): string { return this.config.field.settings.Buttons ? this.config.field.settings.Buttons : 'adam,more'; }
  get showInputFileName() { return this.control.value.includes('file:') || this.control.value.includes('page:'); }

  constructor(
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
    private dialog: MatDialog,
  ) {
    this.eavConfig = this.eavService.getEavConfiguration();
  }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.attachAdam();
    this.setLink(this.value);
    this.suscribeValueChanges();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(subscription => { subscription.unsubscribe(); });
  }

  private setFormValue(formControlName: string, value: any) {
    this.group.patchValue({ [formControlName]: value });
  }

  isImage = () => this.fileTypeService.isImage(this.link);

  isKnownType = () => this.fileTypeService.isKnownType(this.link);

  icon = () => this.fileTypeService.getIconClass(this.link);

  thumbnailUrl(size?: number, quote?: boolean) {
    let result = this.link;
    if (size === 1) {
      result = result + '?w=72&h=72&mode=crop';
    }
    if (size === 2) {
      result = result + '?w=800&h=800&mode=max';
    }
    const qt = quote ? '"' : '';
    return qt + result + qt;
  }

  tooltipUrl = (str: string): string => {
    if (!str) {
      return '';
    }
    return str.replace(/\//g, '/&#8203;');
  }

  // #region dnn-page picker dialog
  /** Callback when something was selected */
  private processResultOfPagePicker(value: PagePickerResult) {
    // Convert to page:xyz format (if it wasn't cancelled)
    if (value) { this.setFormValue(this.config.field.name, `page:${value.id}`); }
  }

  /** Open the dialog */
  openPageDialog() {
    this.dnnBridgeService.open(
      this.value,
      {
        Paths: this.config.field.settings.Paths ? this.config.field.settings.Paths : '',
        FileFilter: this.config.field.settings.FileFilter ? this.config.field.settings.FileFilter : ''
      },
      this.processResultOfPagePicker.bind(this),
      this.dialog);
  }
  // #endregion

  // #region new adam: callbacks only
  setValue(fileItem: any) {
    this.setFormValue(this.config.field.name, `file:${fileItem.Id}`);
  }

  toggleAdam(usePortalRoot?: boolean, showImagesOnly?: boolean) {
    this.config.adam.toggle({
      showImagesOnly,
      usePortalRoot,
    });
  }

  /** Subscribe to form value changes */
  private suscribeValueChanges() {
    this.oldValue = this.group.controls[this.config.field.name].value;
    const formSetSub = this.eavService.formSetValueChange$.subscribe(formSet => {
      // check if update is for current form
      if (formSet.formId !== this.config.form.formId) { return; }
      // check if update is for current entity
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }
      // check if update is for this field
      if (formSet.entityValues[this.config.field.name] === this.oldValue) { return; }
      this.oldValue = formSet.entityValues[this.config.field.name];

      this.setLink(formSet.entityValues[this.config.field.name]);
    });
    this.subscriptions.push(formSetSub);
  }

  /** Update test-link if necessary - both when typing or if link was set by dialogs */
  private setLink(value: string): void {
    if (!value) { return null; }

    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(this.eavConfig.appId,
      value,
      this.config.entity.header.ContentTypeName,
      this.config.entity.header.Guid,
      this.config.field.name);

    if (urlFromId$) {
      urlFromId$.subscribe((data) => {
        if (data) { this.link = data; }
      });
    } else {
      this.link = value;
    }
  }

  private attachAdam() {
    if (this.config.adam) {
      // callbacks - functions called from adam
      this.config.adam.updateCallback = (value: any) => this.setValue(value);

      // binding for dropzone
      this.config.adam.afterUploadCallback = (value: any) => this.setValue(value);

      // return value from form
      this.config.adam.getValueCallback = () => this.group.controls[this.config.field.name].value;

      angularConsoleLog('HyperDefault setConfig : ', Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        fileFilter: this.fileFilter
      }));

      this.config.adam.setConfig(Object.assign(new AdamConfig(), {
        adamModeConfig: this.adamModeConfig,
        fileFilter: this.fileFilter
      }));
    }
  }
  //#endregion
}
