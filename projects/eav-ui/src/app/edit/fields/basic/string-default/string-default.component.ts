import { NgClass, NgStyle } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { FieldSettingsStringDefault } from 'projects/edit-types/src/FieldSettings-String';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { InputTypeCatalog } from '../../../../shared/fields/input-type-catalog';
import { computedObj } from '../../../../shared/signals/signal.utilities';
import { FieldMetadata } from '../../field-metadata.decorator';
import { FieldState } from '../../field-state';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';
import { WrappersLocalizationOnly } from '../../wrappers/wrappers.constants';
import { StringDefaultLogic } from './string-default-logic';

@Component({
    selector: InputTypeCatalog.StringDefault,
    templateUrl: './string-default.component.html',
    styleUrls: ['./string-default.component.scss'],
    imports: [
        MatFormFieldModule,
        FormsModule,
        ReactiveFormsModule,
        NgClass,
        MatInputModule,
        NgStyle,
        FieldHelperTextComponent,
    ]
})
@FieldMetadata({ ...WrappersLocalizationOnly })
export class StringDefaultComponent {

  protected fieldState = inject(FieldState) as FieldState<string, FieldSettings & FieldSettingsStringDefault>;

  protected group = this.fieldState.group;
  protected config = this.fieldState.config;

  protected settings = this.fieldState.settings;
  protected basics = this.fieldState.basics;

  /**
   * Row Count as it is in the settings
   * It has an undocumented feature - ATM only used in icon-picker,
   * where the row count can be negative to create a multi-line picker.
   * This is not an official feature, as we may add a toggle to this some day instead, and then fix the icon-picker.
   */
  protected rowCountRaw = this.fieldState.settingExt('RowCount');

  /**
   * Row Count corrected and also neutralize negative numbers, as it's an undocumented feature to create multi-line with 1 line
   */
  protected rowCount = computedObj('rowCount', () => Math.abs(this.rowCountRaw() || 1));
  
  protected isMultiline = computedObj('isMultiline', () => {
    const rc = this.rowCountRaw() || 1;
    return rc < 0 || rc > 1;
  });
  
  protected inputFontFamily = this.fieldState.settingExt('InputFontFamily');
  protected textWrap = this.fieldState.settingExt('TextWrapping');

  constructor() {
    StringDefaultLogic.importMe();
  }

}
