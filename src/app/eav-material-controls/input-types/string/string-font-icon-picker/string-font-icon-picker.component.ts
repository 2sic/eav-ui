import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput } from '@angular/material';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-font-icon-picker',
  templateUrl: './string-font-icon-picker.component.html',
  styleUrls: ['./string-font-icon-picker.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringFontIconPickerComponent {
  @ViewChild(MatInput) matInput: MatInput;
  // errorStateMatcher = new FormlyErrorStateMatcher(this);

}
