import { Component, inject } from '@angular/core';
import { Boolean, FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { FieldState } from '../../field-state';

@Component({
  selector: 'app-boolean-base',
  template: '',
})
// @FieldMetadata({ ...WrappersLocalizationOnly })
export abstract class BooleanBaseComponent {

  fieldState = inject(FieldState) as FieldState<boolean, FieldSettings & Boolean>;

  group = this.fieldState.group;
  ui = this.fieldState.ui;
  uiValue = this.fieldState.uiValue;

  settings = this.fieldState.settings;
  basics = this.fieldState.basics;

  // TODO: CONTINUE HERE
  changedLabel = this.fieldState.settingExt('_label');
}
