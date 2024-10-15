import { Component, Input, OnInit } from '@angular/core';
import { DevRestBaseModel } from '..';
import { InfoBoxComponent } from '../info-box/info-box.component';

@Component({
  selector: 'app-dev-rest-tab-headers',
  templateUrl: './tab-headers.component.html',
  standalone: true,
  imports: [InfoBoxComponent],
})
export class DevRestHttpHeadersComponent implements OnInit {

  @Input() data: DevRestBaseModel;

  constructor() { }

  ngOnInit(): void {
  }

}
