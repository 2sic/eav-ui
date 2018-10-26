import { Component, ViewChild, Input, ViewContainerRef } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
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

  @Input() config: FieldConfig;
  group: FormGroup;

  get rowCount() {
    return this.config.settings.RowCount ? this.config.settings.RowCount : 1;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }
}
