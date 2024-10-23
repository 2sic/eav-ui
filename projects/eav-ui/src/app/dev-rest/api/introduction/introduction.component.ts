import { Component, input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestApiModel } from '../api-template-vars';

@Component({
  selector: 'app-dev-api-introduction',
  templateUrl: './introduction.component.html',
  standalone: true,
})
export class DevRestApiIntroductionComponent implements OnInit {

  data = input<DevRestApiModel>();

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void { }
}
