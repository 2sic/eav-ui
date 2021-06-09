import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { BaseComponent } from '../../base/base.component';
import { BooleanTristateLogic } from './boolean-tristate-logic';
import { BooleanTristateTemplateVars } from './boolean-tristate.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-tristate',
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanTristateComponent extends BaseComponent<boolean | ''> implements OnInit, OnDestroy {
  templateVars$: Observable<BooleanTristateTemplateVars>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    BooleanTristateLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => (controlStatus.value === '') ? null : controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged()),
    ]).pipe(
      map(([value, reverseToogle]) => value == null ? value : reverseToogle ? !value : value),
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
        const templateVars: BooleanTristateTemplateVars = {
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
