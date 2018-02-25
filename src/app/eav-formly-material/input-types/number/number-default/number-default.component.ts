import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
// import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-number-default',
  templateUrl: './number-default.component.html',
  styleUrls: ['./number-default.component.css']
})
export class NumberDefaultComponent extends FieldType implements OnInit {
  @ViewChild(MatInput) matInput: MatInput;
}
