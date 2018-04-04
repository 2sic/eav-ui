import { Component, Input, ViewChild, ViewContainerRef, OnInit } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';
import { FormGroup } from '@angular/forms';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper, OnInit {// , MatFormFieldControl<any>
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;
  group: FormGroup;

  disabled = true;
  ngOnInit() {
    console.log('config EavLocalizationComponent ngOnInit', this.config);
    // this.config.disabled = true;

    this.group.controls['engString'].disable();
  }

  enable() {
    if (this.disabled) {
      this.group.controls[this.config.name].enable();
      this.disabled = false;
    } else {
      this.group.controls[this.config.name].disable();
      this.disabled = true;
    }
  }
}
