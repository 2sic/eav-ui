import { Component, OnInit, ViewChild } from '@angular/core';
import { MatInput, MatSelect } from '@angular/material';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfig } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.css']
})
@InputType({
  wrapper: ['app-eav-localization-wrapper'],
})
export class StringDropdownComponent implements Field, OnInit {
  config: FieldConfig;
  group: FormGroup;

  freeTextMode = false;
  selectOptions = [];

  private _selectOptions: string[] = [];
  private _oldOptions: string[] = [];

  get inputInvalid() {
    return this.group.controls[this.config.name].invalid;
  }

  constructor(private validationMessagesService: ValidationMessagesService) { }

  ngOnInit() {
    this.selectOptions = this.setOptionsFromDropdownValues();
    console.log('this.config.settings.DropdownValues:', this.config.settings.DropdownValues);
  }

  /**
  * Read settings Dropdown values
  */
  private setOptionsFromDropdownValues(): any {
    let options = [];
    if (this.config.settings.DropdownValues) {
      const dropdownValues = this.config.settings.DropdownValues;
      options = dropdownValues.replace(/\r/g, '').split('\n');
      options = options.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        return {
          label: key,
          value: (val) ? val : key
        };
      });
    }
    return options;
  }

  getErrorMessage() {
    return this.validationMessagesService.getErrorMessage(this.group.controls[this.config.name], this.config);
  }
}
