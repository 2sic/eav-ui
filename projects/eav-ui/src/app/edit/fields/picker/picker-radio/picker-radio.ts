import { Component } from '@angular/core';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatRadioButton } from '@angular/material/radio';
import { FeatureNames } from '../../../../features/feature-names';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { PickerInlineBaseComponent } from '../picker-inline/picker-inline-base';
import { PickerInlineHeaderComponent } from '../picker-inline/picker-inline-header';
import { PickerPreviewLabelComponent } from '../picker-item-label/picker-item-label';

@Component({
    selector: 'app-picker-radio',
    templateUrl: './picker-radio.html',
    styleUrls: ['./picker-radio.scss'],
    imports: [
        MatFormFieldModule,
        MatRippleModule,
        MatRadioButton,
        TippyDirective,
        PickerInlineHeaderComponent,
        PickerPreviewLabelComponent,
    ]
})
export class PickerRadioComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiRadio);
  }

  /** Name is used to group the radio buttons together in the form */
  name = this.fieldState.name;

}
