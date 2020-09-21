import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'empty-default',
  templateUrl: './empty-default.component.html',
  styleUrls: ['./empty-default.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EmptyDefaultComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
