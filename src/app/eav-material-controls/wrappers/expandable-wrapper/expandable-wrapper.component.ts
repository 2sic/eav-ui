import { Component, OnInit, ViewContainerRef, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss']
})
export class ExpandableWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  dialogIsOpen = false;

  constructor() { }

  ngOnInit() {
  }
}
