import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestApiViewModel } from '../api-template-vars';

@Component({
    selector: 'app-dev-api-introduction',
    templateUrl: './introduction.component.html',
    standalone: true,
})
export class DevRestApiIntroductionComponent implements OnInit {

  @Input() data: DevRestApiViewModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
