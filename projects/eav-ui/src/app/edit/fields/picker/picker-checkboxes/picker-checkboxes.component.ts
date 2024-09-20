import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { PickerInlineBaseComponent } from './picker-inline-base.component';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { FeatureNames } from '../../../../features/feature-names';
import { FieldHelperTextComponent } from '../../help-text/field-help-text.component';

@Component({
  selector: 'app-picker-checkboxes',
  templateUrl: './picker-checkboxes.component.html',
  styleUrls: ['./picker-checkboxes.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatRippleModule,
    FlexModule,
    MatCheckbox,
    NgClass,
    TippyDirective,
    FieldHelperTextComponent,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
  ],
})
export class PickerCheckboxesComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiCheckbox);
  }
}
