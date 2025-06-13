import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepicker, MatTimepickerModule } from '@angular/material/timepicker';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { FieldSettingsDateTime } from 'projects/edit-types/src/FieldSettings-DateTime';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLogEnabled } from '../../../../shared/logging';
import { MatDayjsModule } from '../../../shared/date-adapters/date-adapter-api';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';

const logSpecs = {
  all: false,
  updateDate: false,
  updateTime: false,
  handleDateTimeInput: false,
  disabledEffect: false,
  ngAfterViewInit: true,
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
    FieldHelperTextComponent,
    MatDayjsModule,
    TippyDirective,
    MatDatepickerModule,
    MatTimepickerModule
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent implements AfterViewInit {

  log = classLogEnabled({ DatetimeDefaultComponent }, logSpecs);

  @ViewChild(MatTimepicker) timePickerRef: MatTimepicker<Dayjs>;

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsDateTime>;
  protected group = this.fieldState.group;
  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;
  protected useTimePicker = this.fieldState.settingExt('UseTimePicker');

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


  constructor(
    private translate: TranslateService,
  ) {
    // Set the Date/Time format to the browser's language (de-De, en.En, etc.)
    dayjs.extend(utc);
    // set date format based on the users browser language
    this.translate.currentLang = navigator.language;
    dayjs.locale(this.translate.currentLang);
    // DateTimeDefaultLogic.importMe(); @2dg, comment out doesn't see any effect, 13.6.2025
  }

  // 2025-03-20 2pp - Workaround for a bug
  // For updating the disabled state automatically
  // For now not enabled, because it seems that the Owl bug self-repairs
  // if it's been set once in the ngAfterViewInit().
  // effect(() => this.workaroundSetDisabledForOwlDateTimePicker());
  ngAfterViewInit(): void {
    const l = this.log.fnIf('ngAfterViewInit');
    if (this.timePickerRef) { // Material Time Picker Event Handler
      this.timePickerRef.selected.subscribe(timeData => {
        if (timeData)
          this.updateFormattedValue(null, timeData.value);
      });
    }
    l.end();
  }

  // Formats the date and time for display in the UI 
  formatDateTime(date: dayjs.Dayjs | Date | null): string {
    if (!date) return '';
    return dayjs(date).format('L LT'); // L = localized date format, LT = localized time
  }

  /**
 * Handles user input in date-time field
 */
  handleDateTimeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    this.log.aIf('handleDateTimeInput', { value });

    if (!value) {
      this.ui().setIfChanged(null);
      return;
    }

    // Try parsing with localized format 
    let parsedDate = dayjs(value, 'L LT');

    if (parsedDate.isValid()) {
      // Use your existing updateFormattedValue method to update both date and time
      this.updateFormattedValue(parsedDate, parsedDate);
    } else {
      input.value = this.formatDateTime(this.dateTimeValue()); // Restore previous valid value
      console.error(`Invalid date format: ${value}`); // Show error in console for debugging
    }
  }

  updateTime(event: any): void {
    this.log.aIf('updateTime', { event });
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
    this.log.aIf('updateDate', { event });
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
