import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss']
})
export class HiddenWrapperComponent implements FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;

  get visibleInEditUI() {

    return (this.config.settings.VisibleInEditUI === false) ? false : true;
  }

}
