import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/material';
import { MatInput } from '@angular/material';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.css']
})
export class StringDropdownQueryComponent extends FieldType {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

}
