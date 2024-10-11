import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '..';
import { DevRestBaseModel } from '../base-template-vars';

@Component({
  selector: 'app-dev-rest-tab-introduction',
  templateUrl: './tab-introduction.component.html',
  standalone: true,
})
export class DevRestTabIntroductionComponent implements OnInit {

  @Input() data: DevRestBaseModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
