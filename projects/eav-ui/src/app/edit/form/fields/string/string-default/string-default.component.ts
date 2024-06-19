import { Component, computed, inject } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';
import { WrappersLocalizationOnly } from '../../../../shared/constants/wrappers.constants';
import { FieldMetadata } from '../../../builder/fields-builder/field-metadata.decorator';
import { StringDefaultLogic } from './string-default-logic';
import { FieldHelperTextComponent } from '../../../shared/field-helper-text/field-helper-text.component';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { SignalHelpers } from 'projects/eav-ui/src/app/shared/helpers/signal.helpers';
import { FieldState } from '../../../builder/fields-builder/field-state';

@Component({
  selector: InputTypeConstants.StringDefault,
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    FormsModule,
    ReactiveFormsModule,
    NgClass,
    ExtendedModule,
    MatInputModule,
    NgStyle,
    FieldHelperTextComponent,
  ],
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringDefaultComponent {

  protected fieldState = inject(FieldState);

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  protected rowCount = computed(() => this.settings().RowCount, SignalHelpers.numberEquals);
  protected inputFontFamily = computed(() => this.settings().InputFontFamily, SignalHelpers.stringEquals);

  constructor() {
    StringDefaultLogic.importMe();
  }

}
