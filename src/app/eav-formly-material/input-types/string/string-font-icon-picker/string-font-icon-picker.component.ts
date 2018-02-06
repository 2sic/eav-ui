import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { FieldType } from '@ngx-formly/core';
import { MatInput } from '@angular/material/input';
import { FormlyErrorStateMatcher } from '../../formly.error-state-matcher';

@Component({
  selector: 'app-string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.css']
})
export class StringFontIconPickerComponent extends FieldType implements OnInit, AfterViewInit {
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
