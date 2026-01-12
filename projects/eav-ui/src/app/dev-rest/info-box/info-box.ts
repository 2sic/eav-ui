import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { infoBoxIconMap, InfoBoxType } from './hint';

@Component({
    selector: 'app-info-box',
    templateUrl: './info-box.html',
    styleUrls: ['./info-box.scss'],
    imports: [MatIconModule]
})
export class InfoBoxComponent {
  type = input<InfoBoxType>();
  // 2pp - not in use: title = input<string>();

  constructor() { }

  getIcon() {
    return infoBoxIconMap[this.type()];
  }
}
