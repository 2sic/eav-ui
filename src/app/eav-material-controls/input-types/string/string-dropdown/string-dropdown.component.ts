import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
import { ValidationMessagesService } from '../../../validators/validation-messages-service';
import { WrappersConstants } from '../../../../shared/constants/wrappers-constants';
import { EavService } from '../../../../shared/services/eav.service';

@Component({
  // tslint:disable-next-line:component-selector
  selector: 'string-dropdown',
  templateUrl: './string-dropdown.component.html',
  styleUrls: ['./string-dropdown.component.scss']
})
@InputType({
  wrapper: [WrappersConstants.eavLocalizationWrapper],
})
export class StringDropdownComponent implements Field, OnInit {
  config: FieldConfigSet;
  group: FormGroup;

  freeTextMode = false;
  selectOptions = [];

  get enableTextEntry() {
    return this.config.field.settings.EnableTextEntry || false;
  }

  get notes() {
    return this.config.field.settings.Notes || '';
  }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get value() {
    return this.group.controls[this.config.field.name].value;
  }

  constructor(
    private validationMessagesService: ValidationMessagesService,
    private eavService: EavService,
  ) { }

  ngOnInit() {
    this.selectOptions = this.setOptionsFromDropdownValues();
    this.freeTextMode = this.setFreeTextMode();

    this.eavService.formSetValueChange$.subscribe(
      formSet => {
        this.selectOptions = this.setOptionsFromDropdownValues();
      }
    );
  }

  freeTextModeChange(event) {
    this.freeTextMode = !this.freeTextMode;
    // Stops dropdown from opening
    event.stopPropagation();
  }

  private setFreeTextMode() {
    if (this.value) {
      const isInSelectOptions: boolean = this.selectOptions.find(s => s.value === this.value);
      if (!isInSelectOptions && this.enableTextEntry) {
        return true;
      }
    }
    return false;
  }

  /**
  * Read settings Dropdown values
  */
  private setOptionsFromDropdownValues(): any {
    const currentValue = this.group.controls[this.config.field.name].value;
    let currentValueFound = false;
    let options = [];
    if (this.config.field.settings.DropdownValues) {
      const dropdownValues = this.config.field.settings.DropdownValues;
      options = dropdownValues.replace(/\r/g, '').split('\n');
      options = options.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        const option = {
          label: key,
          value: (val) ? val : key
        };
        if (option.value === currentValue) { currentValueFound = true; }
        return option;
      });
    }
    if (!currentValueFound) {
      options.push({
        label: currentValue,
        value: currentValue,
      });
    }
    return options;
  }
}
