import { Component, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown-query',
  templateUrl: './string-dropdown-query.component.html',
  styleUrls: ['./string-dropdown-query.component.scss']
})
export class StringDropdownQueryComponent {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

}
