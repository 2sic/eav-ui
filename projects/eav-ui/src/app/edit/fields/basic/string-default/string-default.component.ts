import { Component, computed, inject } from '@angular/core';
import { StringDefaultLogic } from './string-default-logic';
import { MatInputModule } from '@angular/material/input';
import { ExtendedModule } from '@angular/flex-layout/extended';
import { NgClass, NgStyle } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { FieldState } from '../../field-state';
import { FieldMetadata } from '../../field-metadata.decorator';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { SignalHelpers } from '../../../../shared/helpers/signal.helpers';

@Component({
  selector: InputTypeCatalog.StringDefault,
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
