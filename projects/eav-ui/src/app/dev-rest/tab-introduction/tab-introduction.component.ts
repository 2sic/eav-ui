import { Component, input, OnInit } from '@angular/core';
import { AllScenarios } from '..';
import { DevRestBaseModel } from '../base-template-vars';

@Component({
  selector: 'app-dev-rest-tab-introduction',
  templateUrl: './tab-introduction.component.html',
})
export class DevRestTabIntroductionComponent implements OnInit {
  data = input<DevRestBaseModel>();

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void { }
}
