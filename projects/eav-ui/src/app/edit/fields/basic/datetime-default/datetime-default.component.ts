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

  dateTimeValue = computed(() => dayjs(this.uiValue()).utc(true));

  timePickerOptions = computed(() => {
    const predefinedOptions = [
      { label: '12:00 AM', value: dayjs().hour(0).minute(0).second(0) },
      { label: '06:00 AM', value: dayjs().hour(6).minute(0).second(0) },
      { label: '08:00 AM', value: dayjs().hour(8).minute(0).second(0) },
      { label: '10:00 AM', value: dayjs().hour(10).minute(0).second(0) },
      { label: '12:00 PM', value: dayjs().hour(12).minute(0).second(0) },
      { label: '06:00 PM', value: dayjs().hour(18).minute(0).second(0) },
    ];

    // Selected option by user
    const userOption = {
      label: this.dateTimeValue().format('hh:mm A'),
      value: dayjs()
        .hour(this.dateTimeValue().hour())
        .minute(this.dateTimeValue().minute())
        .second(0),
    };

    // Check if the custom option is already in the predefined and return if so
    if (predefinedOptions.some(
      option =>
        option.value.utc().hour() === userOption.value.utc().hour() &&
        option.value.utc().minute() === userOption.value.utc().minute()
    ))
      return predefinedOptions;

    // Combine and sort the options by time
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
    // Material Time Picker Event Handler
    if (this.timePickerRef) {
      this.timePickerRef.selected.subscribe(timeData => {
        if (timeData) {
          const timeValue = timeData.value.utc(true);
          this.updateFormattedValue(timeValue);
        }
      });
    }
  }

  // Material Date Picker Event Handler
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    if (event.value) {
      const dateValue = event.value.utc(true);
      this.updateFormattedValue(dateValue);
    }
  }

  // Combines the date and time values and updates the UI
  updateFormattedValue(date?: Dayjs, time?: Dayjs) {
    // If either date or time is undefined, return early
    if (!date && !time)
      return;

    if (date) {
      const updatedDate = dayjs()
        .utc(true)
        .year(date.year())
        .month(date.month())
        .date(date.date());

      this.ui().setIfChanged(updatedDate.toISOString());
    }

    if (time) {
      const updatedTime = dayjs()
        .utc(true)
        .hour(time.hour())
        .minute(time.minute())
        .second(time.second());

      this.ui().setIfChanged(updatedTime.toISOString());
    }
  }

  // Old OWL DateTime Picker
  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    this.ui().setIfChanged(newValue);
  }
}
