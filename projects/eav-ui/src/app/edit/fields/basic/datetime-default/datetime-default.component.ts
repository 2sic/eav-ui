import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { EavLogger } from './../../../../shared/logging/eav-logger';
import { Component, computed, inject, Signal } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { DatePipe } from '@angular/common';
import { DateTimeDefaultLogic } from './datetime-default-logic';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { MatDayjsModule, MatDayjsDateAdapter } from '../../../shared/date-adapters/date-adapter-api';
import { ControlHelpers } from '../../../shared/controls/control.helpers';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { transient } from '../../../../core/transient';
import { ControlStatus } from '../../../shared/controls/control-status.model';

const logThis = false;
const nameOfThis = 'DateTimeDefaultComponent';

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

  protected fieldState = inject(FieldState) as FieldState<string>;

  protected group = this.fieldState.group;
  protected control = this.fieldState.control;

  protected controlStatus = this.fieldState.controlStatus;
  uiValue = this.fieldState.uiValue;
  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected useTimePicker = computed(() => this.settings().UseTimePicker, SignalEquals.bool);

  log = new EavLogger(nameOfThis, logThis);

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
    ControlHelpers.patchControlValue(this.control, newValue);
  }
}
