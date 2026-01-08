import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { BooleanBaseComponent } from '../boolean-default/boolean-base';
import { BooleanTristateLogic } from './boolean-tristate-settings-helper';

@Component({
    selector: InputTypeCatalog.BooleanTristate,
    templateUrl: './boolean-tristate.html',
    styleUrls: ['./boolean-tristate.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        NgClass,
        FieldHelperTextComponent,
    ]
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
