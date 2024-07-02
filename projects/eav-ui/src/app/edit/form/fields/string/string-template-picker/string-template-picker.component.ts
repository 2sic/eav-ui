import { Component, Injector, OnDestroy, OnInit, ViewContainerRef, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { SourceService } from '../../../../../code-editor/services/source.service';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { CreateFileDialogComponent, CreateFileDialogData, CreateFileDialogResult } from '../../../../../create-file-dialog';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMask } from '../../../../shared/helpers';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { templateTypes } from './string-template-picker.constants';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatIconModule } from '@angular/material/icon';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';

@Component({
  selector: InputTypeConstants.StringTemplatePicker,
  templateUrl: './string-template-picker.component.html',
  styleUrls: ['./string-template-picker.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    SharedComponentsModule,
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringTemplatePickerComponent implements OnInit, OnDestroy {
  protected fieldState = inject(FieldState);
  protected group = this.fieldState.group;
  protected config = this.fieldState.config;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;
  protected controlStatus = this.fieldState.controlStatus;
  protected control = this.fieldState.control;

  templateOptions = signal([]);

  // needed to create more FieldMasks as needed
  private injector = inject(Injector);
  private typeMask = FieldMask.createTransient(this.injector);
  private locationMask = FieldMask.createTransient(this.injector);

  private activeSpec = templateTypes.Token;
  private templates: string[] = [];
  private global = false;
  /** Reset only after templates have been fetched once */
  private resetIfNotFound = false;

  constructor(
    private sourceService: SourceService,
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) { }

  ngOnInit() {

    // If we have a configured type, use that, otherwise use the field mask
    // We'll still use the field-mask (even though it wouldn't be needed) to keep the logic simple
    const typeFilterMask = this.fieldState.settings().FileType ?? '[Type]';

    // set change-watchers to the other values
    // console.log('2dm: typedMask', this.typeMask);
    this.typeMask
      .initCallback(this.setFileConfig.bind(this))
      .init('String-TypeMask', typeFilterMask);
    this.locationMask
      .initCallback(this.onLocationChange.bind(this))
      .init('String-LocationMask', '[Location]');

    this.setFileConfig(this.typeMask.resolve() || 'Token'); // use token setting as default, till the UI tells us otherwise
    this.onLocationChange(this.locationMask.resolve() || null); // set initial file list
  }

  ngOnDestroy() {
    this.typeMask.destroy();
    this.locationMask.destroy();
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
    this.templateOptions.set(filtered);

    const resetValue = this.resetIfNotFound && !filtered.some(template => template === this.control.value);
    if (resetValue) {
      ControlHelpers.patchControlValue(this.control, '');
    }
  }

  createTemplate() {
    const nameMask = FieldMask.createTransient(this.injector)
      // new FieldMask(
      // '[Name]',
      //  this.group.controls
      //)
      .init('String-NameMask', '[Name]', false); //, null, null, null, 'String-NameMask');
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
          ControlHelpers.patchControlValue(this.control, result.name);
        }
      });
    });
  }
}
