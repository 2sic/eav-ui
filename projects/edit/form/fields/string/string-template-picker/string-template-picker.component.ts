import { Component, OnDestroy, OnInit, ViewContainerRef } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { BehaviorSubject, combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../../../../ng-dialogs/src/app/create-file-dialog';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, GeneralHelpers } from '../../../../shared/helpers';
import { AssetsService, EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { templateTypes } from './string-template-picker.constants';
import { StringTemplatePickerTemplateVars } from './string-template-picker.models';

@Component({
  selector: InputTypeConstants.StringTemplatePicker,
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringTemplatePickerComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<StringTemplatePickerTemplateVars>;

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
    private assetsService: AssetsService,
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

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([this.templateOptions$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [templateOptions],
      ]) => {
        const templateVars: StringTemplatePickerTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          templateOptions,
        };
        return templateVars;
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

    this.assetsService.getAll(this.global).subscribe(templates => {
      this.templates = templates;
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
    const data: CreateFileDialogData = {
      global: this.global,
      purpose: this.activeSpec.purpose,
      type: this.activeSpec.type,
    };
    const dialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });
    dialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) { return; }

      this.assetsService.create(result.name, result.templateKey, this.global).subscribe(res => {
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
