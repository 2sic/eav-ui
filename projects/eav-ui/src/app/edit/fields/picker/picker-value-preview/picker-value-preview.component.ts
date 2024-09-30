import { Component, input } from '@angular/core';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';

@Component({
  selector: 'app-picker-value-preview',
  templateUrl: './picker-value-preview.component.html',
  styleUrl: './picker-value-preview.component.scss',
  standalone: true,
})
export class PickerValuePreviewComponent {

  item = input.required<PickerItem>();

  settings = input.required<FieldSettings>();

  replaceDot(value: string): string {
    return value?.replace(/\./g, '');
  }

}
