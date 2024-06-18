import { Component, computed, OnDestroy, OnInit } from '@angular/core';
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
  // viewModel$: Observable<BooleanDefaultViewModel>;

  changedLabel = computed(() => this.settings()._label)

  checkedState = computed(() => {
    const value = this.controlStatus().value;
    const reverseToggle = this.settings().ReverseToggle;
    return reverseToggle ? !value : value;
  })

  constructor() {
    super();
    BooleanDefaultLogic.importMe();
  }

  ngOnInit() {
    super.ngOnInit();
  }

  updateValue(disabled: boolean) {
    if (!disabled) {
      const newValue = !this.control.value;
      ControlHelpers.patchControlValue(this.control, newValue);
    }
  }
}
