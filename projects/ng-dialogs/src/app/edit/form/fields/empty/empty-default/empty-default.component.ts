import { Component, OnInit } from '@angular/core';
import { InputTypeConstants } from '../../../../../content-type-fields/constants/input-type.constants';

@Component({
  selector: InputTypeConstants.EmptyDefault,
  templateUrl: './empty-default.component.html',
  styleUrls: ['./empty-default.component.scss'],
})
export class EmptyDefaultComponent implements OnInit {

  constructor() { }

  ngOnInit() {
  }
}
