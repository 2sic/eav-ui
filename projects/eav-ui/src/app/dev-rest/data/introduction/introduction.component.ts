import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestDataModel } from '../data-template-vars';

@Component({
  selector: 'app-dev-data-introduction',
  templateUrl: './introduction.component.html',
  standalone: true,
})
export class DevRestDataIntroductionComponent implements OnInit {

  @Input() data: DevRestDataModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
