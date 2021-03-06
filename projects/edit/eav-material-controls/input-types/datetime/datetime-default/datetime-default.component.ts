import { MatDatetimePickerInputEvent, NgxMatDateAdapter } from '@angular-material-components/datetime-picker';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import { Moment } from 'moment';
import { combineLatest, Observable } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { ComponentMetadata } from '../../../../eav-dynamic-form/decorators/component-metadata.decorator';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { BaseComponent } from '../../base/base.component';
import { DatetimeDefaultTemplateVars } from './datetime-default.models';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
})
@ComponentMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  templateVars$: Observable<DatetimeDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<any>,
    private ngxDateTimeAdapter: NgxMatDateAdapter<any>,
  ) {
    super(eavService, fieldsSettingsService);
    const currentLang = this.translate.currentLang;
    this.dateAdapter.setLocale(currentLang);
    this.ngxDateTimeAdapter.setLocale(currentLang);
  }

  ngOnInit() {
    super.ngOnInit();
    const useTimePicker$ = this.settings$.pipe(map(settings => settings.UseTimePicker), distinctUntilChanged());

    this.templateVars$ = combineLatest([
      combineLatest([useTimePicker$, this.placeholder$, this.required$, this.label$]),
      combineLatest([this.disabled$, this.touched$, this.value$]),
    ]).pipe(
      map(([
        [useTimePicker, placeholder, required, label],
        [disabled, touched, value],
      ]) => {
        const templateVars: DatetimeDefaultTemplateVars = {
          useTimePicker,
          placeholder,
          required,
          label,
          disabled,
          touched,
          value,
        };
        return templateVars;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue(event: MatDatepickerInputEvent<Moment> | MatDatetimePickerInputEvent<Moment>) {
    const newValue = event.value != null ? event.value.toJSON() : null;
    GeneralHelpers.patchControlValue(this.control, newValue);
  }
}
