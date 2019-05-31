import { Component, OnInit, ViewContainerRef, ViewChild, Input, OnDestroy } from '@angular/core';
import { FormGroup, AbstractControl } from '@angular/forms';
import { Subscription } from 'rxjs';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FieldConfigSet } from '../../../eav-dynamic-form/model/field-config';
import { ValidationMessagesService } from '../../validators/validation-messages-service';
import { ContentExpandAnimation } from '../../../shared/animations/content-expand-animation';
import { EavService } from '../../../shared/services/eav.service';

@Component({
  selector: 'app-expandable-wrapper',
  templateUrl: './expandable-wrapper.component.html',
  styleUrls: ['./expandable-wrapper.component.scss'],
  animations: [ContentExpandAnimation]
})
export class ExpandableWrapperComponent implements FieldWrapper, OnInit, OnDestroy {
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;

  control: AbstractControl;
  previousValue: string;
  cleanedValue: string;
  subscriptions: Subscription[] = [];
  dialogIsOpen = false;

  constructor(
    private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    this.control = this.group.controls[this.config.field.name];
    this.previousValue = this.control.value;
    this.cleanedValue = this.cleanValue(this.control.value);

    this.subscriptions.push(
      this.eavService.formSetValueChange$.subscribe(formSet => {
        const newValue = formSet[this.config.field.name] as string;
        if (this.previousValue === newValue) { return; }
        this.previousValue = newValue;

        this.cleanedValue = this.cleanValue(newValue);
      })
    );
  }

  private cleanValue(value: string) {
    return value
      .replace('<hr sxc="sxc-content-block', '<hr class="sxc-content-block') // content block
      .replace(/<a[^>]*>(.*?)<\/a>/g, '$1'); // remove href from A tag
  }

  setTouched() {
    this.control.markAsTouched();
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}
