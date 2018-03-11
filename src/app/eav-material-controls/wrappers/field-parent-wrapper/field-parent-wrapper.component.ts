import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-field-parent-wrapper',
  templateUrl: './field-parent-wrapper.component.html',
  styleUrls: ['./field-parent-wrapper.component.css']
})
export class FieldParentWrapperComponent implements FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;

}
