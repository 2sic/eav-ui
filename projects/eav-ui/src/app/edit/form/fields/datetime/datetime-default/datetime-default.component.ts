import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { MatDayjsDateAdapter } from '../../../../shared/date-adapters/date-adapter-api'
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';

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
export class DatetimeDefaultComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected groupTemp = this.fieldState.group;
  // protected controlStatusTemp = this.fieldState.controlStatus;
  protected basicsTemp = this.fieldState.basics;

  constructor(
    private translate: TranslateService,
    private matDayjsDateAdapter: MatDayjsDateAdapter,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>,
  ) {
    super();
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
