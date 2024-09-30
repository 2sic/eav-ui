import { NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioButton } from '@angular/material/radio';
import { FeatureNames } from '../../../../features/feature-names';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { PickerInlineBaseComponent } from '../picker-inline/picker-inline-base.component';
import { PickerInlineHeaderComponent } from '../picker-inline/picker-inline-header.component';
import { PickerPreviewLabelComponent } from '../picker-item-label/picker-item-label.component';

@Component({
  selector: 'app-picker-radio',
  templateUrl: './picker-radio.component.html',
  styleUrls: ['./picker-radio.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatRippleModule,
    MatRadioButton,
    NgClass,
    TippyDirective,
    // FieldHelperTextComponent,
    PickerInlineHeaderComponent,
    PickerPreviewLabelComponent,
  ],
})
export class PickerRadioComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiRadio);
  }

  name = this.fieldState.name;

}
