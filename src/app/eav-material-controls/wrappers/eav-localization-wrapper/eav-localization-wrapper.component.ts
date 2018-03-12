import { Component, Input, ViewChild, ViewContainerRef } from '@angular/core';
import { MatFormField } from '@angular/material/form-field';
import { MatFormFieldControl } from '@angular/material/form-field';

import { FieldWrapper } from '../../../eav-dynamic-form/model/field-wrapper';

@Component({
  selector: 'app-eav-localization-wrapper',
  templateUrl: './eav-localization-wrapper.component.html',
  styleUrls: ['./eav-localization-wrapper.component.css']
})
export class EavLocalizationComponent implements FieldWrapper {// , MatFormFieldControl<any>
  @ViewChild('fieldComponent', { read: ViewContainerRef }) fieldComponent: ViewContainerRef;

  @Input() config;
}
