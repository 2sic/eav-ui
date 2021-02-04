import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { FieldsSettings2Service } from '../../../../shared/services/fields-settings2.service';
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
    fieldsSettings2Service: FieldsSettings2Service,
  ) {
    super(eavService, validationMessagesService, fieldsSettings2Service);
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    this.label$ = this.settings$.pipe(map(settings => settings._label));

    this.templateVars$ = combineLatest([this.label$, this.disabled$, this.showValidation$]).pipe(
      map(([label, disabled, showValidation]) => {
        const templateVars: BooleanDefaultTemplateVars = {
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
}
