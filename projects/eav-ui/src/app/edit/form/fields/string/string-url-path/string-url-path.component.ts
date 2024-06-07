import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, GeneralHelpers, UrlHelpers } from '../../../../shared/helpers';
import { FormConfigService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { StringUrlPathLogic } from './string-url-path-logic';
import { StringUrlPathViewModel } from './string-url-path.models';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
    selector: InputTypeConstants.StringUrlPath,
    templateUrl: './string-url-path.component.html',
    styleUrls: ['./string-url-path.component.scss'],
    standalone: true,
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        MatInputModule,
        FieldHelperTextComponent,
        AsyncPipe,
    ],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class StringUrlPathComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel$: Observable<StringUrlPathViewModel>;

  private fieldMask: FieldMask;
  /** Blocks external update if field was changed manually and doesn't match external updates. WARNING: Doesn't work on language change */
  private lastAutoCopy = '';

  constructor(fieldsSettingsService: FieldsSettingsService) {
    super(fieldsSettingsService);
    StringUrlPathLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    this.subscription.add(
      this.settings$.pipe(
        map(settings => settings.AutoGenerateMask),
        distinctUntilChanged(),
      ).subscribe(autoGenerateMask => {
        this.fieldMask?.destroy();
        this.fieldMask = new FieldMask(
          autoGenerateMask,
          this.group.controls,
          (newValue) => { this.onSourcesChanged(newValue); },
          // remove slashes which could look like path-parts
          (key, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value,
        );

        this.onSourcesChanged(this.fieldMask.resolve());
      })
    );

    // clean on value change
    this.subscription.add(
      this.control.valueChanges.subscribe(() => {
        this.clean(false);
      })
    );

    this.viewModel$ = combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]).pipe(
      map(([controlStatus, label, placeholder, required]) => {
        const viewModel: StringUrlPathViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    this.fieldMask?.destroy();
    super.ngOnDestroy();
  }

  private onSourcesChanged(newValue: string) {
    const value = this.control.value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (value && value !== this.lastAutoCopy) { return; }

    const cleaned = UrlHelpers.stripNonUrlCharacters(newValue, this.settings$.value.AllowSlashes, true);
    if (!cleaned) { return; }
    this.lastAutoCopy = cleaned;
    if (value === cleaned) { return; }
    GeneralHelpers.patchControlValue(this.control, cleaned);
  }

  clean(trimEnd: boolean) {
    const value = this.control.value;
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings$.value.AllowSlashes, trimEnd);
    if (value === cleaned) { return; }
    GeneralHelpers.patchControlValue(this.control, cleaned);
  }
}
