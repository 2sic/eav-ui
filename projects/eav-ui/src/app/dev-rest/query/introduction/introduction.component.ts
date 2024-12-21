import { Component, input, OnInit } from '@angular/core';
import { AllScenarios, DevRestBaseModel } from '../..';

@Component({
  selector: 'app-dev-query-introduction',
  templateUrl: './introduction.component.html',
})
export class DevRestQueryIntroductionComponent implements OnInit {
  data = input<DevRestBaseModel>();

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void { }
}
