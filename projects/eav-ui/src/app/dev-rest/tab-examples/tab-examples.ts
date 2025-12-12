import { Component, input } from '@angular/core';
import { DevRestBaseModel } from '..';
import { InfoBoxComponent } from '../info-box/info-box';

@Component({
    selector: 'app-dev-rest-tab-examples-intro',
    templateUrl: './tab-examples.html',
    styleUrls: ['./tab-examples.scss'],
    imports: [InfoBoxComponent]
})
export class DevRestTabExamplesComponent {
  data = input<DevRestBaseModel>();

  constructor() { }
}
