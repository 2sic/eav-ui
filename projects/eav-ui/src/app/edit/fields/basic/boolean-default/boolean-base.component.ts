import { Component, inject } from '@angular/core';
import { FieldState } from '../../field-state';

@Component({
  selector: 'app-boolean-base',
  template: '',
})
// @FieldMetadata({ ...WrappersLocalizationOnly })
export abstract class BooleanBaseComponent {

  fieldState = inject(FieldState) as FieldState<boolean>;

  group = this.fieldState.group;
  ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;

  settings = this.fieldState.settings;
  basics = this.fieldState.basics;

  changedLabel = this.fieldState.setting('_label');
}
