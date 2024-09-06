import { Component, Injector, OnDestroy, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { templateTypes } from './string-template-picker.constants';
import { TranslateModule } from '@ngx-translate/core';
import { AsyncPipe } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMask } from '../../../shared/helpers';
import { ControlHelpers } from '../../../shared/controls/control.helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { transient } from '../../../../core/transient';
import { SourceService } from '../../../../code-editor/services/source.service';
import { CreateFileDialogComponent } from '../../../../create-file-dialog/create-file-dialog.component';
import { CreateFileDialogData, CreateFileDialogResult } from '../../../../create-file-dialog/create-file-dialog.models';
import { EavLogger } from '../../../../../../../eav-ui/src/app/shared/logging/eav-logger';
import { take } from 'rxjs';

const logThis = false;
const nameOfThis = 'StringTemplatePickerComponent';

@Component({
  selector: InputTypeCatalog.StringTemplatePicker,
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
    MatIconModule,
    FieldHelperTextComponent,
    AsyncPipe,
    TranslateModule,
    TippyDirective,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringTemplatePickerComponent implements OnDestroy {
  log = new EavLogger(nameOfThis, logThis);

  #fieldState = inject(FieldState) as FieldState<string>;
  protected group = this.#fieldState.group;
  protected config = this.#fieldState.config;

  protected basics = this.#fieldState.basics;
  protected controlStatus = this.#fieldState.controlStatus;
  #control = this.#fieldState.control;

  templateOptions = signal([]);

  // needed to create more FieldMasks as needed
  #injector = inject(Injector);

  // If we have a configured type, use that, otherwise use the field mask
  // We'll still use the field-mask (even though it wouldn't be needed) to keep the logic simple
  #typeMask = transient(FieldMask).init('String-TypeMask', this.#fieldState.settings().FileType ?? '[Type]');

  #locationMask = transient(FieldMask).init('String-LocationMask', '[Location]');

  #activeSpec = templateTypes.Token;
  #templates: string[] = [];
  #global = false;
  /** Reset only after templates have been fetched once */
  #resetIfNotFound = false;

  #sourceService = transient(SourceService);

  constructor(
    private dialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    // Watch for location changes to update the files in the dropdown
    effect(() => this.#onLocationChange(this.#locationMask.result()));

    // Watch for changes to the Type mask
    effect(() => this.#setFileConfig(this.#typeMask.result()), { allowSignalWrites: true });
  }

  ngOnDestroy() {
    this.#typeMask.destroy();
    this.#locationMask.destroy();
  }

  #setFileConfig(type: string) {
    this.#activeSpec = templateTypes[type];
    this.#setTemplateOptions();
  }

  #prevLocation = '';
  #onLocationChange(location: string) {
    const l = this.log.fn('onLocationChange', { location });
    this.#global = (
      location === 'Host File System' // Original value used from 2sxc up until v12.01
      || location === 'Global' // New key used in 2sxc 12.02 and later
    );

    if (this.#prevLocation === location)
      return;
    this.#prevLocation = location;

    this.#sourceService.getAll().pipe(take(1)).subscribe(files => {
      this.#templates = files.filter(file => file.Shared === this.#global).map(file => file.Path);
      this.#resetIfNotFound = true;
      this.#setTemplateOptions();
    });
  }

  #setTemplateOptions() {
    const ext = this.#activeSpec.ext;
    const filtered = this.#templates
      // new feature in v11 - '.code.xxx' files shouldn't be shown, they are code-behind
      .filter(template => !/\.code\.[a-zA-Z0-9]+$/.test(template))
      .filter(template => template.endsWith(ext));
    this.templateOptions.set(filtered);

    const resetValue = this.#resetIfNotFound && !filtered.some(template => template === this.#control.value);
    if (resetValue)
      ControlHelpers.patchControlValue(this.#control, '');
  }

  createTemplate() {
    const nameMask = transient(FieldMask, this.#injector).init('String-NameMask', '[Name]');
    const data: CreateFileDialogData = {
      global: this.#global,
      purpose: this.#activeSpec.purpose,
      type: this.#activeSpec.type,
      name: nameMask.result(),
    };
    nameMask.destroy();
    const dialogRef = this.dialog.open(CreateFileDialogComponent, {
      autoFocus: false,
      data,
      viewContainerRef: this.viewContainerRef,
      width: '650px',
    });

    dialogRef.afterClosed().subscribe((result?: CreateFileDialogResult) => {
      if (!result) return;

      this.#sourceService.create(result.name, this.#global, result.templateKey).subscribe(res => {
        if (res === false) {
          alert('Server reported that create failed - the file probably already exists');
        } else {
          this.#templates.push(result.name);
          this.#setTemplateOptions();
          ControlHelpers.patchControlValue(this.#control, result.name);
        }
      });
    });
  }
}
