import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { NumberDefaultTemplateVars } from './number-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class NumberDefaultComponent extends BaseComponent<number> implements OnInit, OnDestroy {
  templateVars$: Observable<NumberDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    fieldsSettingsService: FieldsSettingsService,
  ) {
    super(eavService, validationMessagesService, fieldsSettingsService);
  }

  ngOnInit() {
    super.ngOnInit();
    const min$ = this.settings$.pipe(map(settings => settings.Min), distinctUntilChanged());
    const max$ = this.settings$.pipe(map(settings => settings.Max), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([this.label$, this.placeholder$, this.required$, min$, max$]),
      combineLatest([this.disabled$, this.touched$]),
    ]).pipe(
      map(([
        [label, placeholder, required, min, max],
        [disabled, touched],
      ]) => {
        const templateVars: NumberDefaultTemplateVars = {
          label,
          placeholder,
          required,
          min,
          max,
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
}
