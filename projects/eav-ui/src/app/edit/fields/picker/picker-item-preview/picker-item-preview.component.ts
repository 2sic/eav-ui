import { Component, input } from '@angular/core';
import { MatIcon } from '@angular/material/icon';
import { NgxTippyModule } from 'ngx-tippy-wrapper';
import { FieldSettingsWithPickerSource } from '../../../../../../../edit-types/src/PickerSources';
import { PickerItem } from '../models/picker-item.model';

@Component({
  selector: 'app-picker-item-preview',
  templateUrl: './picker-item-preview.component.html',
  styleUrl: './picker-item-preview.component.scss',
  standalone: true,
  imports: [
    MatIcon,
    NgxTippyModule,
  ]
})
export class PickerItemPreviewComponent {

  item = input.required<PickerItem>();

  settings = input.required<FieldSettingsWithPickerSource>();

  replaceDot(value: string): string {
    return value?.replace(/\./g, '') ;
  }

  imageResize(originalImage: string, width: number, height: number): string {

    // Replace width/height-Parameter
    let optimizedImage = originalImage.replace(/width=\d+/g, `width=${width}`).replace(/height=\d+/g, `height=${height}`);

    // add width/height-Parameter if not present
    if (!optimizedImage.includes('width='))
      optimizedImage += (optimizedImage.includes('?') ? '&' : '?') + `width=${width}`;

    if (!optimizedImage.includes('height='))
      optimizedImage += (optimizedImage.includes('?') ? '&' : '?') + `height=${height}`;

    return optimizedImage;
  }

}
