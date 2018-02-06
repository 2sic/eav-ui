import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatInput } from '@angular/material/input';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.css']
})
export class StringDropdownQueryComponent extends FieldType implements OnInit, AfterViewInit {
  @ViewChild(MatInput) matInput: MatInput;
  errorStateMatcher = new FormlyErrorStateMatcher(this);

  ngOnInit() {
    super.ngOnInit();
  }

  ngAfterViewInit() {
    if (this.field['__formField__']) {
      this.field['__formField__']._control = this.matInput;
    }
  }
}
