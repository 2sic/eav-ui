import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Subscription } from 'rxjs';

import { Field } from '../../../../eav-dynamic-form/model/field';
import { FieldConfigSet } from '../../../../eav-dynamic-form/model/field-config';
import { InputType } from '../../../../eav-dynamic-form/decorators/input-type.decorator';
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
export class StringDropdownComponent implements Field, OnInit, OnDestroy {
  config: FieldConfigSet;
  group: FormGroup;

  freeTextMode = false;
  selectOptions: { label: string, value: string }[] = [];
  subscriptions: Subscription[] = [];

  get enableTextEntry() {
    return this.config.field.settings.EnableTextEntry || false;
  }

  get notes() {
    return this.config.field.settings.Notes || '';
  }

  get inputInvalid() {
    return this.group.controls[this.config.field.name].invalid;
  }

  get disabled() {
    return this.group.controls[this.config.field.name].disabled;
  }

  get value() {
    return this.group.controls[this.config.field.name].value;
  }

  constructor(
    private eavService: EavService,
  ) { }

  ngOnInit() {
    this.selectOptions = this.setOptionsFromDropdownValues();
    this.freeTextMode = this.setFreeTextMode();

    const updateOptionsSub = this.eavService.formSetValueChange$.subscribe(formSet => {
      // check if update is for current form
      if (formSet.formId !== this.config.form.formId) { return; }
      // check if update is for current entity
      if (formSet.entityGuid !== this.config.entity.entityGuid) { return; }
      this.selectOptions = this.setOptionsFromDropdownValues();
    });
    this.subscriptions.push(updateOptionsSub);
  }

  freeTextModeChange(event: Event) {
    this.freeTextMode = !this.freeTextMode;
    // Stops dropdown from opening
    event.stopPropagation();
  }

  private setFreeTextMode() {
    if (this.value) {
      const isInSelectOptions: boolean = !!this.selectOptions.find(s => s.value === this.value);
      if (!isInSelectOptions && this.enableTextEntry) { return true; }
    }
    return false;
  }

  /** Read settings Dropdown values */
  private setOptionsFromDropdownValues() {
    const currentValue = this.group.controls[this.config.field.name].value;
    let currentValueFound = false;
    let options: { label: string, value: string }[] = [];
    if (this.config.field.settings.DropdownValues) {
      const dropdownValues: string = this.config.field.settings.DropdownValues;
      const dropdownValuesArray = dropdownValues.replace(/\r/g, '').split('\n');
      options = dropdownValuesArray.map(e => {
        const s = e.split(':');
        const maybeWantedEmptyVal = s[1];
        const key = s.shift(); // take first, shrink the array
        const val = s.join(':');
        const option = {
          label: key,
          value: (val || maybeWantedEmptyVal === '') ? val : key
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

  ngOnDestroy() {
    this.subscriptions.forEach(sub => { sub.unsubscribe() });
  }
}
