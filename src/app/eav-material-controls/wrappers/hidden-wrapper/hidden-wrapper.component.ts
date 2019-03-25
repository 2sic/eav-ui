import { Component, OnInit, ViewChild, ViewContainerRef, Input } from '@angular/core';
import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';

@Component({
  selector: 'app-hidden-wrapper',
  templateUrl: './hidden-wrapper.component.html',
  styleUrls: ['./hidden-wrapper.component.scss']
})
export class HiddenWrapperComponent implements FieldWrapper {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;

  get visibleInEditUI() {

    return (this.config.currentFieldConfig.settings.VisibleInEditUI === false) ? false : true;
  }

}
