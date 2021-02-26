import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
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

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
    BooleanTristateLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.value$ = this.value$.pipe(map(value => (value === '') ? null : value));
    this.label$ = this.settings$.pipe(map(settings => settings._label));

    this.templateVars$ = combineLatest([this.value$, this.label$, this.disabled$, this.showValidation$]).pipe(
      map(([value, label, disabled, showValidation]) => {
        const templateVars: BooleanTristateTemplateVars = {
          value,
          label,
          disabled,
          showValidation,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  toggle() {
    const currentValue: boolean | '' = this.control.value;
    let nextValue: boolean;
    switch (currentValue) {
      case false:
        nextValue = null;
        break;
      case '':
      case null:
        nextValue = true;
        break;
      case true:
        nextValue = false;
        break;
    }
    this.control.patchValue(nextValue);
  }

}
