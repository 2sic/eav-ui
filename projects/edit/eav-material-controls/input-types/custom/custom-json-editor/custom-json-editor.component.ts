import { Component, Input, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'custom-json-editor',
  templateUrl: './custom-json-editor.component.html',
  styleUrls: ['./custom-json-editor.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class CustomJsonEditorComponent implements OnInit {
  @Input() config: FieldConfigSet;
  @Input() group: FormGroup;
  rowCount: number;

  constructor() { }

  ngOnInit() {
    this.rowCount = this.config.field.settings.Rows ? this.config.field.settings.Rows : 5;
  }
}
