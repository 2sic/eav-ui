import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { BooleanDefaultTemplateVars } from './boolean-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseComponent<boolean> implements OnInit, OnDestroy {
  templateVars$: Observable<BooleanDefaultTemplateVars>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged())
    ]).pipe(
      map(([value, reverseToogle]) => reverseToogle ? !value : value),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([checked$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [checked],
      ]) => {
        const templateVars: BooleanDefaultTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
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
