import { MatDatetimePickerInputEvent, NgxMatDateAdapter, NgxMatDatetimePicker } from '@angular-material-components/datetime-picker';
import { NgxMatMomentDateAdapterOptions, NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS } from '@angular-material-components/moment-adapter';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { DateAdapter } from '@angular/material/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import * as moment from 'moment';
import { Moment } from 'moment';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../ng-dialogs/src/app/content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseComponent } from '../../base/base.component';
import { DatetimeDefaultTemplateVars } from './datetime-default.models';

@Component({
  selector: InputTypeConstants.DatetimeDefault,
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseComponent<string> implements OnInit, OnDestroy {
  @ViewChild('picker') private picker?: MatDatepicker<Moment> | NgxMatDatetimePicker<Moment>;

  templateVars$: Observable<DatetimeDefaultTemplateVars>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private dateAdapter: DateAdapter<any>,
    private ngxDateTimeAdapter: NgxMatDateAdapter<any>,
    @Inject(NGX_MAT_MOMENT_DATE_ADAPTER_OPTIONS) private ngxMatMomentDateAdapterOptions?: NgxMatMomentDateAdapterOptions,
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
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([useTimePicker$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [useTimePicker],
      ]) => {
        const templateVars: DatetimeDefaultTemplateVars = {
          controlStatus,
          label,
          placeholder,
          required,
          useTimePicker,
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

  pickerOpened(): void {
    if (!(this.picker instanceof NgxMatDatetimePicker)) { return; }

    if (this.ngxMatMomentDateAdapterOptions?.useUtc) {
      if (this.control.value) {
        // Fixes visual bug where picker dialog shows incorrect time if value is changed with formula but date remains the same.
        // Probably something broken with change detection inside picker.
        // https://github.com/h2qutc/angular-material-components/issues/220
        this.picker._selected = moment.utc(this.control.value);
      } else {
        // Displays current time as UTC if there was no previous value.
        // This means that user initially sees the same time it sees on computer clock,
        // but when value is selected it works like UTC.
        const dateTime = moment();
        const dateTimeString = `${dateTime.format('YYYY-MM-DD')}T${dateTime.format('HH:mm:ss.SSSS')}Z`;
        this.picker._selected = moment.utc(dateTimeString);
      }
    }
  }
}
