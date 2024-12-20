import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepicker, MatTimepickerModule } from '@angular/material/timepicker';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { transient } from 'projects/core';
import { FieldSettingsDateTime } from 'projects/edit-types/src/FieldSettings-DateTime';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { MatDayjsDateAdapter, MatDayjsModule } from '../../../shared/date-adapters/date-adapter-api';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { DateTimeDefaultLogic } from './datetime-default-logic';

dayjs.extend(utc); // Extend dayjs with UTC support

@Component({
  selector: InputTypeCatalog.DateTimeDefault,
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    OwlDateTimeModule,
    FieldHelperTextComponent,
    OwlDayJsDateTimeModule,
    MatDayjsModule,
    TippyDirective,
    MatDatepickerModule,
    MatTimepickerModule,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent implements AfterViewInit {

  log = classLog({ DatetimeDefaultComponent });

  @ViewChild(MatTimepicker) timePickerRef: MatTimepicker<Dayjs>;

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsDateTime>;
  protected group = this.fieldState.group;
  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;
  protected useTimePicker = this.fieldState.settingExt('UseTimePicker');

  dateTimeValue = computed(() => dayjs.utc(this.uiValue() || dayjs().utc()));

  timePickerOptions = computed(() => {
    const predefinedOptions = [0, 6, 8, 10, 12, 18].map(hour => {
      const value = dayjs().utc().hour(hour).minute(0).second(0);
      return { label: value.format('HH:mm A'), value };
    });

    const userOption = {
      label: this.dateTimeValue().format('HH:mm A'),
      value: dayjs()
        .utc()
        .hour(this.dateTimeValue().hour())
        .minute(this.dateTimeValue().minute())
        .second(0),
    };

    if ( // Check if the custom option is already in the predefined and return if so
      predefinedOptions.some(
        (option) =>
          option.value.hour() === userOption.value.hour() &&
          option.value.minute() === userOption.value.minute()
      )
    ) return predefinedOptions;

    const allOptions = [...predefinedOptions, userOption];
    allOptions.sort((a, b) => a.value.valueOf() - b.value.valueOf());

    return allOptions;
  });

  private matDayjsDateAdapter = transient(MatDayjsDateAdapter);

  constructor(
    private translate: TranslateService,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>
  ) {
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
    DateTimeDefaultLogic.importMe();
  }

  ngAfterViewInit(): void {
    if (this.timePickerRef) { // Material Time Picker Event Handler
      this.timePickerRef.selected.subscribe(timeData => {
        if (timeData)
          this.updateFormattedValue(null, timeData.value);
      });
    }
  }

  onTimeInputChange(event: any): void {
    const time = dayjs(event.target.value, 'HH:mm');

    if (time.isValid())
      this.updateFormattedValue(undefined, time);
  }

  // Material Date Picker Event Handler
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    const dateValue = event.value;
    if (dateValue)
      this.updateFormattedValue(dateValue, null);
  }

  updateDateTime(event: MatDatepickerInputEvent<Dayjs>) {
    const timeValue = event.value;
    this.ui().setIfChanged(
      timeValue != null ? timeValue.utc(true).toJSON() : null
    );
  }

  // Combines the date and time values and updates the aUI
  updateFormattedValue(date?: Dayjs, time?: Dayjs) {
    if (!date && !time) return;

    let currentDateTime = dayjs(this.uiValue()).utc();

    if (date)
      currentDateTime = currentDateTime
        .year(date.year())
        .month(date.month())
        .date(date.date());

    if (time)
      currentDateTime = currentDateTime
        .hour(time.hour())
        .minute(time.minute())
        .second(time.second());

    this.ui().setIfChanged(currentDateTime.toISOString());
    return currentDateTime.toISOString();
  };
}
