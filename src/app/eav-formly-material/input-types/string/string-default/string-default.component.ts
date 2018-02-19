import { Component, OnInit, ViewChild } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material/input';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css']
})
export class StringDefaultComponent extends FieldType implements OnInit {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  get type() {
    return this.to.type || 'text';
  }

  get rowCount() {
    return this.to.rowCount || 1;
  }

}
