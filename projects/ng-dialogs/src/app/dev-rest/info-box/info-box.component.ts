import { Component, Input } from '@angular/core';
import { infoBoxIconMap, InfoBoxType } from './hint';

@Component({
  selector: 'app-info-box',
  templateUrl: './info-box.component.html',
  styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {
  @Input() type: InfoBoxType;
  @Input() title: string;
  constructor() { }

  getIcon() {
    return infoBoxIconMap[this.type];
  }
}
