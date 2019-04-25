import { Component, OnInit, ViewContainerRef, ViewChild, Input, ElementRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';

@Component({
  selector: 'app-expandable-wrapper-v2',
  templateUrl: './expandable-wrapper-v2.component.html',
  styleUrls: ['./expandable-wrapper-v2.component.scss'],
  animations: [ContentExpandAnimation]
})
export class ExpandableWrapperV2Component implements FieldWrapper, OnInit {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;
  @ViewChild('previewContainer') previewContainer: ElementRef;

  @Input() config: FieldConfigSet;
  group: FormGroup;

  dialogIsOpen = false;

  get value() {
    return this.group.controls[this.config.field.name].value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block');
  }
  get id() { return `${this.config.entity.entityId}${this.config.field.index}`; }
  get inputInvalid() { return this.group.controls[this.config.field.name].invalid; }
  get touched() { return this.group.controls[this.config.field.name].touched || false; }
  get disabled() { return this.group.controls[this.config.field.name].disabled; }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    const previewElName = `field-${this.config.field.fullInputType}-preview`;
    const previewEl = document.createElement(previewElName) as any;
    this.previewContainer.nativeElement.appendChild(previewEl);
  }

  setTouched() {
    this.group.controls[this.config.field.name].markAsTouched();
  }

  expandDialog() {
    console.log('ExpandableWrapperV2Component expandDialog');
    this.dialogIsOpen = true;
    this.config.field.expanded = true;
  }
  closeDialog() {
    console.log('ExpandableWrapperV2Component closeDialog');
    this.dialogIsOpen = false;
    this.config.field.expanded = false;
  }
}
