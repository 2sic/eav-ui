import { AfterViewInit, ChangeDetectionStrategy, Component, computed, inject, ViewChild } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatTimepicker, MatTimepickerModule, MatTimepickerOption } from '@angular/material/timepicker';
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
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent implements AfterViewInit {

  log = classLog({ DatetimeDefaultComponent });

  @ViewChild(MatTimepicker) myComponentRef: MatTimepicker<Dayjs>;

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsDateTime>;
  protected group = this.fieldState.group;
  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected basics = this.fieldState.basics;
  protected useTimePicker = this.fieldState.settingExt('UseTimePicker');

  valueForTimePicker = computed(() => this.uiValue()?.replace('Z', ''), SignalEquals.string);

  dateValue: Dayjs = dayjs(); // Selected date value
  timeValue: Dayjs = dayjs(); // Selected time value

  // Predefined options for the time picker
  timePickerOptions: MatTimepickerOption<Dayjs>[] = [
    { label: '12:00 AM', value: dayjs().hour(0).minute(0).second(0) },   // Midnight
    { label: '06:00 AM', value: dayjs().hour(6).minute(0).second(0) },
    { label: '08:00 AM', value: dayjs().hour(8).minute(0).second(0) },
    { label: '10:00 AM', value: dayjs().hour(10).minute(0).second(0) },
    { label: '12:00 PM', value: dayjs().hour(12).minute(0).second(0) },  // Noon
    { label: '06:00 PM', value: dayjs().hour(18).minute(0).second(0) },
  ];

  private matDayjsDateAdapter = transient(MatDayjsDateAdapter);

  constructor(
    private translate: TranslateService,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>
  ) {
    dayjs.extend(utc); // 'neutral' time for OWLDateTime
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
    DateTimeDefaultLogic.importMe();
  }

  ngAfterViewInit(): void {
    if (this.myComponentRef) {
      this.myComponentRef.selected.subscribe(value => {
        if (value) {
          this.timeValue = this.timeValue
            .hour(value.value.hour())
            .minute(value.value.minute())
            .second(value.value.second());
          this.updateFormattedValue();
        }
      });
    }
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    this.ui().setIfChanged(newValue);
  }

  // Updates dateValue when a date is selected in the Material Date Picker
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    if (event.value) {
      this.dateValue = this.dateValue
        .year(event.value.year())
        .month(event.value.month())
        .date(event.value.date());
      this.updateFormattedValue();
    }
  }

  // Combines the date and time values into a single ISO string
  updateFormattedValue() {
    const combinedValue = this.dateValue
      .hour(this.timeValue.hour())
      .minute(this.timeValue.minute())
      .second(this.timeValue.second());

    this.ui().setIfChanged(combinedValue.toISOString());
    return combinedValue.toISOString();
  }
}
