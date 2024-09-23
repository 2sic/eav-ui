import { Component } from '@angular/core';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { FieldMetadata } from '../../field-metadata.decorator';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { BooleanBaseComponent } from './boolean-base.component';
import { computedObj } from '../../../../shared/signals/signal.utilities';

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
export class BooleanDefaultComponent extends BooleanBaseComponent {

  constructor() {
    super();
    BooleanDefaultLogic.importMe();
  }

  checkedState = computedObj('checkedState', () => {
    const value = this.uiValue();
    const reverseToggle = this.settings().ReverseToggle;
    return reverseToggle ? !value : value;
  });

  updateValue() {
    if (this.ui().disabled) return;
    this.fieldState.ui().setIfChanged(!this.uiValue());
  }
}
