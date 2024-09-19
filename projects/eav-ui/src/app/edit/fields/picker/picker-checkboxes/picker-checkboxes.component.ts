import { Component } from '@angular/core';
import { FlexModule } from '@angular/flex-layout/flex';
import { MatRippleModule } from '@angular/material/core';
import { NgClass } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckbox } from '@angular/material/checkbox';
import { TippyDirective } from 'projects/eav-ui/src/app/shared/directives/tippy.directive';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { FeatureNames } from 'projects/eav-ui/src/app/features/feature-names';
import { PickerInlineBaseComponent } from './picker-inline-base.component';

@Component({
  selector: 'app-picker-checkboxes',
  templateUrl: './picker-checkboxes.component.html',
  styleUrls: ['./picker-checkboxes.component.scss'],
  standalone: true,
  imports: [
    MatFormFieldModule,
    NgClass,
    MatRippleModule,
    FlexModule,
    MatCheckbox,
    TippyDirective,
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
