import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestApiTemplateVars } from '../api-template-vars';

@Component({
  selector: 'app-dev-api-introduction',
  templateUrl: './introduction.component.html',
})
export class DevRestApiIntroductionComponent implements OnInit {

  @Input() data: DevRestApiTemplateVars;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
