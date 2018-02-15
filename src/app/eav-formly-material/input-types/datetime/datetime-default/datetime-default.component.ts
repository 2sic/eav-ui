import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-datetime-default',
  templateUrl: './datetime-default.component.html',
  styleUrls: ['./datetime-default.component.css']
})
export class DatetimeDefaultComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

  ngOnInit() {
    // FIX: this code transfer to ngAfterViewInit - because *ngIf after ngOnInit
    // @ViewChild() depends on it. You can't access view members before they are rendered.
    // if (this.field['__formField__']) {
    //   this.field['__formField__']._control = this.matInput;
    // }
    super.ngOnInit();
  }

  // ngAfterViewInit() {
  //   if (this.field['__formField__']) {
  //     this.field['__formField__']._control = this.matInput;
  //   }
  // }
}
