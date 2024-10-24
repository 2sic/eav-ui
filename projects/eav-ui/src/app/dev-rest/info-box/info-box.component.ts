import { Component, input } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { infoBoxIconMap, InfoBoxType } from './hint';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss'],
  standalone: true,
  imports: [MatIconModule]
})
export class InfoBoxComponent {
  type = input<InfoBoxType>();
  title = input<string>();

  constructor() { }

  getIcon() {
    return infoBoxIconMap[this.type()];
  }
}
