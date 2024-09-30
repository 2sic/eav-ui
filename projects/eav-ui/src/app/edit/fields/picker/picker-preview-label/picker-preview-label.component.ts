import { Component, input } from '@angular/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons.component';
import { PickerPreviewTypeComponent } from '../picker-preview-type/picker-preview-type.component';

@Component({
  selector: 'app-picker-preview-label',
  standalone: true,
  imports: [
    PickerPreviewTypeComponent,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    PickerItemButtonsComponent,
  ],
  templateUrl: './picker-preview-label.component.html',
  styleUrl: './picker-preview-label.component.scss'
})
export class PickerPreviewLabelComponent {

  item = input.required<PickerItem>();
  settings = input.required<FieldSettings>();
  show = input<boolean>(false);
  index = input<number>(0);

}
