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
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { PagePickerResult } from '../../../../shared/models/dnn-bridge/dnn-bridge-connector';

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

  link = '';
  control: AbstractControl;

  private oldValue: any;
  private subscription = new Subscription();
  private adamModeConfig: AdamModeConfig = {
    usePortalRoot: false
  };

  get showAdam() { return this.config.field.settings.ShowAdam ? this.config.field.settings.ShowAdam : true; }
  get fileFilter() { return this.config.field.settings.FileFilter || ''; }
  get buttons() { return this.config.field.settings.Buttons ? this.config.field.settings.Buttons : 'adam,more'; }
  get showInputFileName() { return this.control.value.includes('file:') || this.control.value.includes('page:'); }

  constructor(
    private fileTypeService: FileTypeService,
    private dnnBridgeService: DnnBridgeService,
    private eavService: EavService,
    private dialog: MatDialog,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.attachAdam();
    this.setLink(this.control.value);
    this.suscribeValueChanges();
  }

  ngOnDestroy() {
    this.subscription.unsubscribe();
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
    if (!str) { return ''; }
    return str.replace(/\//g, '/&#8203;');
  }

  // #region dnn-page picker dialog
  openPageDialog() {
    this.dnnBridgeService.open(
      this.control.value,
      {
        Paths: this.config.field.settings.Paths ? this.config.field.settings.Paths : '',
        FileFilter: this.config.field.settings.FileFilter ? this.config.field.settings.FileFilter : ''
      },
      this.processResultOfPagePicker.bind(this),
      this.dialog
    );
  }

  private processResultOfPagePicker(value: PagePickerResult) {
    // Convert to page:xyz format (if it wasn't cancelled)
    if (value) { this.control.patchValue(`page:${value.id}`); }
  }
  // #endregion

  /** Subscribe to form value changes */
  private suscribeValueChanges() {
    this.oldValue = this.control.value;
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
    this.subscription.add(formSetSub);
  }

  /** Update test-link if necessary - both when typing or if link was set by dialogs */
  private setLink(value: string): void {
    if (!value) { return null; }

    // handle short-ID links like file:17
    const urlFromId$ = this.dnnBridgeService.getUrlOfId(
      value,
      this.config.entity.header.ContentTypeName,
      this.config.entity.header.Guid,
      this.config.field.name
    );

    if (urlFromId$) {
      urlFromId$.subscribe((data) => {
        if (data) { this.link = data; }
      });
    } else {
      this.link = value;
    }
  }

  // #region new adam: callbacks only
  toggleAdam(usePortalRoot?: boolean, showImagesOnly?: boolean) {
    this.config.adam.toggle({
      showImagesOnly,
      usePortalRoot,
    });
  }

  private attachAdam() {
    if (!this.config.adam) { return; }
    this.config.adam.updateCallback = (value: any) => this.setValue(value);
    this.config.adam.afterUploadCallback = (value: any) => this.setValue(value);
    this.config.adam.getValueCallback = () => this.control.value;
    this.config.adam.setConfig({
      ...new AdamConfig(),
      adamModeConfig: this.adamModeConfig,
      fileFilter: this.fileFilter
    });
  }

  private setValue(fileItem: any) {
    this.control.patchValue(`file:${fileItem.Id}`);
  }
  //#endregion
}
