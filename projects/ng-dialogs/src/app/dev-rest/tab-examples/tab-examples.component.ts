import { Component, Input } from '@angular/core';
import { DevRestBaseTemplateVars } from '..';

@Component({
  selector: 'app-dev-rest-tab-examples-intro',
  templateUrl: './dev-rest-tab-examples.component.html',
  styleUrls: ['./dev-rest-tab-examples.component.scss']
})
export class DevRestTabExamplesComponent {
  @Input() data: DevRestBaseTemplateVars;
  constructor() { }
}
