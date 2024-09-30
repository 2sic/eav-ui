import { Component, input } from '@angular/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';

@Component({
  selector: 'app-picker-preview-type',
  templateUrl: './picker-preview-type.component.html',
  styleUrl: './picker-preview-type.component.scss',
  standalone: true,
})
export class PickerPreviewTypeComponent {

  item = input.required<PickerItem>();

  settings = input.required<FieldSettings>();

  replaceDot(value: string): string {
    return value?.replace(/\./g, '');
  }

}
