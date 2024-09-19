import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { PickerInlineBaseComponent } from '../picker-checkboxes/picker-inline-base.component';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { FeatureNames } from '../../../../features/feature-names';

@Component({
  selector: 'app-picker-radio',
  templateUrl: './picker-radio.component.html',
  styleUrls: ['./picker-radio.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    MatRippleModule,
    FlexModule,
    MatRadioGroup,
    MatRadioButton,
    TippyDirective,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
  ],
})
export class PickerRadioComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiRadio);
  }

  name = this.fieldState.name;

}
