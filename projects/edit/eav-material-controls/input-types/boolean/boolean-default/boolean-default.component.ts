import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { BooleanDefaultTemplateVars } from './boolean-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'boolean-default',
  templateUrl: './boolean-default.component.html',
  styleUrls: ['./boolean-default.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class BooleanDefaultComponent extends BaseComponent<boolean> implements OnInit, OnDestroy {
  templateVars$: Observable<BooleanDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label), distinctUntilChanged());

    const reverseToggle$ = this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged());
    const checked$ = combineLatest([this.value$, reverseToggle$]).pipe(
      map(([value, reverseToogle]) => reverseToogle ? !value : value),
      distinctUntilChanged(),
    );

    this.templateVars$ = combineLatest([checked$, this.label$, this.disabled$, this.touched$]).pipe(
      map(([checked, label, disabled, touched]) => {
        const templateVars: BooleanDefaultTemplateVars = {
          checked,
          label,
          disabled,
          touched,
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
