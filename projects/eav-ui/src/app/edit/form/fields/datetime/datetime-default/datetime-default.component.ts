import { Component, OnDestroy, OnInit } from '@angular/core';
import { MatDatepickerInputEvent, MatDatepickerModule } from '@angular/material/datepicker';
import { TranslateService, TranslateModule } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc'; // 'neutral' time for OwlDateTime picker
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { MatDayjsDateAdapter } from '../../../../shared/date-adapters/date-adapter-api'
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { DatetimeDefaultViewModel } from './datetime-default.models';
import { DateTimeAdapter, OwlDateTimeModule } from '@danielmoncada/angular-datetime-picker';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { SharedComponentsModule } from '../../../../../shared/shared-components.module';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { OwlDayJsDateTimeModule } from '@danielmoncada/angular-datetime-picker-dayjs-adapter';

@Component({
  selector: InputTypeConstants.DatetimeDefault,
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
    AsyncPipe,
    TranslateModule,
    OwlDayJsDateTimeModule,
  ],

})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  viewModel: Observable<DatetimeDefaultViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private matDayjsDateAdapter: MatDayjsDateAdapter,
    private owlDayjsDateAdapter: DateTimeAdapter<Dayjs>,
  ) {
    super(eavService, fieldsSettingsService);
    dayjs.extend(utc); // 'neutral' time for OwlDateTime picker
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.owlDayjsDateAdapter.setLocale(currentLang);
  }

  ngOnInit() {
    super.ngOnInit();
    const useTimePicker$ = this.settings$.pipe(map(settings => settings.UseTimePicker), distinctUntilChanged());

    this.viewModel = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([useTimePicker$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [useTimePicker],
      ]) => {
        const viewModel: DatetimeDefaultViewModel = {
          controlStatus: { ...controlStatus, value: controlStatus.value?.replace('Z', '') }, // remove Z - to get 'neutral' time for OwlDateTime picker
          label,
          placeholder,
          required,
          useTimePicker,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs>) {
    // utc(keepLocalTime: true) to preserve 'neutral' time from OwlDateTime picker
    const newValue = event.value != null ? event.value.utc(true).toJSON() : null;
    GeneralHelpers.patchControlValue(this.control, newValue);
  }
}
