import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
// import { FieldWrapper } from '../../../model/field-wrapper';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';
import { Subject } from 'rxjs/Subject';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-field-wrapper',
  templateUrl: './field-wrapper.component.html',
  styleUrls: ['./field-wrapper.component.css']
})
export class FieldWrapperComponent implements FieldWrapper {// , MatFormFieldControl<any>
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;
}
