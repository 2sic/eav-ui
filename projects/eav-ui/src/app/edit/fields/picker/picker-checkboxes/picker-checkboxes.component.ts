import { JsonPipe, NgClass } from '@angular/common';
import { Component } from '@angular/core';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatRippleModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { FeatureNames } from '../../../../features/feature-names';
import { TippyDirective } from '../../../../shared/directives/tippy.directive';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { PickerInlineBaseComponent } from '../picker-inline/picker-inline-base.component';
import { PickerInlineHeaderComponent } from '../picker-inline/picker-inline-header.component';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons.component';
import { PickerPreviewTypeComponent } from '../picker-preview-type/picker-preview-type.component';

@Component({
  selector: 'app-picker-checkboxes',
  templateUrl: './picker-checkboxes.component.html',
  styleUrls: ['./picker-checkboxes.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatRippleModule,
    MatCheckbox,
    NgClass,
    TippyDirective,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    PickerItemButtonsComponent,
    PickerInlineHeaderComponent,
    JsonPipe,
    PickerPreviewTypeComponent
  ],
})
export class PickerCheckboxesComponent extends PickerInlineBaseComponent {

  constructor() {
    super();
    this.fieldState.requireFeature(FeatureNames.PickerUiCheckbox);
  }

}
