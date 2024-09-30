import { Component, Input } from '@angular/core';
import { PickerItem } from 'projects/edit-types';

@Component({
  selector: 'app-picker-preview-type',
  standalone: true,
  imports: [
  ],
  templateUrl: './picker-preview-type.component.html',
  styleUrl: './picker-preview-type.component.scss'
})
export class PickerPreviewTypeComponent {

  @Input() item: PickerItem;

  replaceDot(value: string): string {
    return value.replace(/\./g, '');
  }

}
