import { Component, OnInit, ViewContainerRef, ViewChild, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfig } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation]
})
export class ExpandableWrapperComponent implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfig;
  group: FormGroup;

  dialogIsOpen = false;

  get value() {
    return this.group.controls[this.config.name].value.replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block');
  }
  get id() { return `${this.config.itemConfig.entityId}${this.config.index}`; }
  get inputInvalid() { return this.group.controls[this.config.name].invalid; }
  get touched() { return this.group.controls[this.config.name].touched || false; }
  get disabled() { return this.group.controls[this.config.name].disabled; }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() { }

  setTouched() {
    this.group.controls[this.config.name].markAsTouched();
  }
}
