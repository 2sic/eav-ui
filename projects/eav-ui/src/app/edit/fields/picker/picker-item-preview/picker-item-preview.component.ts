import { Component, input } from '@angular/core';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { FieldSettings } from '../../../../../../../edit-types/src/FieldSettings';
import { PickerItem } from '../models/picker-item.model';

@Component({
  selector: 'app-picker-item-preview',
  templateUrl: './picker-item-preview.component.html',
  styleUrl: './picker-item-preview.component.scss',
  standalone: true,
  imports: [
    NgxTippyModule,
  ]
})
export class PickerItemPreviewComponent {

  item = input.required<PickerItem>();
  settings = input.required<FieldSettings>();

  replaceDot(value: string): string {
    return value?.replace(/\./g, '');
  }

}
