import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss']
})
export class HiddenWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { static: true, read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  get visibleInEditUI() { return (this.config.field.settings.VisibleInEditUI === false) ? false : true; }

  constructor() { }

  ngOnInit() {
  }
}
