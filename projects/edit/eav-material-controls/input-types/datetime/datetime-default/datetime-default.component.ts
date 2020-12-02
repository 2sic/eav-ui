import { NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { TranslateService } from '@ngx-translate/core';
import { combineLatest, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { EavService } from '../../../../shared/services/eav.service';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { BaseComponent } from '../../base/base.component';
import { DatetimeDefaultTemplateVars } from './datetime-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
})
@InputType({
  wrapper: [WrappersConstants.LocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<DatetimeDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    validationMessagesService: ValidationMessagesService,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<any>,
    private ngxDateTimeAdapter: NgxMatDateAdapter<any>,
  ) {
    super(eavService, validationMessagesService);
    const currentLang = this.translate.currentLang;
    this.dateAdapter.setLocale(currentLang);
    this.ngxDateTimeAdapter.setLocale(currentLang);
  }

  ngOnInit() {
    super.ngOnInit();
    const useTimePicker$ = this.settings$.pipe(map(settings => settings.UseTimePicker));

    this.templateVars$ = combineLatest([
      combineLatest([useTimePicker$, this.placeholder$, this.required$, this.label$]),
      combineLatest([this.disabled$, this.showValidation$]),
    ]).pipe(
      map(([
        [useTimePicker, placeholder, required, label],
        [disabled, showValidation],
      ]) => {
        const templateVars: DatetimeDefaultTemplateVars = {
          useTimePicker,
          placeholder,
          required,
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
