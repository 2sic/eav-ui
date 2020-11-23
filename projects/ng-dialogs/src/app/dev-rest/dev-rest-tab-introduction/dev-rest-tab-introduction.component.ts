import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios, DevRestDataTemplateVars } from '..';

@Component({
  selector: 'app-dev-rest-tab-introduction',
  templateUrl: './dev-rest-tab-introduction.component.html',
  styleUrls: ['./dev-rest-tab-introduction.component.scss']
})
export class DevRestTabIntroductionComponent implements OnInit {

  @Input() data: DevRestDataTemplateVars;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
