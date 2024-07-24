import { Component, Input, OnInit } from '@angular/core';
import { AllScenarios } from '../..';
import { DevRestDataViewModel } from '../data-template-vars';

@Component({
  selector: 'app-dev-data-introduction',
  templateUrl: './introduction.component.html',
  standalone: true,
})
export class DevRestDataIntroductionComponent implements OnInit {

  @Input() data: DevRestDataViewModel;

  /** List of scenarios */
  scenarios = AllScenarios;

  constructor() { }

  ngOnInit(): void {
  }

}
