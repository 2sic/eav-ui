import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatInput } from '@angular/material/input';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.css']
})
export class StringDefaultComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) matInput: MatInput;
  errorStateMatcher = new FormlyErrorStateMatcher(this);

  get type() {
    return this.to.type || 'text';
  }

  get rowCount() {
    return this.to.rowCount || 1;
  }

  ngOnInit() {
    // FIX: this code transfer to ngAfterViewInit - because *ngIf after ngOnInit
    // @ViewChild() depends on it. You can't access view members before they are rendered.
    // if (this.field['__formField__']) {
    //   this.field['__formField__']._control = this.matInput;
    // }
    super.ngOnInit();
  }

  ngAfterViewInit() {
    if (this.field['__formField__']) {
      this.field['__formField__']._control = this.matInput;
    }
  }
}
