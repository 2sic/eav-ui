import { Component, computed, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { NumberDefaultLogic } from './number-default-logic';
import { AsyncPipe } from '@angular/common';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FieldState } from '../../../builder/fields-builder/field-state';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';

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
