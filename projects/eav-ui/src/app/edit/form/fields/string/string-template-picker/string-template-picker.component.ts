import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, map, Observable } from 'rxjs';
import { SourceService } from '../../../../../code-editor/services/source.service';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../../../../create-file-dialog';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { templateTypes } from './string-template-picker.constants';
import { StringTemplatePickerViewModel } from './string-template-picker.models';

@Component({
  selector: InputTypeConstants.StringTemplatePicker,
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringTemplatePickerComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel: Observable<StringTemplatePickerViewModel>;

  private templateOptions$: BehaviorSubject<string[]>;
  private typeMask: FieldMask;
  private locationMask: FieldMask;
  private activeSpec = templateTypes.Token;
  private templates: string[] = [];
  private global = false;
  /** Reset only after templates have been fetched once */
  private resetIfNotFound = false;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private sourceService: SourceService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    super(eavService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    this.templateOptions$ = new BehaviorSubject<string[]>([]);

    // If we have a configured type, use that, otherwise use the field mask
    // We'll still use the field-mask (even though it wouldn't be needed) to keep the logic simple
    const typeFilterMask = this.settings$.value.FileType ?? '[Type]';

    // set change-watchers to the other values
    this.typeMask = new FieldMask(typeFilterMask, this.group.controls, this.setFileConfig.bind(this), null);
    this.locationMask = new FieldMask('[Location]', this.group.controls, this.onLocationChange.bind(this), null);

    this.setFileConfig(this.typeMask.resolve() || 'Token'); // use token setting as default, till the UI tells us otherwise
    this.onLocationChange(this.locationMask.resolve() || null); // set initial file list

    this.viewModel = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.templateOptions$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [templateOptions],
      ]) => {
        const viewModel: StringTemplatePickerViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          templateOptions,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.templateOptions$.complete();
    this.typeMask.destroy();
    this.locationMask.destroy();
    super.ngOnDestroy();
  }

  private setFileConfig(type: string) {
    this.activeSpec = templateTypes[type];
    this.setTemplateOptions();
  }

  private onLocationChange(location: string) {
    this.global = (location === 'Host File System' // Original value used from 2sxc up until v12.01
      || location === 'Global'); // New key used in 2sxc 12.02 and later

    this.sourceService.getAll().subscribe(files => {
      this.templates = files.filter(file => file.Shared === this.global).map(file => file.Path);
      this.resetIfNotFound = true;
      this.setTemplateOptions();
    });
  }

  private setTemplateOptions() {
    const ext = this.activeSpec.ext;
    const filtered = this.templates
      // new feature in v11 - '.code.xxx' files shouldn't be shown, they are code-behind
      .filter(template => !/\.code\.[a-zA-Z0-9]+$/.test(template))
      .filter(template => template.endsWith(ext));
    this.templateOptions$.next(filtered);
    const resetValue = this.resetIfNotFound && !filtered.some(template => template === this.control.value);
    if (resetValue) {
      GeneralHelpers.patchControlValue(this.control, '');
    }
  }

  createTemplate() {
    const nameMask = new FieldMask('[Name]', this.group.controls, null, null);
    const data: CreateFileDialogData = {
      global: this.global,
      purpose: this.activeSpec.purpose,
      type: this.activeSpec.type,
      name: nameMask.resolve(),
    };
    nameMask.destroy();
    const dialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    
    dialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) { return; }

      this.sourceService.create(result.name, this.global, result.templateKey).subscribe(res => {
        if (res === false) {
          alert('Server reported that create failed - the file probably already exists');
        } else {
          this.templates.push(result.name);
          this.setTemplateOptions();
          GeneralHelpers.patchControlValue(this.control, result.name);
        }
      });
    });
  }
}
