import { Component, computed, inject, Signal } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { MatDayjsDateAdapter } from '../../../../shared/date-adapters/date-adapter-api'
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { ControlStatus } from '../../../../shared/models';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

@Component({
  selector: InputTypeConstants.DateTimeDefault,
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    MatDatepickerModule,
    SharedComponentsModule,
    OwlDateTimeModule,
    FieldHelperTextComponent,
    TranslateModule,
    OwlDayJsDateTimeModule,
  ],

})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class DatetimeDefaultComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected control = this.fieldState.control;

  protected controlStatus = this.fieldState.controlStatus as Signal<ControlStatus<string>>;
  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected useTimePicker = computed(() => this.settings().UseTimePicker, SignalHelpers.boolEquals);

  constructor(
    private translate: TranslateService,
    private matDayjsDateAdapter: MatDayjsDateAdapter,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>,
  ) {
    dayjs.extend(utc); // 'neutral' time for OwlDateTime picker
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    // utc(keepLocalTime: true) to preserve 'neutral' time from OwlDateTime picker
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    ControlHelpers.patchControlValue(this.control, newValue);
  }
}
