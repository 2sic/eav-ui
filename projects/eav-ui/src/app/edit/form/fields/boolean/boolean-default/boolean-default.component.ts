import { Component, computed, inject, OnDestroy, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BaseFieldComponent } from '../../base/base-field.component';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';

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
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class BooleanDefaultComponent extends BaseFieldComponent<boolean> implements OnInit, OnDestroy {

  protected fieldState = inject(FieldState);

  protected groupTemp = this.fieldState.group;
  // protected controlStatusTemp = this.fieldState.controlStatus;

  protected settingsTemp = this.fieldState.settings;
  protected basicsTemp = this.fieldState.basics;

  changedLabel = computed(() => this.settingsTemp()._label)
  checkedState = computed(() => {
    const value = this.controlStatus().value;
    const reverseToggle = this.settingsTemp().ReverseToggle;
    return reverseToggle ? !value : value;
  })

  constructor() {
    super();
    BooleanDefaultLogic.importMe();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const newValue = !this.control.value;
      ControlHelpers.patchControlValue(this.control, newValue);
    }
  }
}
