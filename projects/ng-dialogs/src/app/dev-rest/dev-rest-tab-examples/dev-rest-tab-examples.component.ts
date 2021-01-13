import { Component, Input } from '@angular/core';
import { DevRestDataTemplateVars } from '..';

@Component({
  selector: 'app-dev-rest-tab-examples',
  templateUrl: './dev-rest-tab-examples.component.html',
  styleUrls: ['./dev-rest-tab-examples.component.scss']
})
export class DevRestTabExamplesComponent {
  @Input() data: DevRestDataTemplateVars;
  constructor() { }
}
