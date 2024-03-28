import { Component, Input } from '@angular/core';
import { infoBoxIconMap, InfoBoxType } from './hint';
import { MatIconModule } from '@angular/material/icon';

@Component({
    selector: 'app-info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss'],
    standalone: true,
    imports: [MatIconModule]
})
export class InfoBoxComponent {
  @Input() type: InfoBoxType;
  @Input() title: string;
  constructor() { }

  getIcon() {
    return infoBoxIconMap[this.type];
  }
}
