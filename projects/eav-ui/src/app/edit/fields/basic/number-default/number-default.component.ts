import { Component, computed, inject } from '@angular/core';
import { NumberDefaultLogic } from './number-default-logic';
import { AsyncPipe } from '@angular/common';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { InputTypeConstants } from '../../../../content-type-fields/constants/input-type.constants';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';

@Component({
  selector: InputTypeConstants.NumberDefault,
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    MatInputModule,
    FieldHelperTextComponent,
    AsyncPipe,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class NumberDefaultComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected min = computed(() => this.settings().Min, SignalHelpers.numberEquals);
  protected max = computed(() => this.settings().Max, SignalHelpers.numberEquals);

  constructor() {
    NumberDefaultLogic.importMe();
  }

}