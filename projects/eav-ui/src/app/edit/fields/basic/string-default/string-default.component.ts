import { NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringDefaultLogic } from './string-default-logic';

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

  protected rowCount = this.fieldState.setting('RowCount');
  protected inputFontFamily = this.fieldState.setting('InputFontFamily');
  protected textWrap = this.fieldState.setting('TextWrapping');

  constructor() {
    StringDefaultLogic.importMe();
  }

}
