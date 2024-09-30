import { Component, input } from '@angular/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';
import { PickerIconHelpComponent } from '../picker-icon-help/picker-icon-help.component';
import { PickerIconInfoComponent } from '../picker-icon-info/picker-icon-info.component';
import { PickerItemButtonsComponent } from '../picker-item-buttons/picker-item-buttons.component';
import { PickerItemPreviewComponent } from '../picker-item-preview/picker-item-preview.component';

@Component({
  selector: 'app-picker-item-label',
  standalone: true,
  imports: [
    PickerItemPreviewComponent,
    PickerIconHelpComponent,
    PickerIconInfoComponent,
    PickerItemButtonsComponent,
  ],
  templateUrl: './picker-item-label.component.html',
  styleUrl: './picker-item-label.component.scss'
})
export class PickerPreviewLabelComponent {

  item = input.required<PickerItem>();

  settings = input.required<FieldSettings>();

  show = input<boolean>(false);

  index = input<number>(0);

}
