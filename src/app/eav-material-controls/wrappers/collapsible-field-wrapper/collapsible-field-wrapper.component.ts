import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-collapsible-field-wrapper',
  templateUrl: './collapsible-field-wrapper.component.html',
  styleUrls: ['./collapsible-field-wrapper.component.scss']
})
export class CollapsibleFieldWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  group: FormGroup;
  enableCollapseField = true;
  collapseField = true;

  constructor() { }

  ngOnInit() {
  }
}
