import { Component, computed, inject, OnDestroy, OnInit, Signal } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { BooleanDefaultLogic } from './boolean-default-logic';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass } from '@angular/common';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ControlHelpers } from '../../../../shared/helpers/control.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { ControlStatus } from '../../../../shared/models';

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
export class BooleanDefaultComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected controlStatus = this.fieldState.controlStatus as Signal<ControlStatus<boolean>> ;
  protected control = this.fieldState.control;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  changedLabel = computed(() => this.settings()._label)
  checkedState = computed(() => {
    const value = this.controlStatus().value;
    const reverseToggle = this.settings().ReverseToggle;
    return reverseToggle ? !value : value;
  })

  constructor() {
    BooleanDefaultLogic.importMe();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const newValue = !this.control.value;
      ControlHelpers.patchControlValue(this.control, newValue);
    }
  }
}
