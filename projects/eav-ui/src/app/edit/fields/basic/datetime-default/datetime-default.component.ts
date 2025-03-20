import { AfterViewInit, ChangeDetectionStrategy, Component, computed, ElementRef, inject, viewChild, ViewChild } from '@angular/core';
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

const logSpecs = {
  all: false,
  updateDate: true,
  updateTime: true,
  updateDateTime: true,
}

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

  log = classLog({ DatetimeDefaultComponent }, logSpecs);

  @ViewChild(MatTimepicker) timePickerRef: MatTimepicker<Dayjs>;

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsDateTime>;
  protected group = this.fieldState.group;
  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;
  protected useTimePicker = this.fieldState.settingExt('UseTimePicker');

  owlDateTimeInput = viewChild<ElementRef<HTMLInputElement>>('owlDateTimeInput');

  dateTimeValue = computed(() => dayjs.utc(this.uiValue()));

  timePickerOptions = computed(() => {
    const template = dayjs().utc().hour(0).minute(0).second(0);

    const predefinedOptions = [
      { label: '00:00 AM', value: template.hour(0) },
      { label: '06:00 AM', value: template.hour(6) },
      { label: '08:00 AM', value: template.hour(8) },
      { label: '10:00 AM', value: template.hour(10) },
      { label: '12:00 PM', value: template.hour(12) },
      { label: '06:00 PM', value: template.hour(18) },
    ];

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
    // Set the Date/Time format to the browser's language (de-De, en.En, etc.)
    dayjs.extend(utc);
    // set date format based on the users browser language
    this.translate.currentLang = navigator.language;
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

    const owlDateTimeInput = this.owlDateTimeInput();
    if (owlDateTimeInput?.nativeElement)
      owlDateTimeInput.nativeElement.disabled = this.ui().disabled;
  }

  updateTime(event: any): void {
    this.log.aIf('updateTime', {event});
    const time = dayjs(event.target.value, 'HH:mm');

    if (time == null) {
      this.ui().setIfChanged(null);
      return;
    }

    if (time.isValid())
      this.updateFormattedValue(null, time);
  }

  // Material Date Picker Event Handler
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    this.log.aIf('updateDate', {event});
    const date = event.value;

    if (date == null) {
      this.ui().setIfChanged(null);
      return;
    }

    if (date.isValid())
      this.updateFormattedValue(date, null);
    else {
      console.log('Invalid Date');
    }
  }

  updateDateTime(event: MatDatepickerInputEvent<Dayjs>) {
    const dateTime = event.value;
    this.log.aIf('updateDateTime', {event, dateTime});
    
    if (dateTime == null) {
      this.ui().setIfChanged(null);
      return;
    }

    this.ui().setIfChanged(
      dateTime != null ? dateTime.utc(true).toJSON() : null
    );
  }

  // Combines the date and time values and updates the aUI
  updateFormattedValue(date?: Dayjs, time?: Dayjs) {
    if (!date && !time) return;

    // Set current date and time from UI or initiate with current date and 12:00 AM
    let currentDateTime = dayjs(this.uiValue()).isValid()
      ? dayjs(this.uiValue()).utc()
      : dayjs().utc().hour(0).minute(0).second(0);

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

    // Only return the date if the 
    if (!this.useTimePicker())
      this.ui().setIfChanged(currentDateTime.utc().hour(0).toISOString());
    else
      this.ui().setIfChanged(currentDateTime.toISOString());

    return currentDateTime.toISOString();
  };
}
