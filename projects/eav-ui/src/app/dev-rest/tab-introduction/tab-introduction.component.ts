import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios, DevRestDataViewModel } from '..';
import { DevRestBaseViewModel } from '../base-template-vars';

@Component({
  selector: 'app-dev-rest-tab-introduction',
  templateUrl: './tab-introduction.component.html',
})
export class DevRestTabIntroductionComponent implements OnInit {

  @Input() data: DevRestBaseViewModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
