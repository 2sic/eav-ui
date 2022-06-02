import { Component, Input, OnInit } from '@angular/core';
import { DevRestBaseTemplateVars } from '..';

@Component({
  selector: 'app-dev-rest-tab-headers',
  templateUrl: './tab-headers.component.html',
})
export class DevRestHttpHeadersComponent implements OnInit {

  @Input() data: DevRestBaseTemplateVars;

  constructor() { }

  ngOnInit(): void {
  }

}
