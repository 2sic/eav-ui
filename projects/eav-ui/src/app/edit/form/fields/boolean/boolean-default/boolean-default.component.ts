import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { BooleanDefaultTemplateVars } from './boolean-default.models';

@Component({
  selector: InputTypeConstants.BooleanDefault,
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseFieldComponent<boolean> implements OnInit, OnDestroy {
  templateVars$: Observable<BooleanDefaultTemplateVars>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const changable$: Observable<boolean> = combineLatest([
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

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([changable$]),
      combineLatest([checked$])
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [changable],
        [checked],
      ]) => {
        const templateVars: BooleanDefaultTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          changable,
          checked,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue() {
    const newValue = !this.control.value;
    GeneralHelpers.patchControlValue(this.control, newValue);
  }
}
