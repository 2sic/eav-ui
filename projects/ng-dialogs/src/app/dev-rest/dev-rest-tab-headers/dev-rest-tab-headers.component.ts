import { Component, Input, OnInit } from '@angular/core';
import { DevRestTemplateVars } from '..';

@Component({
  selector: 'app-dev-rest-tab-headers',
  templateUrl: './dev-rest-tab-headers.component.html',
  styleUrls: ['./dev-rest-tab-headers.component.scss']
})
export class DevRestHttpHeadersComponent implements OnInit {

  @Input() data: DevRestTemplateVars;

  constructor() { }

  ngOnInit(): void {
  }

}
