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

  // not in use, but is there if needed
  // timeValue = new FormControl<Dayjs | null>(null);
  // dateValue = new FormControl<Dayjs | null>(null)

  dateTimeValue = computed(() => {
    const uiValue = this.uiValue(); // Access the raw UI value
    if (!uiValue) return dayjs().utc(); // Fallback if no value
    const dayJsValue = dayjs.utc(uiValue); // Parse as UTC
    return dayJsValue; // Return as UTC
  });

  timePickerOptions = computed(() => {
    const template = dayjs().hour(0).minute(0).second(0);
    
    const predefinedOptions = [
      { label: '00:00', value: template.hour(0) },
      { label: '06:00', value: template.hour(6) },
      { label: '08:00', value: template.hour(8) },
      { label: '10:00', value: template.hour(10) },
      { label: '12:00', value: template.hour(12) },
      { label: '18:00', value: template.hour(18) },
    ];

    const userOption = {
      label: this.dateTimeValue().format('HH:mm'),
      value: dayjs()
        .utc()
        .hour(this.dateTimeValue().hour())
        .minute(this.dateTimeValue().minute())
        .second(0),
    };

    // Check if the custom option is already in the predefined and return if so
    if (
      predefinedOptions.some(
        (option) =>
          option.value.hour() === userOption.value.hour() &&
          option.value.minute() === userOption.value.minute()
      )
    )
      return predefinedOptions;

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
          const timeValue = timeData.value;
          this.updateFormattedValue(null, timeValue);
        }
      });
    }
  }

  onTimeInputChange(event: any): void {
    const inputValue = event.target.value;

    // Parse the inputValue to create a Dayjs object
    const time = dayjs(inputValue, 'HH:mm');

    if (time.isValid()) {
      this.updateFormattedValue(undefined, time);
    }
  }

  // Material Date Picker Event Handler
  updateDate(event: MatDatepickerInputEvent<Dayjs>) {
    if (event.value) {
      const dateValue = event.value;
      this.updateFormattedValue(dateValue, null);
    }
  }

  updateDateTime(event: Event) {
    const inputElement = event.target as HTMLInputElement;
    // const newDateTime = this.matDayjsDateAdapter.parse(inputElement.value, 'DD.MM.YYYY HH:mm');
    const newDateTime = inputElement.value;
    const time = dayjs().utc().hour(dayjs(newDateTime).utc().hour()).minute(dayjs(newDateTime).utc().minute()).second(dayjs(newDateTime).second());
    const date = dayjs().utc().year(dayjs(newDateTime).utc().year()).month(dayjs(newDateTime).utc().month()).day(dayjs(newDateTime).day());

    this.updateFormattedValue(date, time);
  }
  
  // Combines the date and time values and updates the aUI
  updateFormattedValue(date?: Dayjs, time?: Dayjs) {
    if (!date && !time) return;

    let currentDateTime = dayjs(this.uiValue()).utc();

    if (date) {
      currentDateTime = currentDateTime
        .year(date.year())
        .month(date.month())
        .date(date.date());
    }

    if (time) {
      currentDateTime = currentDateTime
        .hour(time.hour())
        .minute(time.minute())
        .second(time.second());
    }
    // console.log('currentDateTime', currentDateTime);
    // const updatedDateTime = this.matDayjsDateAdapter.parse(currentDateTime.utc(), 'YYYY-MM-DDTHH:mm:ss[Z]');
    // console.log('updatedDateTime', updatedDateTime);

    this.ui().setIfChanged(currentDateTime.toISOString());
    return currentDateTime.toISOString();
  };

  // Old OWL DateTime Picker
  // updateValue(event: MatDatepickerInputEvent<Dayjs>) {
  //   const newValue = event.value != null ? event.value.toJSON() : null;
  //   this.ui().setIfChanged(newValue);
  // }
}
