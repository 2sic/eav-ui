import { Component, input, OnInit } from '@angular/core';
import { DevRestBaseModel } from '..';
import { InfoBoxComponent } from '../info-box/info-box';

@Component({
    selector: 'app-dev-rest-tab-headers',
    templateUrl: './tab-headers.html',
    imports: [InfoBoxComponent]
})
export class DevRestHttpHeadersComponent implements OnInit {
  data = input<DevRestBaseModel>();

  constructor() { }

  ngOnInit(): void { }
}
