import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanTristateLogic } from './boolean-tristate-logic';
import { BooleanTristateViewModel } from './boolean-tristate.models';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';

@Component({
  selector: InputTypeConstants.BooleanTristate,
  templateUrl: './boolean-tristate.component.html',
  styleUrls: ['./boolean-tristate.component.scss'],
  standalone: true,
  imports: [
    FormsModule,
    ReactiveFormsModule,
    MatSlideToggleModule,
    NgClass,
    ExtendedModule,
    FieldHelperTextComponent,
    AsyncPipe,
    JsonPipe,

  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class BooleanTristateComponent extends BaseFieldComponent<boolean | ''> implements OnInit, OnDestroy {
  viewModel$: Observable<BooleanTristateViewModel>;

  constructor() {
    super();
    BooleanTristateLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();

    const changeable$: Observable<boolean> = combineLatest([
      this.settings$.pipe(map(settings => settings.TitleTrue), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleIndeterminate), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleFalse), distinctUntilChanged())
    ]).pipe(
      map(([TitleTrue, TitleIndeterminate, TitleFalse]) => !!(TitleTrue && TitleIndeterminate && TitleFalse)),
      distinctUntilChanged(),
    );

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => (controlStatus.value === '') ? null : controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged()),
    ]).pipe(
      map(([value, reverseToogle]) => value == null ? value : reverseToogle ? !value : value),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      combineLatest([changeable$]),
      combineLatest([checked$]),
    ]).pipe(
      map(([
        [changeable],
        [checked],
      ]) => {
        const viewModel: BooleanTristateViewModel = {
          changeable,
          checked,
        };
        return viewModel;
      }),
    );
  }

  ngOnDestroy() {
    super.ngOnDestroy();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const currentValue: boolean | '' = this.control.value;
      const reverseToggle = this.settings$.value.ReverseToggle;

      let nextValue: boolean;
      switch (currentValue) {
        case false:
          nextValue = reverseToggle ? true : null;
          break;
        case '':
        case null:
          nextValue = reverseToggle ? false : true;
          break;
        case true:
          nextValue = reverseToggle ? null : false;
          break;
      }
      ControlHelpers.patchControlValue(this.control, nextValue);
    }
  }
}
