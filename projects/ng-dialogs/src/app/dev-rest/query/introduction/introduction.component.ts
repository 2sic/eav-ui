import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios, DevRestQueryTemplateVars } from '../..';

@Component({
  selector: 'app-dev-query-introduction',
  templateUrl: './introduction.component.html',
})
export class DevRestQueryIntroductionComponent implements OnInit {

  @Input() data: DevRestQueryTemplateVars;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
