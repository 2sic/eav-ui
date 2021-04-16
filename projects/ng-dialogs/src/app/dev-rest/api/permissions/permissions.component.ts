import { Component, Input } from '@angular/core';
import { DevRestApiTemplateVars } from '../api-template-vars';

@Component({
  selector: 'app-dev-api-permissions',
  templateUrl: './permissions.component.html',
})
export class DevRestApiPermissionsComponent {

  @Input() data: DevRestApiTemplateVars;

  constructor() { }

}
