import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanTristateLogic } from './boolean-tristate-logic';
import { BooleanTristateViewModel } from './boolean-tristate.models';

@Component({
  selector: InputTypeConstants.BooleanTristate,
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanTristateComponent extends BaseFieldComponent<boolean | ''> implements OnInit, OnDestroy {
  viewModel$: Observable<BooleanTristateViewModel>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    BooleanTristateLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const changeable$: Observable<boolean> = combineLatest([
      this.settings$.pipe(map(settings => settings.TitleTrue), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleIndeterminate), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleFalse), distinctUntilChanged())
    ]).pipe(
      map(([TitleTrue, TitleIndeterminate, TitleFalse]) => !!(TitleTrue && TitleIndeterminate && TitleFalse)),
      distinctUntilChanged(),
    );

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => (controlStatus.value === '') ? null : controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged()),
    ]).pipe(
      map(([value, reverseToogle]) => value == null ? value : reverseToogle ? !value : value),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([changeable$]),
      combineLatest([checked$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [changeable],
        [checked],
      ]) => {
        const viewModel: BooleanTristateViewModel = {
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

  updateValue() {
    const currentValue: boolean | '' = this.control.value;
    const reverseToogle = this.settings$.value.ReverseToggle;

    let nextValue: boolean;
    switch (currentValue) {
      case false:
        nextValue = reverseToogle ? true : null;
        break;
      case '':
      case null:
        nextValue = reverseToogle ? false : true;
        break;
      case true:
        nextValue = reverseToogle ? null : false;
        break;
    }
    GeneralHelpers.patchControlValue(this.control, nextValue);
  }
}
