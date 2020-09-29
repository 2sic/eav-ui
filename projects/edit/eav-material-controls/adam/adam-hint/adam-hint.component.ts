import { ChangeDetectionStrategy, Component, OnInit } from '@angular/core';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'adam-hint',
  templateUrl: './adam-hint.component.html',
  styleUrls: ['./adam-hint.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AdamHintComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
