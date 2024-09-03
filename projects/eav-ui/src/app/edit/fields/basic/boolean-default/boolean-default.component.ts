import { SignalEquals } from '../../../../shared/signals/signal-equals';
import { Component, computed, inject, Signal } from '@angular/core';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { FieldMetadata } from '../../field-metadata.decorator';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { ControlHelpers } from '../../../shared/helpers/control.helpers';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { ControlStatus } from '../../../shared/models/control-status.model';

@Component({
  selector: InputTypeCatalog.BooleanDefault,
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
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class BooleanDefaultComponent {

  #fieldState = inject(FieldState) as FieldState<boolean>;

  group = this.#fieldState.group;
  controlStatus = this.#fieldState.controlStatus;
  uiValue = this.#fieldState.uiValue;
  #control = this.#fieldState.control;

  #settings = this.#fieldState.settings;
  basics = this.#fieldState.basics;

  changedLabel = computed(() => this.#settings()._label, SignalEquals.string);
  checkedState = computed(() => {
    const value = this.uiValue();
    const reverseToggle = this.#settings().ReverseToggle;
    return reverseToggle ? !value : value;
  }, SignalEquals.bool);

  constructor() {
    BooleanDefaultLogic.importMe();
  }

  updateValue(disabled: boolean) {
    if (disabled) return;
    const newValue = !this.#control.value;
    ControlHelpers.patchControlValue(this.#control, newValue);
  }
}
