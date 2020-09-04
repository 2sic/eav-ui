import { Component, OnInit, ChangeDetectionStrategy } from '@angular/core';

@Component({
  selector: 'app-pagepicker',
  templateUrl: './pagepicker.component.html',
  styleUrls: ['./pagepicker.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class PagepickerComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }

}
