import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersConstants } from '../../../../shared/constants/wrappers.constants';
import { GeneralHelpers } from '../../../../shared/helpers';
import { EavService, FieldsSettingsService } from '../../../../shared/services';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { NumberDefaultViewModel } from './number-default.models';
import { NumberDefaultLogic } from './number-default-logic';

@Component({
  selector: InputTypeConstants.NumberDefault,
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.scss'],
})
@FieldMetadata({
  wrappers: [WrappersConstants.LocalizationWrapper],
})
export class NumberDefaultComponent extends BaseFieldComponent<number> implements OnInit, OnDestroy {
  viewModel: Observable<NumberDefaultViewModel>;

  constructor(eavService: EavService, fieldsSettingsService: FieldsSettingsService) {
    super(eavService, fieldsSettingsService);
    NumberDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const settings$ = this.settings$.pipe(
      map(settings => ({
        Min: settings.Min,
        Max: settings.Max,
      })),
      distinctUntilChanged(GeneralHelpers.objectsEqual),
    );

    this.viewModel = combineLatest([
      combineLatest([this.controlStatus$, this.label$, this.placeholder$, this.required$]),
      combineLatest([settings$]),
    ]).pipe(
      map(([
        [controlStatus, label, placeholder, required],
        [settings],
      ]) => {
        const viewModel: NumberDefaultViewModel = {
          controlStatus,
          label,
          placeholder,
          required,
          min: settings.Min,
          max: settings.Max,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }
}
