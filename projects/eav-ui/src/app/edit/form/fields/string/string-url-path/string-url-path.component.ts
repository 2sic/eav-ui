import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMask, UrlHelpers } from '../../../../shared/helpers';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { StringUrlPathLogic } from './string-url-path-logic';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';

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
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringUrlPathComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected groupTemp = this.fieldState.group;
  protected configTemp = this.fieldState.config;

  // protected settingsTemp = this.fieldState.settings;
  protected basicsTemp = this.fieldState.basics;
  protected controlTemp = this.fieldState.control;


  private fieldMask: FieldMask;
  /** Blocks external update if field was changed manually and doesn't match external updates. WARNING: Doesn't work on language change */
  private lastAutoCopy = '';

  constructor() {
    super();
    StringUrlPathLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    this.subscriptions.add(
      this.settings$.pipe(
        map(settings => settings.AutoGenerateMask),
        distinctUntilChanged(),
      ).subscribe(autoGenerateMask => {
        this.fieldMask?.destroy();
        this.fieldMask = new FieldMask(
          autoGenerateMask,
          this.groupTemp.controls,
          (newValue) => { this.onSourcesChanged(newValue); },
          // remove slashes which could look like path-parts
          (key, value) => typeof value === 'string' ? value.replace('/', '-').replace('\\', '-') : value,
          null,
          null,
          'UrlPath',
        );

        this.onSourcesChanged(this.fieldMask.resolve());
      })
    );

    // clean on value change
    this.subscriptions.add(
      this.controlTemp.valueChanges.subscribe(() => {
        this.clean(false);
      })
    );
  }

  ngOnDestroy() {
    this.fieldMask?.destroy();
    super.ngOnDestroy();
  }

  private onSourcesChanged(newValue: string) {
    const value = this.controlTemp.value;
    // don't do anything if the current field is not empty and doesn't have the last copy of the stripped value
    if (value && value !== this.lastAutoCopy) { return; }

    const cleaned = UrlHelpers.stripNonUrlCharacters(newValue, this.settings$.value.AllowSlashes, true);
    if (!cleaned) { return; }
    this.lastAutoCopy = cleaned;
    if (value === cleaned) { return; }
    ControlHelpers.patchControlValue(this.controlTemp, cleaned);
  }

  clean(trimEnd: boolean) {
    const value = this.controlTemp.value;
    const cleaned = UrlHelpers.stripNonUrlCharacters(value, this.settings$.value.AllowSlashes, trimEnd);
    if (value === cleaned) { return; }
    ControlHelpers.patchControlValue(this.control, cleaned);
  }
}
