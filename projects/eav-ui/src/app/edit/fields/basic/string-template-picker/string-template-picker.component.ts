import { Component, Injector, ViewContainerRef, effect, inject, signal } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatOptionModule } from '@angular/material/core';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { transient } from '../../../../../../../core/transient';
import { SourceService } from '../../../../code-editor/services/source.service';
import { CreateFileDialogComponent } from '../../../../create-file-dialog/create-file-dialog.component';
import { CreateFileDialogData, CreateFileDialogResult } from '../../../../create-file-dialog/create-file-dialog.models';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { FieldMask } from '../../../shared/helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { templateTypes } from './string-template-picker.constants';

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
    TranslateModule,
    TippyDirective,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringTemplatePickerComponent {
  
  log = classLog({StringTemplatePickerComponent});

  #fieldState = inject(FieldState) as FieldState<string>;

  // needed to create more FieldMasks as needed
  #injector = inject(Injector);

  // If we have a configured type, use that, otherwise use the field mask
  // We'll still use the field-mask (even though it wouldn't be needed) to keep the logic simple
  #typeMask = transient(FieldMask).init('String-TypeMask', this.#fieldState.settings().FileType ?? '[Type]');

  #locationMask = transient(FieldMask).init('String-LocationMask', '[Location]');

  #sourceService = transient(SourceService);

  protected group = this.#fieldState.group;
  protected config = this.#fieldState.config;

  protected basics = this.#fieldState.basics;
  protected ui = this.#fieldState.ui;

  protected files = signal<string[]>([]);

  #activeSpec = templateTypes.Token;
  #templates: string[] = [];
  #global = false;

  /** Reset only after templates have been fetched once */
  #resetIfNotFound = false;

  constructor(
    private matDialog: MatDialog,
    private viewContainerRef: ViewContainerRef,
  ) {
    // Watch for location changes to update the files in the dropdown
    effect(() => this.#onLocationChange(this.#locationMask.result()));

    // Watch for changes to the Type mask
    effect(() => this.#setFileConfig(this.#typeMask.result()), { allowSignalWrites: true });
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
    this.files.set(filtered);

    const resetValue = this.#resetIfNotFound && !filtered.some(template => template === this.#fieldState.uiValue());
    if (resetValue)
      this.ui().setIfChanged('');
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
    const dialogRef = this.matDialog.open(CreateFileDialogComponent, {
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
          this.ui().setIfChanged(result.name);
        }
      });
    });
  }
}
