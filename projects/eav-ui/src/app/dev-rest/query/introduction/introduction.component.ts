import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios, DevRestBaseModel } from '../..';

@Component({
  selector: 'app-dev-query-introduction',
  templateUrl: './introduction.component.html',
  standalone: true,
})
export class DevRestQueryIntroductionComponent implements OnInit {

  @Input() data: DevRestBaseModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
