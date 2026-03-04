import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepicker, MatTimepickerModule } from '@angular/material/timepicker';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import { FieldSettingsDateTime } from 'projects/edit-types/src/FieldSettings-DateTime';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { classLog } from '../../../../../../../shared/logging';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { MatDayjsModule } from '../../../shared/date-adapters/date-adapter-api';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import {
  DateTimeUtils
} from './datetime-fn';
import { MyMatTimepickerInput } from './mat-time-picker';

const logSpecs = {
  all: false,
  updateDate: false,
  updateTime: false,
  handleDateTimeInput: false,
  disabledEffect: false,
  ngAfterViewInit: false,
  dateTimeValue: false,
  formatDateTime: false,
  InvalidDate: false,
}

/**
 * Component for date and time input field with calendar and time picker
 * Uses extracted logic functions for better testability
 */
@Component({
  selector: InputTypeCatalog.DateTimeDefault,
  templateUrl: './datetime-default.html',
  styleUrls: ['./datetime-default.scss'],
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    FieldHelperTextComponent,
    MatDayjsModule,
    TippyDirective,
    MatDatepickerModule,
    MatTimepickerModule,
    MyMatTimepickerInput
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

  // Computed value for the current date-time from UI value
  dateTimeValue = computed(() => {
    const l = this.log.fnIf('dateTimeValue', { uiValue: this.uiValue() });
    if (!this.uiValue()) return null;
    return DateTimeUtils.getDateTimeValue(this.uiValue())
  });

  // Generates time picker options including the current time and common presets
  timePickerOptions = computed(() => {
    return DateTimeUtils.generateTimePickerOptions(this.dateTimeValue());
  });

  constructor(
    private translate: TranslateService,
  ) {
    const locale = navigator.language.substring(0, 2); // e.g. 'de-De' to 'de'
    DateTimeUtils.initializeDayjs(locale);
    this.translate.currentLang = locale;
  }

  /**
   * Localized placeholder depending on locale and whether time picker is active.
   * Uses dayjs.localeData().longDateFormat('L') for the date part and 'HH:mm:ss' for time.
   * If dayjs doesn't provide a format, fall back to 'YYYY-MM-DD' (date-only) and 'YYYY-MM-DD HH:mm:ss' (date+time).
   */
  get placeholder(): string {
    const dateFmt = DateTimeUtils.getLocaleDateFormat();
    const timeFmt = 'HH:mm:ss';
    return this.useTimePicker() ? `${dateFmt} ${timeFmt}` : dateFmt;
  }

  /**
   * Set up time picker event subscription after view initialization
   */
  ngAfterViewInit(): void {
    const l = this.log.fnIf('ngAfterViewInit');
    if (this.timePickerRef) {
      this.timePickerRef.selected.subscribe(timeData => {
        if (timeData)
          this.updateFormattedValue(null, timeData.value);
      });
    }
    l.end();
  }

  /**
   * Format date for display in UI using localized format
   */
  formatDateTime(date: dayjs.Dayjs | Date | null): string {
    const l = this.log.fnIf('formatDateTime', { date: date });
    return DateTimeUtils.formatDateTime(date);
  }

  /**
   * Handle manual user input in the date-time field
   * Validates the input and updates the UI value if valid
   */
  handleDateTimeInput(event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.trim();

    this.log.aIf('handleDateTimeInput', { value });

    const isValid = DateTimeUtils.handleDateTimeInput(
      value,
      this.uiValue(),
      (value) => this.ui().setIfChanged(value),
      this.useTimePicker()
    );

    // Restore previous value if input is invalid
    if (!isValid) {
      input.value = DateTimeUtils.formatDateTime(this.dateTimeValue());
      console.error(`Invalid date format: ${value}`);
    }
  }

  /**
   * Handle time picker changes
   */
  updateTime(event: any): void {
    this.log.aIf('updateTime', { event });
    DateTimeUtils.updateTime(
      event.target.value,
      this.uiValue(),
      (value) => this.ui().setIfChanged(value)
    );
  }

  /**
   * Handle date picker changes
   */
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    this.log.aIf('updateDate', { event });

    DateTimeUtils.updateDate(
      event.value,
      this.uiValue(),
      (value) => this.ui().setIfChanged(value)
    );

    // Log invalid dates for debugging
    if (event.value && !event.value.isValid()) {
      const l = this.log.fnIf('InvalidDate', { date: event.value });
    }
  }

  /**
   * Update the formatted value by combining date and time
   * Preserves unmodified components from the current value
   */
  updateFormattedValue(date?: Dayjs, time?: Dayjs) {
    const updated = DateTimeUtils.updateFormattedValue(
      date || null,
      time || null,
      this.uiValue(),
      (value) => { }, //this.ui().setIfChanged(value),
      this.useTimePicker()
    );
    this.ui().setIfChanged(updated);
    return updated;
  }
}