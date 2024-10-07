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
    return value?.replace(/\./g, '');
  }

  imageResize(originalImage: string, width: number, height: number): string {

    // Remove w and h parameters completely
    let optimizedImage = originalImage
      .replace(/[\?&]w=\d+/g, '')  // Remove w parameter
      .replace(/[\?&]h=\d+/g, ''); // Remove h parameter

    // Replace width and height if they exist
    optimizedImage = optimizedImage
      .replace(/width=\d+/g, `width=${width}`)
      .replace(/height=\d+/g, `height=${height}`);

    // If width is not present, add it
    if (!optimizedImage.includes('width=')) {
      optimizedImage += (optimizedImage.includes('?') ? '&' : '?') + `width=${width}`;
    }

    // If height is not present, add it
    if (!optimizedImage.includes('height=')) {
      optimizedImage += (optimizedImage.includes('?') ? '&' : '?') + `height=${height}`;
    }

    return optimizedImage;
  }


}
