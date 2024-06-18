import { Component, OnDestroy, OnInit } from '@angular/core';
import { combineLatest, distinctUntilChanged, map, Observable } from 'rxjs';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { BooleanDefaultViewModel } from './boolean-default.models';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, AsyncPipe, JsonPipe } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';

@Component({
    selector: InputTypeConstants.BooleanDefault,
    templateUrl: './boolean-default.component.html',
    styleUrls: ['./boolean-default.component.scss'],
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
export class BooleanDefaultComponent extends BaseFieldComponent<boolean> implements OnInit, OnDestroy {
  viewModel$: Observable<BooleanDefaultViewModel>;

  constructor() {
    super();
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
    const changeable$: Observable<boolean> = combineLatest([
      this.settings$.pipe(map(settings => settings.TitleTrue), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.TitleFalse), distinctUntilChanged())
    ]).pipe(
      map(([TitleTrue, TitleFalse]) => !!(TitleTrue && TitleFalse)),
      distinctUntilChanged(),
    );

    const checked$ = combineLatest([
      this.controlStatus$.pipe(map(controlStatus => controlStatus.value), distinctUntilChanged()),
      this.settings$.pipe(map(settings => settings.ReverseToggle), distinctUntilChanged())
    ]).pipe(
      map(([value, reverseToogle]) => reverseToogle ? !value: value),
      distinctUntilChanged(),
    );

    this.viewModel$ = combineLatest([
      combineLatest([changeable$]),
      combineLatest([checked$])
    ]).pipe(
      map(([
        [changeable],
        [checked],
      ]) => {
        const viewModel: BooleanDefaultViewModel = {
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
      const newValue = !this.control.value;
      ControlHelpers.patchControlValue(this.control, newValue);
    }
  }
}
