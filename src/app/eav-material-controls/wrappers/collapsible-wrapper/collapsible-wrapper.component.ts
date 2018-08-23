import { Component, ViewChild, ViewContainerRef, Input } from '@angular/core';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-collapsible-wrapper',
  templateUrl: './collapsible-wrapper.component.html',
  styleUrls: ['./collapsible-wrapper.component.css']
})
export class CollapsibleWrapperComponent implements FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;

  get notes() {
    return this.config.settings ? (this.config.settings.Notes || '') : '';
  }
}
