import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestApiTemplateVars } from '../api-template-vars';

@Component({
  selector: 'app-dev-api-permissions',
  templateUrl: './permissions.component.html',
})
export class DevRestApiPermissionsComponent implements OnInit {

  @Input() data: DevRestApiTemplateVars;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
