import { Component, ViewChild, Input, ViewContainerRef, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-default',
  templateUrl: './string-default.component.html',
  styleUrls: ['./string-default.component.scss']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringDefaultComponent implements Field {
  @ViewChild('errorComponent', { read: ViewContainerRef }) errorComponent: ViewContainerRef;

  @Input() config: FieldConfigSet;
  group: FormGroup;

  get rowCount() {
    return this.config.field.settings.RowCount ? this.config.field.settings.RowCount : 1;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }
}
