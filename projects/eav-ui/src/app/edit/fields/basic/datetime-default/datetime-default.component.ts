import { DatePipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepickerModule } from '@angular/material/timepicker';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { FieldSettingsDateTime } from 'projects/edit-types/src/FieldSettings-DateTime';
import { transient } from '../../../../../../../core/transient';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { classLog } from '../../../../shared/logging';
import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { MatDayjsDateAdapter, MatDayjsModule } from '../../../shared/date-adapters/date-adapter-api';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { DateTimeDefaultLogic } from './datetime-default-logic';

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
  providers: [DatePipe]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent {

  log = classLog({ DatetimeDefaultComponent });

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsDateTime>;

  protected group = this.fieldState.group;

  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;

  protected useTimePicker = this.fieldState.settingExt('UseTimePicker');

  /** The date/time picker needs the date-info cleaned up, so it doesn't do time-zone handling */
  valueForTimePicker = computed(() => this.uiValue()?.replace('Z', ''), SignalEquals.string);

  // Time value (angular material date & time picker output)
  value: Date = new Date();

  private matDayjsDateAdapter = transient(MatDayjsDateAdapter);
  constructor(
    private translate: TranslateService,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>,
    private datePipe: DatePipe
  ) {
    this.updateFormattedValue();
    dayjs.extend(utc); // 'neutral' time for OwlDateTime 
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
    DateTimeDefaultLogic.importMe();
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    this.ui().setIfChanged(newValue);
    console.log('ui old', this.ui());
  }

  updateDate(event: MatDatepickerInputEvent<Date>) {
    let selectedDate: Date | undefined;

    if ('value' in event && event.value) {
      selectedDate = event.value instanceof Date ? event.value : new Date(event.value);
    } else {
      console.error('Invalid event format for date:', event);
      return;
    }
  
    if (!isNaN(selectedDate?.getTime() ?? NaN)) {
      this.value.setFullYear(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate());
      this.updateFormattedValue();
      console.log('Date updated:', this.value);
    } else {
      console.error('Invalid date value:', event);
    }
  }
    
  updateTime(event: any) {
    let selectedTime: Date | undefined;

    if ('value' in event && event.value) {
      selectedTime = new Date(event.value);
    } else {
      console.error('Invalid event format for time:', event);
      return;
    }
  
    if (!isNaN(selectedTime.getTime())) {
      this.value.setHours(selectedTime.getHours(), selectedTime.getMinutes(), selectedTime.getSeconds());
      this.updateFormattedValue();
      console.log('Time updated:', this.value);
    } else {
      console.error('Invalid time value:', event);
    }
  }
  
  private updateFormattedValue() {
    // Synchronize the `value` into the desired ISO format
    this.ui().setIfChanged(dayjs(this.value).toISOString());
  }
}
