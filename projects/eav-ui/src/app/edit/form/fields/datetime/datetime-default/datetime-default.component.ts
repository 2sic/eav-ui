import { NgxMatDatetimepicker } from '@angular-material-components/datetime-picker';
import { NgxMatDatepickerInputEvent } from '@angular-material-components/datetime-picker/lib/datepicker-input-base';
import { Component, Inject, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { MatDatepicker, MatDatepickerInputEvent } from '@angular/material/datepicker';
import { TranslateService } from '@ngx-translate/core';
import dayjs, { Dayjs } from 'dayjs';
import utc from 'dayjs/plugin/utc';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { MatDayjsDateAdapter, NgxMatDayjsDatetimeAdapter, NgxMatDayjsDatetimeAdapterOptions, NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS } from '../../../../shared/date-adapters/date-adapter-api'
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { DatetimeDefaultViewModel } from './datetime-default.models';

@Component({
  selector: InputTypeConstants.DatetimeDefault,
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class DatetimeDefaultComponent extends BaseFieldComponent<string> implements OnInit, OnDestroy {
  @ViewChild('picker') private picker?: MatDatepicker<Dayjs> | NgxMatDatetimepicker<Dayjs>;

  /** THIS IS A HACK 
   * With Angular Material versions 16.2.X and next NgxMatDatetimepicker doesn't load CSS styles correctly 
   * so we created a hidden picker to force load the styles.
   * https://github.com/h2qutc/angular-material-components/issues/372#issuecomment-1819690056
   * https://github.com/h2qutc/angular-material-components/issues/348#issuecomment-1842649500
   * also possibly related with this issue -> https://github.com/h2qutc/angular-material-components/issues/356
   */
  @ViewChild('hiddenPicker') private readonly hiddenPicker: MatDatepicker<null>;
  visible = true;

  viewModel: Observable<DatetimeDefaultViewModel>;

  constructor(
    eavService: EavService,
    fieldsSettingsService: FieldsSettingsService,
    private translate: TranslateService,
    private matDayjsDateAdapter: MatDayjsDateAdapter,
    private ngxMatDayjsDatetimeAdapter: NgxMatDayjsDatetimeAdapter,
    @Inject(NGX_MAT_DAYJS_DATETIME_ADAPTER_OPTIONS) private ngxMatDayjsDatetimeAdapterOptions?: NgxMatDayjsDatetimeAdapterOptions,
  ) {
    super(eavService, fieldsSettingsService);
    const currentLang = this.translate.currentLang;
    dayjs.locale(currentLang);
    this.matDayjsDateAdapter.setLocale(currentLang);
    this.ngxMatDayjsDatetimeAdapter.setLocale(currentLang);
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
          controlStatus,
          label,
          placeholder,
          required,
          useTimePicker,
        };
        return viewModel;
      }),
    );
  }
  
  /** HACK
   * Force load CSS styles for NgxMatDatetimepicker.
   */
  ngAfterViewInit(): void {
    if (this.hiddenPicker !== undefined) {
      this.hiddenPicker.open();
      this.hiddenPicker.close();
      this.visible = false;
    }
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue(event: MatDatepickerInputEvent<Dayjs> | NgxMatDatepickerInputEvent<Dayjs>) {
    const newValue = event.value != null ? event.value.toJSON() : null;
    GeneralHelpers.patchControlValue(this.control, newValue);
  }

  pickerOpened(): void {
    dayjs.extend(utc);

    if (!(this.picker instanceof NgxMatDatetimepicker)) { return; }

    if (this.ngxMatDayjsDatetimeAdapterOptions?.useUtc) {
      if (this.control.value) {
        // Fixes visual bug where picker dialog shows incorrect time if value is changed with formula but date remains the same.
        // Probably something broken with change detection inside picker.
        // https://github.com/h2qutc/angular-material-components/issues/220
        this.picker.select(dayjs.utc(this.control.value));
      } else {
        // Displays current time as UTC if there was no previous value.
        // This means that user initially sees the same time it sees on computer clock,
        // but when value is selected it works like UTC.
        const dateTime = dayjs();
        const dateTimeString = `${dateTime.format('YYYY-MM-DD')}T${dateTime.format('HH:mm:ss.SSS')}Z`;
        this.picker.select(dayjs.utc(dateTimeString, 'YYYY-MM-DDTHH:mm:ss.SSSZ'));
      }
    }
  }
}
