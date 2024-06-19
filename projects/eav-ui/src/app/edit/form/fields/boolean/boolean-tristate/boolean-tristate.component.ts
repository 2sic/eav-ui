import { Component, computed, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanTristateLogic } from './boolean-tristate-logic';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
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
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class BooleanTristateComponent extends BaseFieldComponent<boolean | ''> implements OnInit, OnDestroy {
  changedLabel = computed(() => this.settings()._label)
  checkedState = computed(() => {
    const value = this.controlStatus().value;
    const reverseToggle = this.settings().ReverseToggle;
    return reverseToggle
      ? (value === true ? false : value === false ? true : value)
      : (value === '' ? null : value);
  });

  constructor() {
    super();
    BooleanTristateLogic.importMe();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const currentValue: boolean | '' = this.control.value;
      const reverseToggle = this.settings().ReverseToggle;

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
