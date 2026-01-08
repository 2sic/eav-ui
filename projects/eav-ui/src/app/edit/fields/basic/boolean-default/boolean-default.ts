import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldHelperTextComponent } from '../../help-text/field-help-text';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { BooleanBaseComponent } from './boolean-base';
import { BooleanDefaultLogic } from './boolean-default-settings-helper';

@Component({
    selector: InputTypeCatalog.BooleanDefault,
    templateUrl: './boolean-default.html',
    styleUrls: ['./boolean-default.scss'],
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatSlideToggleModule,
        NgClass,
        FieldHelperTextComponent,
    ]
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
