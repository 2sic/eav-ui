import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatureNames } from '../../../../features/feature-names';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { PickerInlineBaseComponent } from '../picker-inline/picker-inline-base';
import { PickerInlineHeaderComponent } from '../picker-inline/picker-inline-header';
import { PickerPreviewLabelComponent } from '../picker-item-label/picker-item-label';

@Component({
    selector: 'app-picker-checkboxes',
    templateUrl: './picker-checkboxes.html',
    styleUrls: ['./picker-checkboxes.scss'],
    imports: [
        MatFormFieldModule,
        MatRippleModule,
        MatCheckbox,
        TippyDirective,
        PickerInlineHeaderComponent,
        PickerPreviewLabelComponent,
    ]
})
export class PickerCheckboxesComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiCheckbox);
  }

}
