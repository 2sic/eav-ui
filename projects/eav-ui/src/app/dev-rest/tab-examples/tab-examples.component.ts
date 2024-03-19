import { Component, Input } from '@angular/core';
import { DevRestBaseViewModel } from '..';
import { InfoBoxComponent } from '../info-box/info-box.component';

@Component({
    selector: 'app-dev-rest-tab-examples-intro',
    templateUrl: './tab-examples.component.html',
    styleUrls: ['./tab-examples.component.scss'],
    standalone: true,
    imports: [InfoBoxComponent]
})
export class DevRestTabExamplesComponent {
  @Input() data: DevRestBaseViewModel;
  constructor() { }
}
