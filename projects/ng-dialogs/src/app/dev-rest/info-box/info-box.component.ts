import { Component, Input } from '@angular/core';
import { infoBoxIconMap, infoBoxType } from './hint';

@Component({
    selector: 'app-info-box',
    templateUrl: './info-box.component.html',
    styleUrls: ['./info-box.component.scss']
})
export class InfoBoxComponent {
  @Input() type: infoBoxType;
  @Input() title: string;
  constructor () {}

  getIcon() {
    return infoBoxIconMap[this.type];
  }
}
