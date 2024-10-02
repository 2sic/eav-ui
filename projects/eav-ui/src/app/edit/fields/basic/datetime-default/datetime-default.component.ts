import { DatePipe } from '@angular/common';
import { Component, computed, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { transient } from '../../../../../../../core/transient';
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
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    OwlDateTimeModule,
    FieldHelperTextComponent,
    TranslateModule,
    OwlDayJsDateTimeModule,
    MatDayjsModule,
    DatePipe,
    TippyDirective,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent {

  log = classLog({DatetimeDefaultComponent});

  protected fieldState = inject(FieldState) as FieldState<string>;

  protected group = this.fieldState.group;

  protected ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;
  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected useTimePicker = computed(() => this.settings().UseTimePicker, SignalEquals.bool);

  /** The date/time picker needs the date-info cleaned up, so it doesn't do time-zone handling */
  valueForTimePicker = computed(() => this.uiValue()?.replace('Z', ''), SignalEquals.string);

  private matDayjsDateAdapter = transient(MatDayjsDateAdapter);
  constructor(
    private translate: TranslateService,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>,
  ) {
    dayjs.extend(utc); // 'neutral' time for OwlDateTime picker
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
    DateTimeDefaultLogic.importMe();
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    // @2dg old code, remove after test and verify from 2dm
    // utc(keepLocalTime: true) to preserve 'neutral' time from OwlDateTime picker
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    this.ui().setIfChanged(newValue);
  }
}
