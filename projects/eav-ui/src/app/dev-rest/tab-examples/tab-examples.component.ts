import { Component, input } from '@angular/core';
import { DevRestBaseModel } from '..';
import { InfoBoxComponent } from '../info-box/info-box.component';

@Component({
    selector: 'app-dev-rest-tab-examples-intro',
    templateUrl: './tab-examples.component.html',
    styleUrls: ['./tab-examples.component.scss'],
    imports: [InfoBoxComponent]
})
export class DevRestTabExamplesComponent {
  data = input<DevRestBaseModel>();

  constructor() { }
}
