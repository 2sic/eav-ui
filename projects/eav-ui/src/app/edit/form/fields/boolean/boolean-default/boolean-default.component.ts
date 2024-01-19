import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { BooleanDefaultViewModel } from './boolean-default.models';

@Component({
  selector: InputTypeConstants.BooleanDefault,
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseFieldComponent<boolean> implements OnInit, OnDestroy {
  viewModel$: Observable<BooleanDefaultViewModel>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const changeable$: Observable<boolean> = combineLatest([
      this.settings$.pipe(map(settings => settings.TitleTrue), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleFalse), distinctUntilChanged())
    ]).pipe(
      map(([TitleTrue, TitleFalse]) => !!(TitleTrue && TitleFalse)),
      distinctUntilChanged(),
    );

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged())
    ]).pipe(
      map(([value, reverseToogle]) => reverseToogle ? !value : value),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([changeable$]),
      combineLatest([checked$])
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [changeable],
        [checked],
      ]) => {
        const viewModel: BooleanDefaultViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          changeable,
          checked,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const newValue = !this.control.value;
      GeneralHelpers.patchControlValue(this.control, newValue);
    }
  }
}
