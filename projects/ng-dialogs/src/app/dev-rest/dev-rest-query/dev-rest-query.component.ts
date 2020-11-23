import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-dev-rest-query',
  templateUrl: './dev-rest-query.component.html',
  styleUrls: ['../dev-rest-all.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DevRestQueryComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
