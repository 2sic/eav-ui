import { Component, OnInit, ViewContainerRef, ViewChild, Input } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
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
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  control: AbstractControl;
  previousValue: string;
  cleanedValue: string;
  dialogIsOpen = false;

  get getCleanedValue(): string {
    if (this.previousValue !== this.control.value) {
      this.previousValue = this.control.value;
      this.cleanedValue = this.cleanValue(this.control.value);
    }
    return this.cleanedValue;
  }

  constructor(
    private validationMessagesService: ValidationMessagesService,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.previousValue = this.control.value;
    this.cleanedValue = this.cleanValue(this.control.value);
  }

  private cleanValue(value: string) {
    return value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
      .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
  }

  setTouched() {
    this.control.markAsTouched();
  }
}
