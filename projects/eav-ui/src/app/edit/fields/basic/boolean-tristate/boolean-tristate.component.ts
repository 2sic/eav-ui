import { Component } from '@angular/core';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { FieldMetadata } from '../../field-metadata.decorator';
import { BooleanTristateLogic } from './boolean-tristate-logic';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldState } from '../../field-state';
import { BooleanBaseComponent } from '../boolean-default/boolean-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';

@Component({
  selector: InputTypeCatalog.BooleanTristate,
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
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class BooleanTristateComponent extends BooleanBaseComponent {

  fs = this.fieldState as FieldState<boolean | ''>;

  constructor() {
    super();
    BooleanTristateLogic.importMe();
  }

  checkedState = computedObj('checkedState', () => {
    const value = this.fs.uiValue();
    const reverseToggle = this.settings().ReverseToggle;
    return reverseToggle
      ? (value === true ? false : value === false ? true : value)
      : (value === '' ? null : value);
  });

  bestLabel = computedObj('bestLabel', () => {
    const value = this.checkedState();
    const settings = this.settings();
    if (value === true && settings.TitleTrue)           return settings.TitleTrue;
    if (value === false && settings.TitleFalse)         return settings.TitleFalse;
    if (value === null && settings.TitleIndeterminate)  return settings.TitleIndeterminate;
    return settings.Name;
  });

  updateValue(disabled: boolean) {
    if (disabled) return;
    this.fieldState.ui().setIfChanged(this.#nextValue());
  }

  #nextValue() {
    const current = this.fs.uiValue();
    const reversed = this.settings().ReverseToggle;

    switch (current) {
      case false: return reversed ? true : null;
      case true: return reversed ? null : false;
      case '':
      case null: return reversed ? false : true;
    }
  }
}
