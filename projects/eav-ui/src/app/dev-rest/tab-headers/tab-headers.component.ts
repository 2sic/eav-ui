import { Component, Input, OnInit } from '@angular/core';
import { DevRestBaseViewModel } from '..';

@Component({
  selector: 'app-dev-rest-tab-headers',
  templateUrl: './tab-headers.component.html',
})
export class DevRestHttpHeadersComponent implements OnInit {

  @Input() data: DevRestBaseViewModel;

  constructor() { }

  ngOnInit(): void {
  }

}
