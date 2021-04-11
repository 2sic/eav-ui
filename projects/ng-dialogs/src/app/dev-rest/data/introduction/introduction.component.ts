import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios, DevRestQueryTemplateVars } from '../..';
import { DevRestDataTemplateVars } from '../data-template-vars';

@Component({
  selector: 'app-dev-data-introduction',
  templateUrl: './introduction.component.html',
})
export class DevRestDataIntroductionComponent implements OnInit {

  @Input() data: DevRestDataTemplateVars;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
